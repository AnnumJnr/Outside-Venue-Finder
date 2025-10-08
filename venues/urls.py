from django.urls import path
from django.views.generic import TemplateView
from .views import (
    CategoryListView,
    VenueSearchView,
    VenueDetailView,
    UserSearchHistoryView
)

app_name = 'venues'

urlpatterns = [
    # Home page
    path('', TemplateView.as_view(template_name='venues/home.html'), name='home'),
    
    # API endpoints
    path('api/categories/', CategoryListView.as_view(), name='category-list'),
    path('api/search/', VenueSearchView.as_view(), name='venue-search'),
    path('api/venues/<int:pk>/', VenueDetailView.as_view(), name='venue-detail'),
    path('api/search-history/', UserSearchHistoryView.as_view(), name='search-history'),
]
