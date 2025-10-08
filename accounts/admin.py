from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User



@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'full_name', 'is_staff', 'created_at']
    list_filter = ['is_staff', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('full_name',)}),
    )

#This is a cool feature to use when you have a customized user model
