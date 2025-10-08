from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Category, Venue, SearchHistory
from .serializers import (
    CategorySerializer, 
    VenueListSerializer, 
    VenueDetailSerializer,
    SearchHistorySerializer
)



class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Returns list of all active categories
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]




class VenueSearchView(APIView):
    """
    GET /api/search/?category=restaurant&city=Kumasi&area=Ahodwo
    Search for venues by category and location
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get query parameters
        category = request.query_params.get('category', '').strip()
        city = request.query_params.get('city', '').strip()
        area = request.query_params.get('area', '').strip()
        
        # Validate required parameters
        if not category or not city:
            return Response(
                {'error': 'Category and city are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Build query
        venues = Venue.objects.filter(is_active=True)
        
        # Filter by category (by slug or name)
        venues = venues.filter(
            Q(category__slug__iexact=category) | 
            Q(category__name__iexact=category)
        )
        
        # Filter by city (case-insensitive, partial match)
        venues = venues.filter(city__icontains=city)
        
        # Filter by area if provided
        if area:
            venues = venues.filter(area__icontains=area)
        
        # Select related to optimize queries
        venues = venues.select_related('category').prefetch_related('images')
        
        # Order by rating (highest first)
        venues = venues.order_by('-rating', 'name')
        
        # Save search history if user is authenticated
        if request.user.is_authenticated:
            SearchHistory.objects.create(
                user=request.user,
                category=category,
                city=city,
                area=area
            )
        
        # Serialize and return
        serializer = VenueListSerializer(venues, many=True, context={'request': request})
        
        return Response({
            'count': venues.count(),
            'results': serializer.data
        })
    



class VenueDetailView(generics.RetrieveAPIView):
    """
    GET /api/venues/<id>/
    Get detailed information about a specific venue
    """
    queryset = Venue.objects.filter(is_active=True)
    serializer_class = VenueDetailSerializer
    permission_classes = [AllowAny]



class UserSearchHistoryView(generics.ListAPIView):
    """
    GET /api/search-history/
    Get user's recent searches (last 10)
    """
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchHistory.objects.filter(
            user=self.request.user
        ).order_by('-searched_at')[:10] #might want to consider adding a function to extend the search to more than 10
