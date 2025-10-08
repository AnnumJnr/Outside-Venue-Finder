import requests
import time
from django.core.management.base import BaseCommand
from venues.models import Venue


class Command(BaseCommand):
    help = "Fetch venues from OpenStreetMap (Overpass API) for Ghanaian cities"

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=50, help='Limit number of results per category')

    def handle(self, *args, **options):
        limit = options['limit']

        # ✅ Skip Accra (already fetched)
        cities = ["Kumasi", "Takoradi", "Tamale"]
        categories = [
            "restaurant",
            "cafe",
            "bar",
            "cinema",
            "bank",
            "hospital",
            "pharmacy",
            "school",
            "hotel",
        ]

        for city in cities:
            self.stdout.write(self.style.SUCCESS(f"\n🇬🇭 Fetching venues for {city}, Ghana...\n"))
            for category in categories:
                try:
                    count = self.fetch_osm_venues(city, category, limit)
                    self.stdout.write(self.style.SUCCESS(f"✅ Saved {count} {category}s in {city}\n"))
                    time.sleep(3)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Error fetching {category} in {city}: {str(e)}"))
                    continue

    def fetch_osm_venues(self, city, category, limit):
        self.stdout.write(f"Looking up {city}, Ghana...")

        # Lookup area ID for city
        area_id = self.get_area_id(city)
        if not area_id:
            self.stdout.write(self.style.ERROR(f"❌ Could not find area ID for {city}"))
            return 0

        self.stdout.write(self.style.SUCCESS(f"✓ Found {city}, Ghana"))

        # Tags to search
        tags = [
            f"amenity={category}",
            f"shop={category}",
        ]

        overpass_servers = [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.openstreetmap.fr/api/interpreter",
        ]

        count = 0

        for tag in tags:
            self.stdout.write(f"Searching for {category}s...\n")

            # Build query
            overpass_query = f"""
            [out:json][timeout:90];
            area({area_id})->.searchArea;
            (
              node["{tag.split('=')[0]}"="{tag.split('=')[1]}"](area.searchArea);
              way["{tag.split('=')[0]}"="{tag.split('=')[1]}"](area.searchArea);
            );
            out center {limit};
            """

            success = False

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

            # ✅ Safe JSON decoding (prevents crashes like Kumasi’s)
            try:
                data = response.json()
            except ValueError:
                self.stdout.write(self.style.WARNING(
                    f"⚠️ Invalid or empty response from Overpass for {city}, category: {category}"))
                return 0

            elements = data.get('elements', [])
            if not elements:
                self.stdout.write(self.style.WARNING(f"⚠️ No {category}s found in {city}, Ghana"))
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

                # Save venue (duplicates possible, but you can add get_or_create later)
                Venue.objects.create(
                    name=name,
                    city=city,
                    category=category,
                    latitude=lat,
                    longitude=lon
                )

                count += 1

            time.sleep(2)

        return count

    def get_area_id(self, city_name):
        """Look up OpenStreetMap area ID for the given city."""
        query = f"""
        [out:json][timeout:25];
        area["name"="{city_name}"]["boundary"="administrative"];
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
                    # The area ID is 3600000000 + the relation id
                    rel_id = data['elements'][0]['id']
                    return 3600000000 + rel_id
        except Exception:
            return None
        return None

