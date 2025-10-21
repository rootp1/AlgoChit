# AlgoChit Frontend

React-based user interface for AlgoChit chit fund management.

## Overview

Modern web application built with:
- React 18
- TypeScript
- Vite
- TailwindCSS

## Features

- Dashboard with chit fund statistics
- Contribution form for monthly payments
- Bidding interface for auction participation
- Manager panel for administration

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Components

### Dashboard
Displays current chit fund state:
- Current month
- Total members
- Monthly contribution amount
- Active status
- Total chit value

### ContributeForm
Allows members to submit monthly contributions.

### BidForm
Interface for submitting discount bids.

### ManagerPanel
Administrative controls:
- Add members
- Start chit fund
- Distribute pot to winner

## API Integration

All API calls are in `src/services/api.ts`.

Backend URL: `http://localhost:3000/api/chitfund`

## Development

```bash
# Development server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Styling

Uses TailwindCSS utility classes.

Config: `tailwind.config.js`

## Production Build

```bash
npm run build
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

## Future Enhancements

- Wallet integration (PeraWallet, Defly)
- Transaction history viewer
- Real-time updates via WebSocket
- Mobile responsive improvements
- Dark mode
- Multi-language support
