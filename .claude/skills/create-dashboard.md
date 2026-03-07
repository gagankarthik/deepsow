# Skill: Build Dashboard Components

## Objective
Create reusable dashboard components using Next.js and shadcn/ui that display SOW metrics and data.

## Guidelines
- Use shadcn/ui components (Card, Table, Tabs, etc.) for consistency.
- Fetch data from FastAPI endpoints using SWR or React Query.
- Implement filtering and sorting with URL query parameters for shareable state.
- Ensure responsive design (mobile-friendly).

## Components to Build
1. **Summary Cards** – Display total SOW value, active SOW count, upcoming milestones.
2. **SOW List** – Table with columns: Client, Title, Value, Status, Dates. Include actions (view, edit).
3. **Milestone Timeline** – Visual timeline of upcoming and overdue milestones.
4. **Spend vs Budget Chart** – Bar chart comparing actual spend to budget per SOW.

## Data Fetching Example
```tsx
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function SowList() {
  const { data, error } = useSWR('/api/sows', fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <Table>
      {/* render rows */}
    </Table>
  );
}