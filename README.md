# VoxChain — The People's Ballot

Decentralized on-chain voting dApp built with Next.js 15 + ethers.js v5 on Ethereum Sepolia testnet.

## Contract
- **Address:** `0x256e1d3bd8ebcf7bd8df5458b02f5ba92224e8d3`
- **Network:** Sepolia Testnet
- **Etherscan:** https://sepolia.etherscan.io/address/0x256e1d3bd8ebcf7bd8df5458b02f5ba92224e8d3

## Features
- ✅ Create polls with up to 6 choices
- ✅ One vote per wallet address (enforced on-chain)
- ✅ Close polls (creator only)
- ✅ Delete polls (creator only, permanent)
- ✅ Live vote bars with winner highlight
- ✅ Filter polls by All / Open / Closed
- ✅ Etherscan transaction links

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo at vercel.com
3. Deploy — no env variables needed

## Project Structure
```
voxchain/
├── app/
│   ├── globals.css       # CSS variables + fonts
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── page.module.css   # Page styles
├── components/
│   ├── Header.tsx/css    # Nav + wallet connect
│   ├── PollCard.tsx/css  # Poll display + actions
│   ├── VoteModal.tsx/css # Vote casting modal
│   ├── CreatePoll.tsx/css# Create poll form
│   └── Toast.tsx/css     # Notifications
└── lib/
    ├── contract.ts       # Address + ABI
    ├── useWallet.ts      # MetaMask hook
    └── usePolls.ts       # Blockchain hooks
```
