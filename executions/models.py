from django.db import models
import uuid

class Execution(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    workflow = models.ForeignKey(
        'workflows.Workflow',
        on_delete=models.CASCADE,
        related_name='executions'
    )
    workflow_version = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    data = models.JSONField(default=dict)   # input data
    logs = models.JSONField(default=list)   # step logs
    current_step = models.ForeignKey(
        'workflows.Step',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    retries = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Execution {self.id} - {self.status}"

    class Meta:
        db_table = 'executions'