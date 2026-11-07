import os
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.utils.health import health_check

frontend_url = os.environ.get(
    "FRONTEND_URL",
    "https://reunite-xi.vercel.app/" if not settings.DEBUG else "http://localhost:5173/"
)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "service": "Reunite API",
        "status": "healthy",
        "frontend": "https://reunite-xi.vercel.app/",
        "endpoints": {
            "health": "/api/health/",
            "auth": "/api/v1/auth/",
            "items": "/api/v1/items/",
            "claims": "/api/v1/claims/",
        }
    })

urlpatterns = [
    path('', RedirectView.as_view(url=frontend_url, permanent=False), name='home-redirect'),
    path('api/', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/items/', include('apps.items.urls')),
    path('api/v1/claims/', include('apps.claims.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
