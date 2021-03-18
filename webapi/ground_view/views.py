from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition, ReservationPlan, ReservationTarget
from itertools import groupby
import json
from django.db import transaction
from .batch.Share import PlanTargetHolder, TimeboxResolver, Stadium, Area, PlanStatus

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
    items = ReservationPlan.objects.all().order_by('ymd_range')
    ret = {'count': len(items), 'plans': []}
    for p in items:
        dat = {
            'id': p.id,
            'ymd_range': p.ymd_range,
            'status': p.status,
            'area_csv': p.area_csv,
            'reserved_cnt': p.reserved_cnt,
            'target_cnt': p.target_cnt
        }
        ret['plans'].append(dat)
    return JsonResponse(ret)


@ensure_csrf_cookie
def get_plan(req):
    date = req.GET['date']
    try:
        p = ReservationPlan.objects.get(ymd_range=date)

        ret = {'id': p.id, 'ymd_range': p.ymd_range, 'status': p.status,
               'area_csv': p.area_csv, 'reserved_cnt': p.reserved_cnt, 'target_cnt': p.target_cnt}
    except ReservationPlan.DoesNotExist:
        ret = {}
    return JsonResponse(ret)


@ensure_csrf_cookie
def get_plan_by_id(req):
    plan_id = req.GET['planId']
    try:
        p = ReservationPlan.objects.get(id=plan_id)

        ret = {'id': p.id, 'ymd_range': p.ymd_range, 'status': p.status,
               'area_csv': p.area_csv, 'reserved_cnt': p.reserved_cnt, 'target_cnt': p.target_cnt}
    except ReservationPlan.DoesNotExist:
        ret = {}
    return JsonResponse(ret)


@ensure_csrf_cookie
def watch_change(req):
    plan_id = req.GET.get('planId')
    is_watch = req.GET.get('isWatch')
    status = PlanStatus.of(is_watch).nm
    try:
        ReservationPlan.objects.filter(id=plan_id).update(status=status)
    except ReservationPlan.DoesNotExist:
        status = "err"
    return JsonResponse({"status": status})


@ensure_csrf_cookie
def get_targets(req):
    date = req.GET['date']
    ret = {
        'date': date,
        'areas': [],
        'stadiums': {},
        'times': {},
        'goumens': {}
    }
    for area in Area.members():
        ret['stadiums'][area.nm] = []

    try:
        p = ReservationPlan.objects.get(ymd_range=date)
        items = ReservationTarget.objects.all().filter(plan_id=p.id)\
            .order_by('timebox').order_by('gname').order_by('area')

        ret['date'] = date
        buf = {'area': '', 'gname': '', 'timebox': '', 'goumens': ''}
        time_resolver = None
        for t in items:
            if buf['area'] != t.area:
                buf['area'] = t.area

                ret['areas'].append(t.area)
                ret['stadiums'][t.area] = []
                ret['goumens'][t.area] = {}
                ret['times'][t.area] = {}

            if buf['gname'] != t.gname:
                buf['gname'] = t.gname
                time_resolver = TimeboxResolver(Stadium.nm_of(t.gname))

                if t.gname not in ret['stadiums'][t.area]:
                    ret['stadiums'][t.area].append(t.gname)
                ret['goumens'][t.area][t.gname] = []
                ret['times'][t.area][t.gname] = []

            if buf['goumens'] != t.gno_csv:
                buf['goumens'] = t.gno_csv
                ret['goumens'][t.area][t.gname] = t.gno_csv.split(',')

            if buf['timebox'] != t.timebox:
                buf['timebox'] = t.timebox
                ret['times'][t.area][t.gname].append(time_resolver.get()[t.timebox])

    except ReservationTarget.DoesNotExist or ReservationPlan.DoesNotExist:
        ret = {}

    return JsonResponse(ret)


@ensure_csrf_cookie
def save_plan(req):
    data = json.loads(req.body.decode('utf-8'))
    mode = req.GET['mode']
    watch_start = req.GET['watchStart']
    holder = PlanTargetHolder(data, PlanStatus.of(watch_start))

    with transaction.atomic():
        if mode == 'edit':
            old_targets = ReservationTarget.objects.filter(ym=holder.ym(), dt=holder.dt())
            holder.apply_reserve_gno_csv(old_targets)
            ReservationTarget.objects.filter(ym=holder.ym(), dt=holder.dt()).delete()
            ReservationPlan.objects.filter(ymd_range=holder.ymd).delete()

        plan_id = ReservationPlan.save_plan(holder)
        ReservationTarget.save_target(holder, plan_id)

    return JsonResponse({'ret': "ok"})
