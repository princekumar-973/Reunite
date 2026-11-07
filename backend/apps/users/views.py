from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            "message": "User registered successfully",
            "user": user_data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data

        # Update basic user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        user.save()

        # Update profile fields
        profile = user.profile
        profile_fields = ['phone', 'department', 'campus_location', 'avatar_url']
        for field in profile_fields:
            if field in data:
                setattr(profile, field, data[field])
        profile.save()

        return Response(UserSerializer(user).data)


class DemoAuthView(APIView):
    """Automatically logs in or creates the demo user on first use."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@reunite.app',
                'first_name': 'Demo',
                'last_name': 'User',
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'phone': '+1 (555) 019-2834',
                    'department': 'Campus Community',
                    'campus_location': 'Main Library Plaza'
                }
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            "message": "Demo login successful",
            "user": user_data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
