# DeepSOW Project Overview

DeepSOW is an AI-powered Statement of Work (SOW) analyzer that extracts key commitments from SOW documents and visualizes them on a dashboard.

## Problem
Organizations lack visibility into SOW commitments, leading to compliance risks, cost overruns, and manual effort.

## Target Users
- Procurement Managers
- Professional Services Leads
- Legal Counsel
- Finance Analysts
- Sales/Account Executives

## Core Features (MVP)
- Upload SOW (PDF/DOCX) and parse with OpenAI.
- Extract parties, deliverables, milestones, pricing, dates, clauses.
- Unified dashboard with filters and summary metrics.
- Track milestones and attach evidence.
- Spend vs. budget comparison.
- User roles and permissions.

## Tech Stack
- Frontend: Next.js, shadcn/ui, TypeScript
- Backend: FastAPI (Python), OpenAI API
- Database: AWS DynamoDB
- Storage: AWS S3
- Auth: NextAuth.js / AWS Cognito
- Deployment: Vercel (frontend), AWS Lambda (backend)

## Key Constraints
- Ensure data privacy – SOWs may contain sensitive info.
- Optimize OpenAI usage to manage costs.
- Provide human review for AI-extracted data.

## Success Metrics
- 90% reduction in manual data entry time.
- >95% extraction accuracy.
- 80% weekly active users among invited.