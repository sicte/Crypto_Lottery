# Crypto Lottery - Multi-Winner USDT Lottery Frontend

A modern, mobile-friendly Web3 frontend for the decentralized Multi-Winner USDT Lottery smart contract. Built with Next.js 14, TypeScript, Tailwind CSS, and Wagmi/Viem.

## Features

- **Wallet Connection**: Supports MetaMask, TronLink, WalletConnect, and injected wallets
- **Live Progress Bar**: Real-time ticket sales visualization (0-30 tickets)
- **Ticket Selector**: Buy 1-30 tickets with instant probability calculation
- **Prize Pool Display**: Clear breakdown of 1st/2nd/3rd place prizes + platform fee
- **24-Hour Countdown**: Auto-refund timer with warning states
- **Past Winners**: Historical winners table with marquee ticker
- **Dark Arcade Theme**: Neon glow effects, scanlines, responsive design

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- A deployed `MultiWinnerLottery` contract
- USDT token on target network

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your contract addresses and WalletConnect Project ID
```

### Environment Variables

| Variable                               | Description                           |
| -------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID        |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_TRON`    | Deployed lottery contract on TRON     |
| `NEXT_PUBLIC_USDT_ADDRESS_TRON`        | USDT (TRC-20) on TRON                 |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_BSC`     | Deployed lottery contract on BSC      |
| `NEXT_PUBLIC_USDT_ADDRESS_BSC`         | USDT (BEP-20) on BSC                  |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON` | Deployed lottery contract on Polygon  |
| `NEXT_PUBLIC_USDT_ADDRESS_POLYGON`     | USDT on Polygon                       |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_ETH`     | Deployed lottery contract on Ethereum |
| `NEXT_PUBLIC_USDT_ADDRESS_ETH`         | USDT on Ethereum                      |

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

## Contract Integration

The frontend expects a contract with this interface:

```solidity
// Core functions
function buyTicket() external;
function buyTickets(uint256 _count) external;
function claimPrize(uint256 _ticketIndex) external;
function withdrawPlatformFee() external;
function refund() external;
function advanceRound() external;

// View functions
function totalSold() external view returns (uint256);
function roundNumber() external view returns (uint256);
function roundStartTime() external view returns (uint256);
function phase() external view returns (uint8);
function winningTickets(uint256) external view returns (uint256);
function getUserTickets(address) external view returns (uint256[]);
function timeUntilTimeout() external view returns (uint256);
function isClaimed(uint256) external view returns (bool);

// Constants
function TICKET_COST() external view returns (uint256); // 2 USDT (6 decimals)
function MAX_TICKETS() external view returns (uint256); // 30
```

## Prize Distribution

| Place            | Winners | Prize Each | Total       |
| ---------------- | ------- | ---------- | ----------- |
| 1st              | 1       | 25 USDT    | 25 USDT     |
| 2nd              | 2       | 10 USDT    | 20 USDT     |
| 3rd              | 4       | 2.5 USDT   | 10 USDT     |
| **Platform Fee** | -       | -          | **5 USDT**  |
| **Total Pool**   | -       | -          | **60 USDT** |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Web3**: Wagmi v2 + Viem
- **State**: TanStack Query v5
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── globals.css        # Global styles + Tailwind
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main page entry
├── components/
│   ├── LotteryPage.tsx    # Main orchestration component
│   ├── WalletConnect.tsx  # Wallet connection button
│   ├── ProgressBar.tsx    # Live ticket progress
│   ├── TicketSelector.tsx # Ticket quantity + probability
│   ├── PrizePool.tsx      # Prize breakdown display
│   ├── CountdownTimer.tsx # 24h refund countdown
│   └── PastWinners.tsx    # Historical winners table
├── lib/
│   ├── contracts.ts       # Contract ABIs
│   ├── constants.ts       # Addresses, chain config, formatting
│   ├── wagmi.ts           # Wagmi configuration
│   ├── providers.tsx      # React providers wrapper
│   └── hooks.ts           # Custom React hooks for contract interaction
├── .env.example           # Environment template
├── tailwind.config.ts     # Tailwind configuration
├── next.config.mjs        # Next.js configuration
└── package.json
```

## Mobile Responsiveness

- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Stacked layout on mobile, 3-column grid on desktop
- Touch-friendly button sizes
- Optimized typography scaling

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the neon color palette:

```typescript
colors: {
  neon: {
    green: "#39FF14",
    pink: "#FF10F0",
    blue: "#00F0FF",
    yellow: "#FFE500",
    orange: "#FF6B00",
  },
}
```

### Supported Networks

Add/remove chains in `lib/constants.ts`:

```typescript
export const SUPPORTED_CHAINS: Record<number, Chain> = {
  1: defineChain({...}),      // Ethereum
  56: defineChain({...}),     // BSC
  137: defineChain({...}),    // Polygon
  728126428: defineChain({...}) // TRON
};
```

## Security Notes

- All transactions use `ReentrancyGuard` on contract side
- Frontend uses `SafeERC20` for token transfers
- Wallet connections via Wagmi's secure connectors
- No private keys stored or handled in frontend

## License

MIT
