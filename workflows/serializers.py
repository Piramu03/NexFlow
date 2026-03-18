from rest_framework import serializers
from .models import Workflow, Step, Rule

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = [
            'id',
            'step',
            'condition',
            'next_step',
            'priority',
            'created_at',
            'updated_at'
        ]

class StepSerializer(serializers.ModelSerializer):
    rules = RuleSerializer(many=True, read_only=True)

    class Meta:
        model = Step
        fields = [
            'id',
            'workflow',
            'name',
            'step_type',
            'order',
            'metadata',
            'rules',
            'created_at',
            'updated_at'
        ]

class WorkflowSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = [
            'id',
            'name',
            'version',
            'is_active',
            'input_schema',
            'steps',
            'created_at',
            'updated_at'
        ]