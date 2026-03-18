from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from workflows.models import Workflow, Step
from .models import Execution
from .engine import RuleEngine
# ✅ Only import from serializers.py — no duplicate definition
from .serializers import ExecutionSerializer


# ── List all executions ───────────────────────
class ExecutionListView(ListAPIView):
    queryset = Execution.objects.all().order_by('-started_at')
    serializer_class = ExecutionSerializer  # ✅ uses correct serializer


# ── Execution Engine ─────────────────────────
class ExecutionEngine:
    @staticmethod
    def run(execution, input_data):
        current_step = execution.current_step
        logs = []

        while current_step:
            start_time = timezone.now()

            next_step, evaluated_rules = RuleEngine.get_next_step(
                current_step,
                input_data
            )

            end_time = timezone.now()
            duration = str(end_time - start_time)

            log_entry = {
                "step_name": current_step.name,
                "step_type": current_step.step_type,
                "evaluated_rules": evaluated_rules,
                "selected_next_step": next_step.name if next_step else None,
                "status": "completed",
                "started_at": start_time.isoformat(),
                "ended_at": end_time.isoformat(),
                "duration": duration
            }
            logs.append(log_entry)
            current_step = next_step

        execution.status = 'completed'
        execution.logs = logs
        execution.current_step = None
        execution.ended_at = timezone.now()
        execution.save()
        return execution


# ── Start Execution ───────────────────────────
class StartExecutionView(APIView):
    def post(self, request, workflow_pk):
        try:
            workflow = Workflow.objects.get(id=workflow_pk)
        except Workflow.DoesNotExist:
            return Response(
                {"error": "Workflow not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        input_data = request.data.get('data', {})

        first_step = workflow.steps.order_by('order').first()
        if not first_step:
            return Response(
                {"error": "Workflow has no steps"},
                status=status.HTTP_400_BAD_REQUEST
            )

        execution = Execution.objects.create(
            workflow=workflow,
            workflow_version=workflow.version,
            status='in_progress',
            data=input_data,
            current_step=first_step,
            logs=[]
        )

        execution = ExecutionEngine.run(execution, input_data)

        return Response({
            "execution_id": str(execution.id),
            "status": execution.status,
            "logs": execution.logs
        }, status=status.HTTP_201_CREATED)


# ── Get Execution ─────────────────────────────
class GetExecutionView(APIView):
    def get(self, request, execution_id):
        try:
            execution = Execution.objects.get(id=execution_id)
        except Execution.DoesNotExist:
            return Response(
                {"error": "Execution not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id":               str(execution.id),
            "workflow":         str(execution.workflow.id),
            "workflow_name":    execution.workflow.name,  # ✅ correct
            "workflow_version": execution.workflow_version,
            "status":           execution.status,
            "data":             execution.data,
            "logs":             execution.logs,
            "started_at":       execution.started_at,
            "ended_at":         execution.ended_at,
        })


# ── Cancel Execution ──────────────────────────
class CancelExecutionView(APIView):
    def post(self, request, execution_id):
        try:
            execution = Execution.objects.get(id=execution_id)
            execution.status = 'cancelled'
            execution.ended_at = timezone.now()
            execution.save()
            return Response({"message": "Execution cancelled"})
        except Execution.DoesNotExist:
            return Response(
                {"error": "Not found"},
                status=status.HTTP_404_NOT_FOUND
            )


# ── Retry Execution ───────────────────────────
class RetryExecutionView(APIView):
    def post(self, request, execution_id):
        try:
            execution = Execution.objects.get(id=execution_id)
            execution.status = 'in_progress'
            execution.retries += 1
            execution.save()

            execution = ExecutionEngine.run(
                execution,
                execution.data
            )

            return Response({
                "execution_id": str(execution.id),
                "status":       execution.status,
                "retries":      execution.retries,
                "logs":         execution.logs
            })
        except Execution.DoesNotExist:
            return Response(
                {"error": "Not found"},
                status=status.HTTP_404_NOT_FOUND
            )