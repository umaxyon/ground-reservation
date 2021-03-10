from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition, ReservationPlan
from itertools import groupby

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


@ensure_csrf_cookie
def get_plans(req):
    items = ReservationPlan.objects.all().order_by('status').reverse()
    ret = {}
    for k, plans in groupby(list(items), key=lambda p: p.status):
        ret[k] = sorted([{
                'id': p.id,
                'ymd_range': p.ymd_range,
                'status': p.status,
                'area_csv': p.area_csv
            } for p in plans],
            key=lambda p: p['ymd_range'], reverse=True)

    return JsonResponse(ret)
