from django.db import models
import uuid

class Workflow(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255)
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    input_schema = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (v{self.version})"

    class Meta:
        db_table = 'workflows'


class Step(models.Model):
    STEP_TYPES = [
        ('task', 'Task'),
        ('approval', 'Approval'),
        ('notification', 'Notification'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    workflow = models.ForeignKey(
        Workflow,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    name = models.CharField(max_length=255)
    step_type = models.CharField(
        max_length=20,
        choices=STEP_TYPES
    )
    order = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.step_type})"

    class Meta:
        db_table = 'steps'
        ordering = ['order']


class Rule(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        related_name='rules'
    )
    condition = models.TextField()  # e.g "amount > 100"
    next_step = models.ForeignKey(
        Step,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incoming_rules'
    )
    priority = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rule {self.priority}: {self.condition}"

    class Meta:
        db_table = 'rules'
        ordering = ['priority']