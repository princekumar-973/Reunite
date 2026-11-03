from django.urls import path
from .views import ClaimListCreateView, ClaimDetailView, ClaimStatusUpdateView

app_name = 'claims'

urlpatterns = [
    path('', ClaimListCreateView.as_view(), name='claim_list_create'),
    path('<str:pk>/', ClaimDetailView.as_view(), name='claim_detail'),
    path('<str:pk>/status/', ClaimStatusUpdateView.as_view(), name='claim_status_update'),
]
