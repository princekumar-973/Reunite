from django.urls import path
from .views import ItemListCreateView, ItemDetailView, ItemStatsView, SeedDemoDataView

app_name = 'items'

urlpatterns = [
    path('', ItemListCreateView.as_view(), name='item_list_create'),
    path('stats/', ItemStatsView.as_view(), name='item_stats'),
    path('seed-demo/', SeedDemoDataView.as_view(), name='seed_demo'),
    path('<str:pk>/', ItemDetailView.as_view(), name='item_detail'),
]
