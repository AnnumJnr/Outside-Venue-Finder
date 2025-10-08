from rest_framework import serializers
from .models import Category, Venue, VenueImage, Amenity, VenueAmenity, SearchHistory
from django.contrib.auth import get_user_model


User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    '''
    serializer for category model
    '''

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description']




class VenueImageSerializer(serializers.ModelSerializer):
     """
     Serializer for Venue Images
     """
     class Meta:
        model = VenueImage
        fields = ['id', 'image', 'is_primary', 'caption']




class AmenitySerializer(serializers.ModelSerializer):
    """
    Serializer for Amenities
    """
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'icon']




class VenueListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for venue list view
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'category_name', 'category_icon',
            'city', 'area', 'address', 'latitude', 'longitude',
            'price_range', 'rating', 'thumbnail'
        ]
    
    def get_thumbnail(self, obj):
        """Get the primary image or first image"""
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
        return None




class VenueDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single venue view
    """
    category = CategorySerializer(read_only=True)
    images = VenueImageSerializer(many=True, read_only=True)
    amenities_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'category', 'description',
            'city', 'area', 'address', 'latitude', 'longitude',
            'price_range', 'rating', 'phone_number', 'website',
            'opening_hours', 'images', 'amenities_list',
            'created_at', 'updated_at'
        ]
    
    def get_amenities_list(self, obj):
        """Get all amenities for this venue"""
        venue_amenities = VenueAmenity.objects.filter(venue=obj).select_related('amenity')
        return AmenitySerializer([va.amenity for va in venue_amenities], many=True).data


  
    

class SearchHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for Search History
    """
    class Meta:
        model = SearchHistory
        fields = ['id', 'category', 'city', 'area', 'searched_at']
        read_only_fields = ['searched_at']