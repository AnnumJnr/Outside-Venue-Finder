"""
API Tests for Outside App
Simple tests to verify API endpoints work correctly
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from venues.models import Category, Venue
from decimal import Decimal


User = get_user_model()


class CategoryAPITest(TestCase):
    """Test Category API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test categories
        Category.objects.create(
            name='Restaurants',
            slug='restaurant',
            icon='🍽️',
            description='Test restaurants'
        )
        
        Category.objects.create(
            name='Cafes',
            slug='cafe',
            icon='☕',
            description='Test cafes'
        )
    
    def test_get_categories(self):
        """Test GET /api/categories/"""
        response = self.client.get('/api/categories/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Just verify we get a list with categories
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)


class VenueAPITest(TestCase):
    """Test Venue API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create category
        self.category = Category.objects.create(
            name='Restaurants',
            slug='restaurant',
            icon='🍽️'
        )
        
        # Create test venues
        self.venue1 = Venue.objects.create(
            name='Test Restaurant 1',
            category=self.category,
            description='A test restaurant',
            city='Accra',
            area='Osu',
            address='123 Test St, Osu, Accra',
            latitude=Decimal('5.5558'),
            longitude=Decimal('-0.1826'),
            price_range='$$',
            rating=Decimal('4.5'),
            is_active=True
        )
        
        self.venue2 = Venue.objects.create(
            name='Test Restaurant 2',
            category=self.category,
            description='Another test restaurant',
            city='Accra',
            area='East Legon',
            address='456 Test Ave, East Legon, Accra',
            latitude=Decimal('5.6388'),
            longitude=Decimal('-0.1513'),
            price_range='$$$',
            rating=Decimal('4.8'),
            is_active=True
        )
    
    def test_search_venues_requires_params(self):
        """Test that search requires category and city"""
        # Missing both params
        response = self.client.get('/api/search/')
        self.assertEqual(response.status_code, 400)
        
        # Missing city
        response = self.client.get('/api/search/?category=restaurant')
        self.assertEqual(response.status_code, 400)
        
        # Missing category
        response = self.client.get('/api/search/?city=Accra')
        self.assertEqual(response.status_code, 400)
    
    def test_search_venues_by_category_and_city(self):
        """Test GET /api/search/?category=restaurant&city=Accra"""
        response = self.client.get('/api/search/?category=restaurant&city=Accra')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn('count', data)
        self.assertIn('results', data)
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['results']), 2)
    
    def test_search_venues_with_area(self):
        """Test GET /api/search/?category=restaurant&city=Accra&area=Osu"""
        response = self.client.get('/api/search/?category=restaurant&city=Accra&area=Osu')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should only return Osu venue
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['name'], 'Test Restaurant 1')
        self.assertEqual(data['results'][0]['area'], 'Osu')
    
    def test_get_venue_detail(self):
        """Test GET /api/venues/<id>/"""
        response = self.client.get(f'/api/venues/{self.venue1.id}/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify venue details
        self.assertEqual(data['name'], 'Test Restaurant 1')
        self.assertEqual(data['city'], 'Accra')
        self.assertEqual(data['area'], 'Osu')


class AuthenticationAPITest(TestCase):
    """Test Authentication API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User'
        )
    
    def test_user_registration(self):
        """Test POST /api/auth/register/"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'full_name': 'New User',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        
        response = self.client.post(
            '/api/auth/register/',
            data=data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        response_data = response.json()
        
        # Verify user was created
        self.assertIn('user', response_data)
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_user_login(self):
        """Test POST /api/auth/login/"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(
            '/api/auth/login/',
            data=data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        
        self.assertIn('user', response_data)
        self.assertEqual(response_data['user']['username'], 'testuser')
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            '/api/auth/login/',
            data=data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)


class ModelTests(TestCase):
    """Test Django models"""
    
    def test_category_creation(self):
        """Test Category model"""
        category = Category.objects.create(
            name='Test Category',
            slug='test-category',
            icon='🎯'
        )
        
        self.assertEqual(str(category), 'Test Category')
        self.assertTrue(category.is_active)
    
    def test_venue_creation(self):
        """Test Venue model"""
        category = Category.objects.create(
            name='Restaurants',
            slug='restaurant',
            icon='🍽️'
        )
        
        venue = Venue.objects.create(
            name='Test Venue',
            category=category,
            description='Test description',
            city='Accra',
            address='Test Address',
            latitude=Decimal('5.5558'),
            longitude=Decimal('-0.1826'),
            price_range='$$',
            rating=Decimal('4.5')
        )
        
        self.assertEqual(str(venue), 'Test Venue - Accra')
        self.assertTrue(venue.is_active)
        self.assertEqual(venue.category.name, 'Restaurants')