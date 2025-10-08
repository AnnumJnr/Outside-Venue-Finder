from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    CurrentUserView
)


app_name = 'accounts'


urlpatterns = [
    # POST /api/auth/register/
    path('register/', UserRegistrationView.as_view(), name='register'),
    
    # POST /api/auth/login/
    path('login/', UserLoginView.as_view(), name='login'),
    
    # POST /api/auth/logout/
    path('logout/', UserLogoutView.as_view(), name='logout'),
    
    # GET /api/auth/me/
    path('me/', CurrentUserView.as_view(), name='current-user'),
]