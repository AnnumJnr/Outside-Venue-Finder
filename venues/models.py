from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Category(models.Model):
    #Categories for venues (Restaurant, Cafe, Bar, etc.)

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='📍')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    



class Venue(models.Model):
    """
    Main Venue/Location model
    """
    PRICE_CHOICES = [
        ('$', 'Budget'),
        ('$$', 'Moderate'),
        ('$$$', 'Expensive'),
        ('$$$$', 'Very Expensive'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='venues')#will want to work on the on_delete section
    description = models.TextField()
    
    # Location
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)  # Neighborhood/District
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Details
    price_range = models.CharField(max_length=5, choices=PRICE_CHOICES, default='₵₵')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    phone_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    
    # Meta
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.city}"
    
    class Meta:
        verbose_name = 'Venue'
        verbose_name_plural = 'Venues'
        ordering = ['-created_at']




class VenueImage(models.Model):
    """
    Multiple images for each venue
    """
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='venue_images/')
    is_primary = models.BooleanField(default=False) #seek clarification
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.venue.name}"
    
    class Meta:
        verbose_name = 'Venue Image'
        verbose_name_plural = 'Venue Images'
        ordering = ['-is_primary', '-uploaded_at']



class Amenity(models.Model):
    """
    Services/Amenities that venues offer
    """
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='✓')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Amenity'
        verbose_name_plural = 'Amenities'
        ordering = ['name']




class VenueAmenity(models.Model):
    """
    Link venues to amenities (many-to-many relationship)
    """
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.venue.name} - {self.amenity.name}"
    
    class Meta:
        verbose_name = 'Venue Amenity'
        verbose_name_plural = 'Venue Amenities'
        unique_together = ['venue', 'amenity']



class SearchHistory(models.Model):
    """
    Store user search history
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history')
    category = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    searched_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        location = f"{self.city}, {self.area}" if self.area else self.city
        return f"{self.user.username} - {self.category} in {location}"
    
    class Meta:
        verbose_name = 'Search History'
        verbose_name_plural = 'Search Histories'
        ordering = ['-searched_at']