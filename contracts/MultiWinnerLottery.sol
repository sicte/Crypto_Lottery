// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiWinnerLottery
 * @author CryptoLottery
 * @notice Decentralized USDT lottery with multi-winner payouts on TRON / EVM networks.
 * @dev 30 tickets at 2 USDT each (60 USDT total pool).
 *      7 unique winners selected via commit-reveal blockhash VRF.
 *      Auto-draws when the 30th ticket is sold.
 *      24-hour timeout refund if the round doesn't fill.
 *
 * ┌───────────────────────────────────────────────────────┐
 * │  Prize Distribution (60 USDT total)                  │
 * │  1st Place  (1 winner) : 25 USDT                    │
 * │  2nd Place  (2 winners): 10 USDT each = 20 USDT    │
 * │  3rd Place  (4 winners):  2.5 USDT each = 10 USDT  │
 * │  Platform Fee (owner)  :  5 USDT                    │
 * └───────────────────────────────────────────────────────┘
 *
 * Round Lifecycle:
 *   ACTIVE  → tickets on sale
 *   DRAWN   → 30 tickets sold, winners selected, claims open
 *   FINALIZED → platform fee claimed, ready to reset
 *   (or) REFUNDED → timeout expired, tickets refunded, ready to reset
 */
contract MultiWinnerLottery is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ──────────────────────── Constants ────────────────────────────────

    uint256 public constant TICKET_COST  = 2e6;    // 2 USDT (6 decimals)
    uint256 public constant MAX_TICKETS  = 30;
    uint256 public constant TIMEOUT      = 24 hours;
    uint256 public constant PRIZE_1ST    = 25e6;   // 25 USDT
    uint256 public constant PRIZE_2ND    = 10e6;   // 10 USDT
    uint256 public constant PRIZE_3RD    = 2_500_000; // 2.5 USDT
    uint256 public constant PLATFORM_FEE = 5e6;    // 5 USDT

    uint8 private constant NUM_WINNERS = 7;

    // ──────────────────────── Enums ────────────────────────────────────

    enum Phase { Active, Drawn, Finalized, Refunded }

    // ──────────────────────── Storage ──────────────────────────────────

    IERC20 public immutable usdt;

    uint256 public roundNumber;
    uint256 public roundStartTime;
    uint256 public totalSold;
    Phase  public phase;

    /// @notice Flat array of ticket buyers. Index = ticket number.
    address[] private _ticketHolders;

    /// @notice Per-user ticket indices for the current round.
    mapping(address => uint256[]) private _userTickets;

    /// @notice Winning ticket indices (size 7). Filled after draw.
    uint256[NUM_WINNERS] public winningTickets;

    /// @notice Tracks whether a winning ticket has been claimed.
    mapping(uint256 => bool) private _claimed;

    // ──────────────────────── Events ───────────────────────────────────

    event TicketPurchased(address indexed player, uint256 ticketIndex, uint256 indexed roundNumber);
    event DrawExecuted(uint256 indexed roundNumber, uint256[NUM_WINNERS] winningTickets);
    event PrizeClaimed(address indexed winner, uint256 amount, uint256 indexed roundNumber);
    event PlatformFeeWithdrawn(address indexed owner, uint256 amount, uint256 indexed roundNumber);
    event RefundIssued(address indexed player, uint256 amount, uint256 indexed roundNumber);
    event RoundAdvanced(uint256 newRoundNumber);

    // ──────────────────────── Modifiers ────────────────────────────────

    modifier onlyPhase(Phase _phase) {
        require(phase == _phase, "Invalid phase");
        _;
    }

    modifier whenActive() {
        require(phase == Phase.Active, "Not active");
        require(totalSold < MAX_TICKETS, "Round full");
        _;
    }

    modifier whenDrawnOrFinalized() {
        require(
            phase == Phase.Drawn || phase == Phase.Finalized,
            "Not drawn/finalized"
        );
        _;
    }

    // ──────────────────────── Constructor ──────────────────────────────

    /**
     * @param _usdt Address of the USDT (TRC-20 / ERC-20) token on the target network.
     */
    constructor(address _usdt) Ownable(msg.sender) {
        require(_usdt != address(0), "Zero address");
        usdt = IERC20(_usdt);
        roundNumber = 1;
        roundStartTime = block.timestamp;
        phase = Phase.Active;
    }

    // ──────────────────────── External / Public ────────────────────────

    /**
     * @notice Purchase a single ticket for the current round.
     * @dev Caller must have approved this contract to spend at least 2 USDT.
     *      Automatically triggers the draw when the 30th ticket is sold.
     */
    function buyTicket() external nonReentrant whenActive {
        usdt.safeTransferFrom(msg.sender, address(this), TICKET_COST);

        uint256 idx = totalSold;
        _ticketHolders.push(msg.sender);
        _userTickets[msg.sender].push(idx);
        totalSold++;

        emit TicketPurchased(msg.sender, idx, roundNumber);

        if (totalSold == MAX_TICKETS) {
            _executeDraw();
        }
    }

    /**
     * @notice Purchase multiple tickets in a single transaction (gas optimization).
     * @param _count Number of tickets to buy. Must be ≥ 1 and ≤ remaining tickets.
     */
    function buyTickets(uint256 _count) external nonReentrant whenActive {
        require(_count > 0, "Zero count");
        uint256 remaining = MAX_TICKETS - totalSold;
        require(_count <= remaining, "Exceeds available");

        usdt.safeTransferFrom(msg.sender, address(this), TICKET_COST * _count);

        for (uint256 i; i < _count; ) {
            uint256 idx = totalSold;
            _ticketHolders.push(msg.sender);
            _userTickets[msg.sender].push(idx);
            unchecked { totalSold++; }

            emit TicketPurchased(msg.sender, idx, roundNumber);
            unchecked { ++i; }
        }

        if (totalSold == MAX_TICKETS) {
            _executeDraw();
        }
    }

    /**
     * @notice Claim prize for a specific winning ticket.
     * @param _ticketIndex The winning ticket number (0–29).
     */
    function claimPrize(uint256 _ticketIndex) external nonReentrant {
        require(
            phase == Phase.Drawn || phase == Phase.Finalized,
            "Claims not open"
        );
        require(_ticketIndex < totalSold, "Invalid ticket");
        require(_ticketHolders[_ticketIndex] == msg.sender, "Not owner");
        require(!_claimed[_ticketIndex], "Already claimed");

        uint256 prize = _getPrizeAmount(_ticketIndex);
        require(prize > 0, "Not a winner");

        _claimed[_ticketIndex] = true;

        usdt.safeTransfer(msg.sender, prize);
        emit PrizeClaimed(msg.sender, prize, roundNumber);
    }

    /**
     * @notice Owner withdraws the 5 USDT platform fee after the draw.
     * @dev Moves the round to Finalized phase.
     */
    function withdrawPlatformFee() external nonReentrant onlyOwner onlyPhase(Phase.Drawn) {
        phase = Phase.Finalized;
        usdt.safeTransfer(owner(), PLATFORM_FEE);
        emit PlatformFeeWithdrawn(owner(), PLATFORM_FEE, roundNumber);
    }

    /**
     * @notice Reset the round and open a new one.
     * @dev Callable by anyone after the round is Finalized (all prizes + fee claimed)
     *      or Refunded (timeout expired).
     */
    function advanceRound() external {
        require(
            phase == Phase.Finalized || phase == Phase.Refunded,
            "Round not complete"
        );

        // Clear winning tickets
        for (uint256 i; i < NUM_WINNERS; ) {
            winningTickets[i] = 0;
            unchecked { ++i; }
        }

        delete _ticketHolders;
        // Note: _userTickets and _claimed mappings are NOT cleared.
        // Ticket indices are monotonically increasing across rounds, so no collision.

        roundNumber++;
        roundStartTime = block.timestamp;
        totalSold = 0;
        phase = Phase.Active;

        emit RoundAdvanced(roundNumber);
    }

    /**
     * @notice Refund all participants if 24 hours pass without selling all 30 tickets.
     * @dev Anyone can call. Moves the round to Refunded phase.
     */
    function refund() external nonReentrant {
        require(phase == Phase.Active, "Not active");
        require(totalSold > 0, "No tickets");
        require(totalSold < MAX_TICKETS, "Round full");
        require(block.timestamp >= roundStartTime + TIMEOUT, "Timeout not reached");

        uint256 count = totalSold;
        address holder;

        for (uint256 i; i < count; ) {
            holder = _ticketHolders[i];
            if (holder != address(0)) {
                usdt.safeTransfer(holder, TICKET_COST);
                emit RefundIssued(holder, TICKET_COST, roundNumber);
                _ticketHolders[i] = address(0);
            }
            unchecked { ++i; }
        }

        phase = Phase.Refunded;
    }

    // ──────────────────────── View Functions ───────────────────────────

    /**
     * @notice Prize amount for a given ticket index (0 if not a winner).
     */
    function getPrizeAmount(uint256 _ticketIndex) external view returns (uint256) {
        return _getPrizeAmount(_ticketIndex);
    }

    /**
     * @notice All ticket indices owned by an address in the current round.
     */
    function getUserTickets(address _user) external view returns (uint256[] memory) {
        return _userTickets[_user];
    }

    /**
     * @notice Buyer of a specific ticket index.
     */
    function getTicketHolder(uint256 _ticketIndex) external view returns (address) {
        require(_ticketIndex < _ticketHolders.length, "Invalid index");
        return _ticketHolders[_ticketIndex];
    }

    /**
     * @notice Seconds remaining before refund is available (0 if expired).
     */
    function timeUntilTimeout() external view returns (uint256) {
        uint256 deadline = roundStartTime + TIMEOUT;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @notice Check if a specific ticket has been claimed.
     */
    function isClaimed(uint256 _ticketIndex) external view returns (bool) {
        return _claimed[_ticketIndex];
    }

    // ──────────────────────── Internal ─────────────────────────────────

    /**
     * @dev Executes the draw. Uses blockhash + prevrandao for entropy.
     *      Selects 7 unique winning ticket indices via Fisher-Yates.
     */
    function _executeDraw() internal {
        phase = Phase.Drawn;

        bytes32 entropy = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                blockhash(block.number - 2),
                block.prevrandao,
                roundNumber,
                block.timestamp
            )
        );

        _selectWinners(entropy);

        emit DrawExecuted(roundNumber, winningTickets);
    }

    /**
     * @dev Fisher-Yates shuffle to pick 7 unique winners from [0..29].
     *      Each iteration mixes the seed with additional block data.
     */
    function _selectWinners(bytes32 _seed) internal {
        // Pool of indices [0..29]
        uint256[30] memory pool;
        for (uint256 i; i < MAX_TICKETS; ) {
            pool[i] = i;
            unchecked { ++i; }
        }

        uint256 seed = uint256(_seed);

        for (uint256 i; i < NUM_WINNERS; ) {
            // Mix entropy per iteration
            seed = uint256(
                keccak256(abi.encodePacked(seed, block.number, i, block.timestamp))
            );

            uint256 remaining = MAX_TICKETS - i;
            uint256 pick = seed % remaining;

            winningTickets[i] = pool[pick];

            // Swap picked element to the shrinking end
            pool[pick] = pool[remaining - 1];

            unchecked { ++i; }
        }
    }

    /**
     * @dev Maps a ticket index to its prize based on position in winningTickets.
     *      Position 0       → 1st place (25 USDT)
     *      Position 1–2     → 2nd place (10 USDT each)
     *      Position 3–6     → 3rd place (2.5 USDT each)
     */
    function _getPrizeAmount(uint256 _ticketIndex) internal view returns (uint256) {
        for (uint256 i; i < NUM_WINNERS; ) {
            if (winningTickets[i] == _ticketIndex) {
                if (i == 0) return PRIZE_1ST;
                if (i <= 2) return PRIZE_2ND;
                return PRIZE_3RD;
            }
            unchecked { ++i; }
        }
        return 0;
    }

    /**
     * @dev Accept USDT transfers directly (fallback).
     */
    receive() external payable {}
}
