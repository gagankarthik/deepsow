import json
from datetime import datetime, date
from typing import Optional
from openai import OpenAI

from ..config import get_settings
from ..models.analysis import (
    Analysis,
    AnalysisStatus,
    Finding,
    RiskLevel,
    AbuseCategory,
)
from ..models.issue import Issue, IssueCreate
from ..models.sow_data import (
    SOWExtractedData,
    Employee,
    Milestone,
    ProjectPhase,
    BudgetItem,
)
from .storage import get_storage


ANALYSIS_SYSTEM_PROMPT = """You are an expert SOW (Statement of Work) document analyzer specializing in identifying vendor abuses, risks, and cost-saving opportunities.

Your task is to analyze the provided SOW document text and identify issues in these 8 categories:

1. **Intentional Scope Creep**: Vague deliverables, undefined boundaries, ambiguous language that could allow scope expansion
2. **Fabrication of Documentation**: Inconsistent timelines, contradictory statements, unrealistic claims
3. **False Standards Compliance**: Unverifiable compliance claims, vague references to standards without specifics
4. **Gaming the Audit**: Restricted access clauses, limitations on verification, audit obstacles
5. **Lack of Independence**: Conflicts of interest, vendor self-certification, insufficient oversight
6. **Inflated Staffing**: Excessive team sizes relative to scope, redundant roles, unnecessary positions
7. **Unqualified Staff**: Missing qualifications, vague experience claims, inadequate certifications
8. **Omitted Critical Areas**: Missing risk sections, absent security considerations, incomplete deliverables

For each issue found, provide:
- A clear title
- Detailed description of the problem
- Specific evidence from the document (quote the relevant text)
- Risk level (low, medium, high, critical)
- Estimated cost impact if applicable
- Specific recommendation for remediation
- Page reference if available

Be thorough but avoid false positives. Only flag genuine concerns with clear evidence."""

ANALYSIS_USER_PROMPT = """Analyze the following SOW document and identify all potential vendor abuses, risks, and cost-saving opportunities.

Document Content:
{document_text}

Vendor: {vendor_name}
Contract Value: ${contract_value:,.2f}

Respond with a JSON object in this exact format:
{{
    "findings": [
        {{
            "category": "one of: intentional_scope_creep, fabrication_of_documentation, false_standards_compliance, gaming_the_audit, lack_of_independence, inflated_staffing, unqualified_staff, omitted_critical_areas",
            "title": "Brief issue title",
            "description": "Detailed description of the issue",
            "evidence": "Direct quote or reference from the document",
            "risk_level": "one of: low, medium, high, critical",
            "estimated_savings": null or number (estimated cost savings if addressed),
            "recommendation": "Specific action to take",
            "page_reference": "Page number or section reference if available"
        }}
    ],
    "summary": "Executive summary of the analysis (2-3 sentences)",
    "risk_score": number from 0-100 (overall risk score),
    "total_estimated_savings": number or null
}}

Provide only the JSON response, no additional text."""


class OpenAIAnalyzer:
    """Service for analyzing SOW documents using OpenAI."""

    def __init__(self):
        settings = get_settings()
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.storage = get_storage()

    async def analyze_document(
        self,
        analysis_id: str,
        document_text: str,
        vendor_name: str,
        contract_value: float,
    ) -> Analysis:
        """Analyze a SOW document and return findings."""
        analysis = self.storage.get_analysis(analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")

        try:
            # Update status to processing
            analysis.status = AnalysisStatus.PROCESSING
            analysis.started_at = datetime.utcnow()
            analysis.progress = 10
            analysis.current_step = "Preparing document for analysis"
            self.storage.save_analysis(analysis)

            # Prepare the prompt
            analysis.progress = 20
            analysis.current_step = "Sending to OpenAI for analysis"
            self.storage.save_analysis(analysis)

            user_prompt = ANALYSIS_USER_PROMPT.format(
                document_text=document_text[:50000],  # Limit text length
                vendor_name=vendor_name,
                contract_value=contract_value or 0,
            )

            # Call OpenAI API
            analysis.progress = 40
            analysis.current_step = "Analyzing document content"
            self.storage.save_analysis(analysis)

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )

            # Parse response
            analysis.progress = 70
            analysis.current_step = "Processing analysis results"
            self.storage.save_analysis(analysis)

            result_text = response.choices[0].message.content
            result_data = json.loads(result_text)

            # Convert findings to Finding objects
            findings = []
            for finding_data in result_data.get("findings", []):
                try:
                    finding = Finding(
                        category=AbuseCategory(finding_data["category"]),
                        title=finding_data["title"],
                        description=finding_data["description"],
                        evidence=finding_data["evidence"],
                        risk_level=RiskLevel(finding_data["risk_level"]),
                        estimated_savings=finding_data.get("estimated_savings"),
                        recommendation=finding_data["recommendation"],
                        page_reference=finding_data.get("page_reference"),
                    )
                    findings.append(finding)
                except (KeyError, ValueError) as e:
                    # Skip invalid findings
                    continue

            # Update analysis with results
            analysis.progress = 90
            analysis.current_step = "Generating issues"
            self.storage.save_analysis(analysis)

            analysis.findings = findings
            analysis.summary = result_data.get("summary", "Analysis complete.")
            analysis.risk_score = result_data.get("risk_score", 50)
            analysis.total_estimated_savings = result_data.get("total_estimated_savings")

            # Create issues from findings
            for finding in findings:
                issue = Issue(
                    analysis_id=analysis.id,
                    document_id=analysis.document_id,
                    finding_id=finding.id,
                    category=finding.category.value,
                    title=finding.title,
                    description=finding.description,
                    evidence=finding.evidence,
                    risk_level=finding.risk_level.value,
                    estimated_savings=finding.estimated_savings,
                    recommendation=finding.recommendation,
                    page_reference=finding.page_reference,
                )
                self.storage.save_issue(issue)

            # Extract comprehensive SOW data
            analysis.progress = 95
            analysis.current_step = "Extracting project details"
            self.storage.save_analysis(analysis)

            try:
                sow_data = self.extract_sow_data(
                    document_id=analysis.document_id,
                    document_text=document_text,
                    vendor_name=vendor_name,
                    contract_value=contract_value,
                )
                sow_data.analysis_id = analysis.id
                self.storage.save_sow_data(sow_data)
            except Exception as e:
                # SOW extraction is non-critical, continue even if it fails
                pass

            # Mark as completed
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.utcnow()
            analysis.progress = 100
            analysis.current_step = "Analysis complete"
            self.storage.save_analysis(analysis)

            return analysis

        except Exception as e:
            # Mark as failed
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            analysis.current_step = "Analysis failed"
            self.storage.save_analysis(analysis)
            raise

    def get_comparison_analysis(
        self,
        text1: str,
        text2: str,
        vendor1: str,
        vendor2: str,
    ) -> dict:
        """Compare two SOW documents and identify differences."""
        comparison_prompt = f"""Compare these two SOW documents and identify key differences:

Document 1 (Vendor: {vendor1}):
{text1[:20000]}

Document 2 (Vendor: {vendor2}):
{text2[:20000]}

Provide a JSON response with:
{{
    "key_differences": [
        {{
            "aspect": "Area of difference (e.g., pricing, scope, timeline)",
            "document1": "What Document 1 says",
            "document2": "What Document 2 says",
            "recommendation": "Which is better and why"
        }}
    ],
    "summary": "Overall comparison summary",
    "recommendation": "Which document is preferable overall and why"
}}"""

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert at comparing SOW documents."},
                {"role": "user", "content": comparison_prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    def extract_sow_data(
        self,
        document_id: str,
        document_text: str,
        vendor_name: str,
        contract_value: float,
    ) -> SOWExtractedData:
        """Extract comprehensive SOW data from document."""
        extraction_prompt = f"""Extract structured data from this SOW document. Return a JSON object with the following structure:

{{
    "project_name": "Name of the project",
    "project_description": "Brief description of the project",
    "start_date": "YYYY-MM-DD or null",
    "end_date": "YYYY-MM-DD or null",
    "total_budget": number or null,
    "spent_to_date": number or null (estimate if mentioned),
    "employees": [
        {{
            "name": "Person's name",
            "role": "Job title/role",
            "qualification": "Education, certifications, experience",
            "rate": hourly/daily rate if mentioned or null,
            "hours_allocated": estimated hours or null,
            "department": "Department if mentioned"
        }}
    ],
    "milestones": [
        {{
            "name": "Milestone name",
            "description": "Brief description",
            "due_date": "YYYY-MM-DD or null",
            "progress": 0-100 (estimate based on context),
            "status": "pending/in_progress/completed/delayed",
            "deliverables": ["list of deliverables"]
        }}
    ],
    "phases": [
        {{
            "name": "Phase name",
            "start_date": "YYYY-MM-DD or null",
            "end_date": "YYYY-MM-DD or null",
            "progress": 0-100,
            "budget": allocated budget or null,
            "spent": spent amount or null
        }}
    ],
    "budget_items": [
        {{
            "category": "Category name (Labor, Equipment, Travel, etc.)",
            "description": "Description",
            "planned_amount": number,
            "actual_amount": number or 0
        }}
    ],
    "tasks": [
        {{
            "title": "Task name",
            "description": "Task description",
            "assigned_to": "Person name or null",
            "status": "not_started/in_progress/completed",
            "priority": "low/medium/high/critical",
            "start_date": "YYYY-MM-DD or null",
            "end_date": "YYYY-MM-DD or null",
            "progress": 0-100
        }}
    ],
    "overall_progress": 0-100 (estimate overall project progress)
}}

Document Content:
{document_text[:40000]}

Vendor: {vendor_name}
Contract Value: ${contract_value:,.2f}

Extract as much information as possible. For missing data, use reasonable estimates or null. For employees, look for team members, staff, resources mentioned. For milestones, look for deliverables, deadlines, phases. Return valid JSON only."""

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at extracting structured data from SOW documents. Extract all relevant project information including team members, milestones, phases, budgets, and tasks. Be thorough and accurate.",
                },
                {"role": "user", "content": extraction_prompt},
            ],
            temperature=0.2,
            max_tokens=4000,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)

        # Parse dates helper
        def parse_date(date_str):
            if not date_str:
                return None
            try:
                return datetime.strptime(date_str, "%Y-%m-%d").date()
            except:
                return None

        # Create employees
        employees = []
        for emp_data in result.get("employees", []):
            try:
                employees.append(Employee(
                    name=emp_data.get("name", "Unknown"),
                    role=emp_data.get("role", "Team Member"),
                    qualification=emp_data.get("qualification"),
                    rate=emp_data.get("rate"),
                    hours_allocated=emp_data.get("hours_allocated"),
                    department=emp_data.get("department"),
                ))
            except:
                continue

        # Create milestones
        milestones = []
        for ms_data in result.get("milestones", []):
            try:
                milestones.append(Milestone(
                    name=ms_data.get("name", "Milestone"),
                    description=ms_data.get("description"),
                    due_date=parse_date(ms_data.get("due_date")),
                    progress=ms_data.get("progress", 0),
                    status=ms_data.get("status", "pending"),
                    deliverables=ms_data.get("deliverables", []),
                ))
            except:
                continue

        # Create phases
        phases = []
        for phase_data in result.get("phases", []):
            try:
                phases.append(ProjectPhase(
                    name=phase_data.get("name", "Phase"),
                    start_date=parse_date(phase_data.get("start_date")),
                    end_date=parse_date(phase_data.get("end_date")),
                    progress=phase_data.get("progress", 0),
                    budget=phase_data.get("budget"),
                    spent=phase_data.get("spent"),
                ))
            except:
                continue

        # Create budget items
        budget_items = []
        for bi_data in result.get("budget_items", []):
            try:
                budget_items.append(BudgetItem(
                    category=bi_data.get("category", "General"),
                    description=bi_data.get("description"),
                    planned_amount=bi_data.get("planned_amount", 0),
                    actual_amount=bi_data.get("actual_amount", 0),
                    variance=bi_data.get("planned_amount", 0) - bi_data.get("actual_amount", 0),
                ))
            except:
                continue

        # Calculate duration
        start_date = parse_date(result.get("start_date"))
        end_date = parse_date(result.get("end_date"))
        duration_days = None
        if start_date and end_date:
            duration_days = (end_date - start_date).days

        # Calculate total FTE and labor cost
        total_fte = len(employees) if employees else None
        labor_cost = sum(
            (e.rate or 0) * (e.hours_allocated or 0)
            for e in employees
        ) or None

        # Calculate remaining budget
        total_budget = result.get("total_budget") or contract_value
        spent_to_date = result.get("spent_to_date") or 0
        remaining_budget = (total_budget - spent_to_date) if total_budget else None

        sow_data = SOWExtractedData(
            document_id=document_id,
            project_name=result.get("project_name") or vendor_name,
            project_description=result.get("project_description"),
            start_date=start_date,
            end_date=end_date,
            duration_days=duration_days,
            total_budget=total_budget,
            spent_to_date=spent_to_date,
            remaining_budget=remaining_budget,
            budget_items=budget_items,
            employees=employees,
            total_fte=total_fte,
            labor_cost=labor_cost,
            milestones=milestones,
            phases=phases,
            tasks=result.get("tasks", []),
            overall_progress=result.get("overall_progress", 0),
        )

        self.storage.save_sow_data(sow_data)
        return sow_data
