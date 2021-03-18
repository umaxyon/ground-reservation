from django.urls import path

from ground_view import views

urlpatterns = [
    path('', views.top, name="top"),
    path('get_system_condition/', views.get_system_condition, name="get_system_condition"),
    path('get_plans/', views.get_plans, name="get_plans"),
    path('get_plan/', views.get_plan, name="get_plan"),
    path('get_targets/', views.get_targets, name="get_targets"),
    path('save_plan/', views.save_plan, name="save_plan"),
]
