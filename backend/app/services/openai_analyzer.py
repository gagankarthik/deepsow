import json
from datetime import datetime
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
