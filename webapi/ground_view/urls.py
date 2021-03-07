from django.urls import path
from ground_view import views

urlpatterns = [
    path('', views.top, name="top"),
    path('get_system_condition/', views.get_system_condition, name="get_system_condition")
]
