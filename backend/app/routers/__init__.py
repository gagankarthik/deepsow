from .documents import router as documents_router
from .analysis import router as analysis_router
from .issues import router as issues_router
from .comparison import router as comparison_router
from .tasks import router as tasks_router
from .dashboard import router as dashboard_router

__all__ = [
    "documents_router",
    "analysis_router",
    "issues_router",
    "comparison_router",
    "tasks_router",
    "dashboard_router",
]
