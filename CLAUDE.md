# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commit Policy

Do not add "Co-authored-by" trailers for Claude in commits.

## Build & Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm start` | Start production server (uses $PORT) |
| `npm run contract:compile` | Compile Solidity contracts with Hardhat |
| `npm run contract:test` | Run smart contract tests (Hardhat + Chai + Waffle) |
| `npm run contract:node` | Start local Hardhat blockchain node |
| `npm run contract:deploy` | Deploy contracts to local network |
| `npm run contract:deploy-testnet` | Deploy contracts to BSC testnet |
| `npm run build:scss` | Compile, minify, and generate sourcemaps for SCSS |

To run a single contract test, use: `npx hardhat test test/<filename>.js`

Requires Node 12.x and npm 8.x.

## Architecture

This is a full-stack NFT farming game built on Binance Smart Chain (BSC).

**Frontend**: Next.js 10 + React 17 app using Reactstrap/Bootstrap 4.6 for UI. Pages live in `pages/` (Next.js routing), with game pages under `pages/game/`. State management uses Zustand (stores in `states/`). Wallet connection handled via Web3Modal + ethers.js in `components/Wallet/`.

**Smart Contracts**: 7 Solidity 0.8.4 contracts in `contracts/` built on OpenZeppelin:
- `HenToken.sol` / `EggToken.sol` — ERC20 game currencies
- `HenNFT.sol` — ERC721 hen NFTs with attributes (productivity, endurance, strength, stamina, health)
- `HenHouse.sol` — Core game logic (placing hens, collecting eggs)
- `HenSummoner.sol` — Summoning/hatching hens from eggs
- `HenHouseIco.sol` — ICO/token sale contract
- `Marketplace.sol` — Player-to-player hen trading

**Testing**: Contract tests in `test/` use Mocha/Chai with ethereum-waffle. Tests interact with deployed contract instances via ethers.js signers.

**Environment**: Contract addresses are configured via `NEXT_PUBLIC_*` env vars (see `.env.example`). Networks configured: local Hardhat (chainId 1337) and BSC Testnet (chainId 97).

**Deployment**: Docker support via `docker-compose.yml` (Node 12 Alpine + Nginx reverse proxy).
