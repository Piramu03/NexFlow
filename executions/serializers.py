from rest_framework import serializers
from .models import Execution

class ExecutionSerializer(serializers.ModelSerializer):
    # ✅ Pulls workflow name from related workflow model
    workflow_name = serializers.SerializerMethodField()

    class Meta:
        model = Execution
        fields = [
            'id',
            'workflow',
            'workflow_name',
            'workflow_version',
            'status',
            'data',
            'logs',
            'current_step',
            'retries',
            'started_at',
            'ended_at',
        ]

    def get_workflow_name(self, obj):
        try:
            return obj.workflow.name
        except:
            return 'Unknown'