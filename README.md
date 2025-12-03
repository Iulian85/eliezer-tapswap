# Eliezer Rush 🐹

A premium 3D Match-3 Crypto game built for Telegram Mini Apps.

## Stack
- React 18 + Vite
- TypeScript
- React Three Fiber (3D) + React Spring
- Zustand (State)
- Tailwind CSS
- Telegram WebApp SDK

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Telegram Integration
- **Haptic Feedback**: Integrated into game moves.
- **CloudStorage**: Saves wallet balance and max level reached.
- **Theme**: Adapts partially to Telegram params, but enforces a dark theme for game aesthetics.

## Deploy
This project is ready for Vercel or Railway.
- Ensure `vite.config.ts` is set up (included).
- Use `dist/` as the publish directory.
