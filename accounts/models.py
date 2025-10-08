from django.db import models
from django.contrib.auth.models import AbstractUser



class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    full_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.email if self.email else self.username
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


