# FinFriend

A whimsical, mobile-first budgeting prototype (class project). Three screens only:
**Dashboard → Edit Goals → See Averages**. All data is local mock data; goal edits persist in `localStorage`.

## Run

```bash
npm install
npm run dev
```

Open the printed localhost URL. On desktop the app is centered in a 390×844 phone frame.

## Demo script

1. Dashboard shows $412 spent, $1,024 remaining, Shopping $20 over its $100 goal, Safe to Spend $408.
2. Tap **Edit goals** → raise Shopping from $100 to $150 with **+** (or type it) → **Save goals**.
3. Finn celebrates; the dashboard now shows Shopping $120 / $150, "Under all your limits!", and Safe to Spend counts up to $438.
4. Tap **See averages** to compare this month with an illustrative typical month.

To reset the demo, use **Reset to starting goals** on the Edit Goals screen and save, or clear the `finfriend.goals.v1` key in localStorage.

## Where things live

- `src/data/mock.ts` – categories, spending, starting limits, mock averages
- `src/lib/budget.ts` – all budget math (safe-to-spend = sum of positive per-category allowances)
- `src/state/BudgetContext.tsx` – shared goal state + localStorage persistence
- `src/components/Finn.tsx` – the mascot (happy / concerned / celebrate moods)
- `src/screens/` – Dashboard, EditGoals, Averages
