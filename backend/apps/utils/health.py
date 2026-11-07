from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .mongodb import verify_mongo_connection

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint verifying Django and MongoDB status."""
    mongo_ok, mongo_msg = verify_mongo_connection()
    status_code = 200 if mongo_ok else 503
    return Response({
        "status": "healthy" if mongo_ok else "unhealthy",
        "service": "Reunite API",
        "django": "running",
        "mongodb": {
            "connected": mongo_ok,
            "message": mongo_msg
        }
    }, status=status_code)
