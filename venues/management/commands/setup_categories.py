from django.core.management.base import BaseCommand
from venues.models import Category, Amenity


class Command(BaseCommand):
    help = 'Setup categories and amenities (no sample venues)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Setting up categories and amenities...'))
        
        # Create Categories
        self.stdout.write('\nCreating categories...')
        categories_data = [
            {'name': 'Restaurants', 'slug': 'restaurant', 'icon': '🍽️', 'description': 'Great places to eat'},
            {'name': 'Cafes', 'slug': 'cafe', 'icon': '☕', 'description': 'Coffee and snacks'},
            {'name': 'Entertainment', 'slug': 'entertainment', 'icon': '🎪', 'description': 'Fun and games'},
            {'name': 'Lounges', 'slug': 'lounge', 'icon': '🛋️', 'description': 'Relaxation spots'},
            {'name': 'Cinemas', 'slug': 'cinema', 'icon': '🎬', 'description': 'Movie theaters'},
            {'name': 'Bars', 'slug': 'bar', 'icon': '🍺', 'description': 'Drinks and nightlife'},
        ]
        
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'  ✓ Created category: {cat.name}')
            else:
                self.stdout.write(f'  - Category already exists: {cat.name}')
        
        # Create Amenities
        self.stdout.write('\nCreating amenities...')
        amenities_data = [
            {'name': 'WiFi', 'icon': '📶'},
            {'name': 'Parking', 'icon': '🅿️'},
            {'name': 'Outdoor Seating', 'icon': '🌳'},
            {'name': 'Air Conditioning', 'icon': '❄️'},
            {'name': 'Card Payment', 'icon': '💳'},
            {'name': 'Wheelchair Accessible', 'icon': '♿'},
            {'name': 'Live Music', 'icon': '🎵'},
            {'name': 'Delivery Available', 'icon': '🚚'},
            {'name': 'Pet Friendly', 'icon': '🐕'},
            {'name': 'Private Rooms', 'icon': '🚪'},
        ]
        
        for am_data in amenities_data:
            am, created = Amenity.objects.get_or_create(
                name=am_data['name'],
                defaults=am_data
            )
            if created:
                self.stdout.write(f'  ✓ Created amenity: {am.name}')
            else:
                self.stdout.write(f'  - Amenity already exists: {am.name}')
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Setup completed successfully!'))
        self.stdout.write(f'  Categories: {Category.objects.count()}')
        self.stdout.write(f'  Amenities: {Amenity.objects.count()}')
        self.stdout.write('\nYou can now fetch real venues using:')
        self.stdout.write('  python manage.py fetch_venues_free --city="Kumasi" --category="restaurant" --source="osm"')
        self.stdout.write('='*50)