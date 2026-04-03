# Codiroom Vault — Quick Start (for non-technical users)

This is a small single-page app to manage simple project finances: add projects, add team members, inject funds, record expenses (direct or shared), and export full reports as PDF.

If you're not a developer, follow the quick usage guide below — no installation knowledge required to use the app in a browser if a developer has already started it for you.

## Core Concepts
- Project: a container for members, balance, and transactions.
- Member: person in the project who can be assigned expenses or share costs.
- Inject: add money to the project balance.
- Expense: subtract money from the project balance — either assigned to one member (direct) or split among members (shared).

## Quick Usage (end-user)
1. Open the app in your browser (your developer will run the app on `http://localhost:5173` or provide a hosted URL).
2. Create a new project via the `Create Project` button.
3. Add team members using `Add Team Member`.
4. To add money, use `Inject Funds` and enter amount and description.
5. To record a cost, use `Add Expense`:
   - Choose `DIRECT` to assign the entire expense to a single member.
   - Choose `SHARED` to split the expense — select which members will share, or use `All members`.
   - The app calculates and records each member's share automatically.
6. To download a full project report, use `EXPORT PDF` in the top right header.

## Details about Shared Expenses
- When you choose `SHARED`, you must select at least one member (you can select `All members`).
- The app divides the total amount equally among the selected members and updates each member's `Total Spent` accordingly.

## Saving & Backups
- Use the `SAVE` button to persist data in your browser (this uses local storage). You can also export/import a save code from the Save modal for backups.

## Troubleshooting
- If a button doesn't work, make sure a project is active and at least one member exists before adding expenses.
- To regenerate the app (developer only): run `pnpm install` and `pnpm run dev` in the `app/` folder.

## For Developers (minimum)
- Install: `pnpm install`
- Run dev server: `pnpm run dev`
- Build: `pnpm run build`

If you'd like, I can also add screenshots, a short video guide, or a printable quick-start sheet.
