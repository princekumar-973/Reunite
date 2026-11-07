from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from apps.utils.health import health_check

urlpatterns = [
    path('', RedirectView.as_view(url='http://localhost:5173/', permanent=False), name='home-redirect'),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/items/', include('apps.items.urls')),
    path('api/v1/claims/', include('apps.claims.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
