from django.urls import path
from volleyball.views import health,leagues,matches
urlpatterns=[path('api/health/',health),path('api/leagues/',leagues),path('api/matches/',matches)]
