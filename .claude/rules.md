# DeepSOW Coding Rules & Preferences

## General
- Write clean, maintainable code with comments where necessary.
- Follow TypeScript best practices (strict mode, proper typing).
- Use functional components with hooks in React.
- Prefer serverless architecture where possible.

## Frontend (Next.js + shadcn/ui)
- Use `shadcn/ui` components for consistency; customize via Tailwind.
- Place reusable UI components in `components/ui`.
- Use `app/` directory for routing (Next.js App Router).
- Manage state with React Context or Zustand; avoid prop drilling.

## Backend (FastAPI)
- Use Pydantic models for request/response validation.
- Organize routes in separate modules (e.g., `routes/sow.py`).
- Implement error handling with custom exceptions.
- Use dependency injection for services (e.g., OpenAI service).

## Database (DynamoDB)
- Design single-table architecture where possible.
- Use `boto3` with `resource` or `client` patterns.
- Include `created_at` and `updated_at` timestamps.

## OpenAI Integration
- Use GPT-4 for parsing; craft prompts for consistent JSON output.
- Cache extracted results to avoid repeated API calls.
- Include a feedback mechanism for users to correct errors.

## Testing
- Write unit tests for critical backend logic (pytest).
- Frontend: React Testing Library + Jest.
- Aim for >80% coverage on core modules.

## Git Workflow
- Branch naming: `feature/description`, `bugfix/description`.
- Commit messages: conventional commits (feat, fix, docs, etc.).
- PRs require at least one reviewer.