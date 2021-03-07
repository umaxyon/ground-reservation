from django.urls import path
from ground_view import views

urlpatterns = [
    path('', views.top, name="top"),
]
