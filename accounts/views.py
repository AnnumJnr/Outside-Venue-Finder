from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer



class UserRegistrationView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Auto-login after registration
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)



class UserLoginView(APIView):
    """
    POST /api/auth/login/
    Login user
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    



class UserLogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout user
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})
    



class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Get current user info
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)