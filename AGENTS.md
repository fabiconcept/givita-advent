# Givita - Agent Notes

## Stack
- Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui
- pnpm
- Data: Google Sheets (read/write via `googleapis`); in-memory fallback when no credentials

## Database: Google Sheets
- Spreadsheet ID: `GOOGLE_SHEET_ID` (env)
- Auth: `GOOGLE_APPLICATION_CREDENTIALS_JSON` (raw JSON) or `GOOGLE_APPLICATION_CREDENTIALS` (file path). Service account must be shared on the sheet as Editor.
- All sheet operations go through `lib/google-sheets.ts` - never call the Sheets API directly from a route handler.
- Service exports: `readRows(tab, opts?)`, `appendRow(tab, data)`, `updateRow(tab, rowNumber, data)`, `deleteRow(tab, rowNumber)`, `invalidateCache(tab?)`, `isSheetsAvailable()`.
- Read cache: in-memory, 30s TTL per tab. Pass `{ skipCache: true }` to bypass.

## Sheet schema
- `Forms` tab: `id, title, description, isPublished, createdAt, updatedAt, questionsJson`
  - `questionsJson` is a JSON-stringified `FormQuestion[]` (one column keeps the API simple; trade off vs. a separate `Questions` tab).
- `Responses` tab: `id, formId, submittedAt, answersJson`
  - `answersJson` is a JSON-stringified `Record<string, string | string[] | number>`.
- First row of every tab is the header (lowercased column names). `lib/google-sheets.ts` lowercases headers on read and creates the header row on first append.

## Forms store
- `lib/formStore.ts` is the only module that should be imported by route handlers. It backs onto `lib/google-sheets.ts` and falls back to in-memory storage when Sheets is unconfigured.
- Public API: `getForm`, `getAllForms`, `createForm`, `updateForm`, `deleteForm`, `addResponse`, `getResponses`, `getResponseStats` (all async).
- The sample `community-fundraising` form is seeded on first read if the `Forms` tab is empty.

## Limitations (accepted)
- No query language. We always read the full tab and filter in code.
- Rate limits: 60 requests / 60s per project.
- No atomic transactions (no rollback if a write fails mid-operation).
- 10M cells / spreadsheet; 50,000 chars per cell.
- Reads are cached in-memory for 30s - intentional, to avoid hammering the API.

## Setup
1. Create a Google Cloud project, enable the Google Sheets API, create a service account, download the JSON key.
2. Create a Google Sheet with two tabs: `Forms` and `Responses` (empty header rows fine - the store will write them on first append).
3. Share the sheet with the service account email (Editor).
4. Copy `.env.example` to `.env.local` and fill in `GOOGLE_SHEET_ID` + one of the credential vars.
5. `pnpm install && pnpm dev` and visit `/login` (password: `ADMIN_PASSWORD` env, default `admin123`).

## Build / dev
- `pnpm build` - production build (passes with 14 routes; pre-existing `/admin` dynamic cookie warning is benign)
- `pnpm dev` - dev server
