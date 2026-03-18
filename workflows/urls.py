from rest_framework_nested import routers
from .views import WorkflowViewSet, StepViewSet, RuleViewSet

# Main router
router = routers.DefaultRouter()
router.register(r'workflows', WorkflowViewSet, basename='workflow')

# Nested: /workflows/{id}/steps
workflow_router = routers.NestedDefaultRouter(
    router,
    r'workflows',
    lookup='workflow'
)
workflow_router.register(
    r'steps',
    StepViewSet,
    basename='workflow-steps'
)

# Nested: /steps/{id}/rules
steps_router = routers.NestedDefaultRouter(
    workflow_router,
    r'steps',
    lookup='step'
)
steps_router.register(
    r'rules',
    RuleViewSet,
    basename='step-rules'
)

urlpatterns = (
    router.urls +
    workflow_router.urls +
    steps_router.urls
)