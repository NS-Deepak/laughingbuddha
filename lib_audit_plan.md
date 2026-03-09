# Audit of lib/ directory

## Files to Keep
- `utils.ts` (Standard UI utils)
- `hooks.ts` (Frontend hooks)
- `actions.ts` (Server actions for user preferences?)
- `alert-actions.ts` (Server actions for creating alerts from UI)

## Files to Delete
- `telegram.ts` (Migrated to Python backend/bot/telegram.py)
- `inngest/` (Migrated to Python backend/scheduler.py)
- `price.ts` (Used by Inngest mostly? Check if UI uses it)

## Decision Logic
- If `price.ts` is only used by `inngest`, delete it.
- If `actions.ts` calls `telegram`, refactor it or delete if unused.
