from django.urls import path
from ground_view import views

urlpatterns = [
    path('', views.top, name="top"),
    path('get_system_condition/', views.get_system_condition, name="get_system_condition"),
    path('get_plans/', views.get_plans, name="get_plans"),
    path('save_plan/', views.save_plan, name="save_plan")
]
