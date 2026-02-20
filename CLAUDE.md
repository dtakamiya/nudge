# Nudge - 1on1 Meeting Tracker

## Overview

Nudge は 1on1 ミーティングの記録・管理を行うシングルユーザー向けローカル Web アプリケーション。
メンバー管理、ミーティング記録（トピック・アクションアイテム）、進捗トラッキングを提供する。

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Database:** Prisma ORM + SQLite
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Validation:** Zod 4
- **Testing:** Vitest + Testing Library + jsdom
- **Language:** TypeScript 5 (strict mode)

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/            # Action items dashboard
│   ├── members/            # Member CRUD & meeting pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── action/             # Action item components
│   ├── meeting/            # Meeting components
│   ├── member/             # Member components
│   └── ui/                 # shadcn/ui base components
├── generated/prisma/       # Prisma generated client (gitignored)
└── lib/
    ├── actions/            # Server Actions (data mutations)
    ├── validations/        # Zod schemas
    ├── prisma.ts           # Prisma client singleton
    ├── constants.ts        # App constants
    ├── format.ts           # Date formatting utilities
    └── utils.ts            # General utilities (cn)
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # Seed data
└── migrations/             # Migration files
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier format all files
npm run format:check # Prettier check (CI)
npm test             # Run tests (vitest run)
npm run test:watch   # Run tests in watch mode

# Database
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open Prisma Studio
```

## Coding Conventions

### Server Actions Pattern
- All data mutations use Next.js Server Actions in `src/lib/actions/`
- Each action validates input with Zod schemas from `src/lib/validations/`
- Actions use `"use server"` directive
- Return typed results for error handling

### General Rules
- **Immutability:** Always create new objects, never mutate
- **TDD:** Write tests first (RED → GREEN → REFACTOR)
- **UI Text:** Japanese for user-facing text
- **Primary Keys:** UUID (`@id @default(uuid())`)
- **Path Alias:** Use `@/*` for imports (maps to `src/*`)
- **File Size:** Keep files under 400 lines (800 max)
- **Functions:** Keep under 50 lines

### Database
- SQLite via Prisma ORM
- `DATABASE_URL` in `.env` (e.g., `file:./dev.db`)
- Test DB uses `file:./test.db` (configured in vitest.config.ts)

### Testing
- Test files: `src/**/*.test.{ts,tsx}` colocated with source in `__tests__/` dirs
- Minimum 80% coverage target
- Mock Prisma client in unit tests
- Use `@testing-library/react` for component tests
