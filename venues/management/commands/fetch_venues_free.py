import requests
import time
from decimal import Decimal
from django.core.management.base import BaseCommand
from venues.models import Category, Venue


class Command(BaseCommand):
    help = "Fetch venues from OpenStreetMap (Overpass API) for Ghanaian cities"

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=50, help='Limit number of results per category')

    def handle(self, *args, **options):
        limit = options['limit']

        # ✅ Skip Accra (already fetched)
        cities = ["Kumasi", "Takoradi", "Tamale", "Tema"]

        # ✅ Use your original category slugs from your model
        categories = [
            "restaurant",
            "cafe",
            "bar",
            "cinema",
            "entertainment",
            "lounge",
        ]

        for city in cities:
            self.stdout.write(self.style.SUCCESS(f"\n🇬🇭 Fetching venues for {city}, Ghana...\n"))
            for category_slug in categories:
                try:
                    # Match Category object
                    try:
                        category = Category.objects.get(slug=category_slug)
                    except Category.DoesNotExist:
                        self.stdout.write(self.style.ERROR(f"❌ Category not found: {category_slug}"))
                        continue

                    count = self.fetch_osm_venues(city, category, limit)
                    self.stdout.write(self.style.SUCCESS(f"✅ Saved {count} {category.name}s in {city}\n"))
                    time.sleep(3)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Error fetching {category_slug} in {city}: {str(e)}"))
                    continue

    def fetch_osm_venues(self, city, category, limit):
        self.stdout.write(f"Looking up {city}, Ghana...")

        # Lookup area ID for city
        area_id = self.get_area_id(city)
        if not area_id:
            self.stdout.write(self.style.ERROR(f"❌ Could not find area ID for {city}"))
            return 0

        self.stdout.write(self.style.SUCCESS(f"✓ Found {city}, Ghana"))

        # ✅ Match to OSM tags used in your original script
        osm_tags = {
            "restaurant": 'amenity=restaurant',
            "cafe": 'amenity=cafe',
            "bar": 'amenity=bar',
            "cinema": 'amenity=cinema',
            "entertainment": 'leisure=amusement_arcade',
            "lounge": 'amenity=pub',
        }

        tag = osm_tags.get(category.slug, 'amenity=restaurant')

        overpass_servers = [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.openstreetmap.fr/api/interpreter",
        ]

        count = 0
        success = False

        # Build Overpass query
        overpass_query = f"""
        [out:json][timeout:90];
        area({area_id})->.searchArea;
        (
          node["{tag.split('=')[0]}"="{tag.split('=')[1]}"](area.searchArea);
          way["{tag.split('=')[0]}"="{tag.split('=')[1]}"](area.searchArea);
        );
        out center {limit};
        """

        for server in overpass_servers:
            self.stdout.write(f"🛰️ Querying {server} ...")
            try:
                response = requests.post(
                    server,
                    data={'data': overpass_query},
                    timeout=90
                )

                if response.status_code == 200:
                    success = True
                    break
                else:
                    self.stdout.write(self.style.WARNING(
                        f"⚠️ Server {server} returned {response.status_code}, trying next..."))
                    time.sleep(2)

            except requests.exceptions.Timeout:
                self.stdout.write(self.style.WARNING(f"⚠️ Timeout on {server}, trying next..."))
                continue
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠️ Error contacting {server}: {str(e)}"))
                continue

        if not success:
            self.stdout.write(self.style.ERROR('❌ All Overpass API servers failed. Please try again later.'))
            return 0

        # ✅ Handle empty JSON response safely
        try:
            data = response.json()
        except ValueError:
            self.stdout.write(self.style.WARNING(
                f"⚠️ Invalid or empty response from Overpass for {city}, category: {category.name}"))
            return 0

        elements = data.get('elements', [])
        if not elements:
            self.stdout.write(self.style.WARNING(f"⚠️ No {category.name}s found in {city}, Ghana"))
            return 0

        self.stdout.write(f"Processing {len(elements)} results...\n")

        for element in elements:
            if count >= limit:
                break

            tags = element.get('tags', {})
            name = tags.get('name', '').strip()
            if not name:
                continue

            lat = element.get('lat') or element.get('center', {}).get('lat')
            lon = element.get('lon') or element.get('center', {}).get('lon')

            if lat is None or lon is None:
                continue

            # Avoid duplicates
            if Venue.objects.filter(name__iexact=name, city__iexact=city).exists():
                continue

            # Address info
            address_parts = []
            if tags.get('addr:street'):
                address_parts.append(tags['addr:street'])
            address = ', '.join(address_parts) if address_parts else f"{city}, Ghana"

            # Create venue
            Venue.objects.create(
                name=name,
                category=category,
                description=f"Venue in {city}, Ghana from OpenStreetMap",
                city=city,
                address=address,
                latitude=Decimal(str(lat)),
                longitude=Decimal(str(lon)),
                price_range='$$',
                rating=Decimal('0.0')
            )

            count += 1
            self.stdout.write(self.style.SUCCESS(f"  ✓ {name}"))

        time.sleep(2)
        return count

    def get_area_id(self, city_name):
        """Look up OpenStreetMap area ID for a Ghanaian city."""
        query = f"""
        [out:json][timeout:25];
        area["name"="{city_name}"]["boundary"="administrative"]["country"="Ghana"];
        out ids;
        """
        try:
            response = requests.post(
                "https://overpass-api.de/api/interpreter",
                data={'data': query},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('elements'):
                    rel_id = data['elements'][0]['id']
                    return 3600000000 + rel_id
        except Exception:
            return None
        return None
