from django.contrib import admin
from .models import Category, Venue, VenueImage, Amenity, VenueAmenity, SearchHistory



@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'city', 'area', 'price_range', 'rating', 'is_active']
    list_filter = ['category', 'city', 'price_range', 'is_active']
    search_fields = ['name', 'city', 'area', 'address']
    ordering = ['-created_at']

@admin.register(VenueImage)
class VenueImageAdmin(admin.ModelAdmin):
    list_display = ['venue', 'is_primary', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']

@admin.register(VenueAmenity)
class VenueAmenityAdmin(admin.ModelAdmin):
    list_display = ['venue', 'amenity']
    list_filter = ['amenity']

@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'city', 'area', 'searched_at']
    list_filter = ['category', 'searched_at']
    search_fields = ['user__username', 'city', 'area']
    ordering = ['-searched_at']