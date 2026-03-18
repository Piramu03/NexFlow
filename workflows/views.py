from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Workflow, Step, Rule
from .serializers import (
    WorkflowSerializer,
    StepSerializer,
    RuleSerializer
)

# ─── Workflow CRUD ───────────────────────────
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all().order_by('-created_at')
    serializer_class = WorkflowSerializer

    # Auto increment version on update
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.version += 1
        instance.save()
        return super().update(request, *args, **kwargs)

    # Search & filter
    def get_queryset(self):
        queryset = Workflow.objects.all()
        search = self.request.query_params.get('search')
        is_active = self.request.query_params.get('is_active')

        if search:
            queryset = queryset.filter(name__icontains=search)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        return queryset.order_by('-created_at')


# ─── Step CRUD ───────────────────────────────
class StepViewSet(viewsets.ModelViewSet):
    serializer_class = StepSerializer

    def get_queryset(self):
        workflow_id = self.kwargs.get('workflow_pk')
        return Step.objects.filter(
            workflow_id=workflow_id
        ).order_by('order')

    def perform_create(self, serializer):
        workflow_id = self.kwargs.get('workflow_pk')
        workflow = Workflow.objects.get(id=workflow_id)
        serializer.save(workflow=workflow)


# ─── Rule CRUD ───────────────────────────────
class RuleViewSet(viewsets.ModelViewSet):
    serializer_class = RuleSerializer

    def get_queryset(self):
        step_id = self.kwargs.get('step_pk')
        return Rule.objects.filter(
            step_id=step_id
        ).order_by('priority')

    def perform_create(self, serializer):
        step_id = self.kwargs.get('step_pk')
        step = Step.objects.get(id=step_id)
        serializer.save(step=step)