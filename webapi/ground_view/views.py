from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition

# Create your views here.


@ensure_csrf_cookie
def top(req):
    return render(req, 'index.html')


@ensure_csrf_cookie
def get_system_condition(req):
    cond = SystemCondition.objects.all().get()
    return JsonResponse({
        "available": cond.available == 1,
        "debug": cond.debug == 1,
        "last_update": cond.last_update
    })
