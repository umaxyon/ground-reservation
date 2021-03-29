from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition, ReservationPlan, ReservationTarget, ReservationWeeklyTarget
import json
from django.db import transaction
from .batch.Share import PlanTargetHolder, TimeboxResolver, Stadium, Area, PlanStatus, DayOfWeek


# Create your views here.


@ensure_csrf_cookie
def top(req):
    return render(req, 'index.html')


@ensure_csrf_cookie
def get_settings(req):
    cond = SystemCondition.objects.all().get()
    weekly_targets = ReservationWeeklyTarget.objects.all()
    week_data = {
        DayOfWeek(int(t.week_day)).to_japanese(): {
            'enable': t.enable == 1,
            'json': t.target_json
        } for t in weekly_targets if t.target_json != ""}

    return JsonResponse({
        "available": cond.available,
        "debug": cond.debug == 1,
        "last_update": cond.last_update,
        "week_targets": cond.week_targets,
        "account": cond.account,
        "pswd": cond.pswd,
        "weekData": week_data,
        "weeks": list(week_data.keys())
    })


@ensure_csrf_cookie
def save_settings(req):
    data = json.loads(req.body.decode('utf-8'))

    with transaction.atomic():
        week_targets = []
        for w in DayOfWeek.all():
            target_json = ''
            enable = 0
            if w.to_japanese() in data['weekData']:
                wd = data['weekData'][w.to_japanese()]
                target_json = wd['json']
                enable = 1 if wd['enable'] else 0
                week_targets.append(str(w.value))

            model, _ = ReservationWeeklyTarget.objects.get_or_create(week_day=str(w.value))
            model.enable = enable
            model.target_json = target_json
            model.save()

        syscon = SystemCondition.objects.get(id=1)
        syscon.account = data['account']
        syscon.pswd = data['pswd']
        syscon.week_targets = ",".join(week_targets)
        syscon.save()

    return JsonResponse({"status": 'ok'})


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
            'target_cnt': p.target_cnt,
            'author': p.author
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
        'goumens': {},
        'reserved': {}
    }
    for area in Area.members():
        ret['stadiums'][area.nm] = []

    try:
        p = ReservationPlan.objects.get(ymd_range=date)
        items = ReservationTarget.objects.all().filter(plan_id=p.id)\
            .order_by('timebox').order_by('gname').order_by('area')

        ret['date'] = date
        buf = {'area': '', 'gname': '', 'timebox': '', 'goumens': '', 'reserved': ''}
        time_resolver = None
        for t in items:
            if buf['area'] != t.area:
                buf['area'] = t.area

                ret['areas'].append(t.area)
                ret['stadiums'][t.area] = []
                ret['goumens'][t.area] = {}
                ret['reserved'][t.area] = {}
                ret['times'][t.area] = {}

            if buf['gname'] != t.gname:
                buf['gname'] = t.gname

                ret['reserved'][t.area][t.gname] = {}

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
                tm = time_resolver.get(t.month())[t.timebox]
                ret['times'][t.area][t.gname].append(tm)

                if buf['reserved'] != t.reserve_gno_csv:
                    buf['reserved'] = t.reserve_gno_csv
                    ret['reserved'][t.area][t.gname][tm] = t.reserve_gno_csv.split(',')

    except ReservationTarget.DoesNotExist or ReservationPlan.DoesNotExist:
        ret = {}

    return JsonResponse(ret)


@ensure_csrf_cookie
def delete_plan(req):
    date = req.GET['date']

    with transaction.atomic():
        p = ReservationPlan.objects.get(ymd_range=date)
        ReservationTarget.objects.filter(plan_id=p.id).delete()
        p.delete()

    return JsonResponse({"status": 'ok'})


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
