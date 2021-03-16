from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition, ReservationPlan, ReservationTarget
from itertools import groupby
import json
from django.db import transaction
from .batch.Share import PlanTargetHolder

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
    items = ReservationPlan.objects.all().order_by('status').reverse().order_by('ymd_range')
    ret = {'count': len(items)}
    data = {}
    for k, plans in groupby(list(items), key=lambda p: p.status):
        data[k] = sorted([{
                'id': p.id,
                'ymd_range': p.ymd_range,
                'status': p.status,
                'area_csv': p.area_csv
            } for p in plans],
            key=lambda p: p['ymd_range'], reverse=True)
    ret['plans'] = data
    return JsonResponse(ret)


@ensure_csrf_cookie
def save_plan(req):
    data = json.loads(req.body.decode('utf-8'))

    with transaction.atomic():
        holder = PlanTargetHolder(data)
        plan_id = ReservationPlan.save_plan(holder)
        ReservationTarget.save_target(holder, plan_id)

    return JsonResponse({'ret': "ok"})
