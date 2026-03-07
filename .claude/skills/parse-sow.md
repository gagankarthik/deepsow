# Skill: Parse SOW with OpenAI

## Objective
Extract structured data from an uploaded SOW document (PDF/DOCX) using OpenAI.

## Input
- Raw text extracted from the document (via `pdfplumber` or `python-docx`).
- Optional: SOW ID for caching.

## Process
1. Construct a prompt that instructs GPT-4 to output JSON with the following fields:
   - `parties`: [ { name, role } ]
   - `deliverables`: [ { description, dueDate, acceptanceCriteria } ]
   - `milestones`: [ { name, dueDate, paymentAmount } ]
   - `pricing`: { totalValue, currency, paymentSchedule }
   - `dates`: { startDate, endDate, effectiveDate }
   - `clauses`: [ { type, text } ] (types: IP, termination, confidentiality, etc.)

2. Send the prompt to OpenAI with temperature=0.2 for consistent output.

3. Parse the JSON response; validate against a Pydantic model.

4. If validation fails, retry with a more explicit prompt or log for manual review.

5. Store extracted data in DynamoDB and associate with the SOW record.

## Example Prompt