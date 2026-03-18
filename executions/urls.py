from django.urls import path
from .views import (
    ExecutionListView,
    StartExecutionView,
    GetExecutionView,
    CancelExecutionView,
    RetryExecutionView
    
)

urlpatterns = [
    path('executions/', 
        ExecutionListView.as_view(), 
        name='execution-list'
    ),
    path(
        'workflows/<uuid:workflow_pk>/execute/',
        StartExecutionView.as_view(),
        name='start-execution'
    ),
    path(
        'executions/<uuid:execution_id>/',
        GetExecutionView.as_view(),
        name='get-execution'
    ),
    path(
        'executions/<uuid:execution_id>/cancel/',
        CancelExecutionView.as_view(),
        name='cancel-execution'
    ),
    path(
        'executions/<uuid:execution_id>/retry/',
        RetryExecutionView.as_view(),
        name='retry-execution'
    ),
]