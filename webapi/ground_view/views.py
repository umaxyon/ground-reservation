from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from ground_view.models import SystemCondition, ReservationPlan, ReservationTarget, ReservationWeeklyTarget, User
import json
from django.db import transaction, connection
from .batch.Share import PlanTargetHolder, TimeboxResolver, Stadium, Area, PlanStatus, DayOfWeek


# Create your views here.

def login_check(func):
    def checker(req, *args, **kwargs):
        user = req.session.get('user', False)
        if user:
            return func(req, *args, **kwargs)
        else:
            return JsonResponse({'session_check_err': True})
    return checker


@ensure_csrf_cookie
def top(req):
    return render(req, 'index.html')


@ensure_csrf_cookie
@login_check
def get_settings(req):
    user_id = req.session.get('user')
    cond = SystemCondition.objects.all().filter(user_id=user_id).get()
    weekly_targets = ReservationWeeklyTarget.objects.all().filter(user_id=user_id)
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
def do_login(req):
    data = json.loads(req.body.decode('utf-8'))
    user = None
    try:
        user = User.objects.get(user_name=data['username'], password=data['pswd'])
    except User.DoesNotExist as e:
        pass

    if user is None:
        ret = {"status": 'user_not_found', 'token': '', 'error': 'ユーザー名またはパスワードが違います'}
    else:
        req.session['user'] = user.id
        ret = {"status": 'ok', 'token': 'hoge', 'error': ''}
    return JsonResponse(ret)


@ensure_csrf_cookie
@login_check
def save_settings(req):
    data = json.loads(req.body.decode('utf-8'))
    user_id = req.session.get('user')

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

            model, _ = ReservationWeeklyTarget.objects.get_or_create(week_day=str(w.value), user_id=user_id)
            model.enable = enable
            model.target_json = target_json
            model.save()

        syscon = SystemCondition.objects.get(user_id=user_id)
        syscon.account = data['account']
        syscon.pswd = data['pswd']
        syscon.week_targets = ",".join(week_targets)
        syscon.save()

    return JsonResponse({"status": 'ok'})


@ensure_csrf_cookie
@login_check
def get_plans(req):
    user_id = req.session.get('user')
    items = ReservationPlan.objects.all().filter(user_id=user_id).order_by('ymd_range')
    ret = {'count': len(items), 'plans': []}
    for p in items:
        dat = {
            'id': p.id,
            'ymd_range': p.ymd_range,
            'status': p.status,
            'area_csv': p.area_csv,
            'reserved_cnt': p.reserved_cnt,
            'target_cnt': p.target_cnt,
            'author': p.author,
            'user_id': p.user_id
        }
        ret['plans'].append(dat)
    return JsonResponse(ret)


@ensure_csrf_cookie
@login_check
def get_plan(req):
    date = req.GET['date']
    user_id = req.session.get('user')
    try:
        p = ReservationPlan.objects.get(ymd_range=date, user_id=user_id)

        ret = {'id': p.id, 'ymd_range': p.ymd_range, 'status': p.status,
               'area_csv': p.area_csv, 'reserved_cnt': p.reserved_cnt, 'target_cnt': p.target_cnt, 'user_id': p.user_id}
    except ReservationPlan.DoesNotExist:
        ret = {}
    return JsonResponse(ret)


@ensure_csrf_cookie
@login_check
def get_plan_by_id(req):
    plan_id = req.GET['planId']
    user_id = req.session.get('user')
    try:
        p = ReservationPlan.objects.get(id=plan_id, user_id=user_id)

        with connection.cursor() as cursor:
            ym = p.ymd_range[0:6]
            d = p.ymd_range[6:8]
            cursor.execute(
                ('select'
                 '  a.area, a.timebox,'
                 '  b.gname, b.id as target_id,'
                 '  c.reserve_no, c.g_no as gno,'
                 '  (select count(*) from ground_view_reservationtarget '
                 '    where ym = %s and dt = %s and status = %s and area = a.area) as cnt '
                 '  from (select area, timebox from ground_view_reservationtarget'
                 '         where ym = %s and dt = %s group by area, timebox) as a '
                 '  left outer join '
                 '   (select gname, id, area, timebox from ground_view_reservationtarget'
                 '     where ym = %s and dt = %s and status = %s) b '
                 '    on a.area = b.area and a.timebox = b.timebox '
                 '  left outer join '
                 '   (select reserve_no, g_no, target_id from ground_view_reservationresult) c '
                 '    on b.id = c.target_id '
                 'order by a.area, a.timebox'
                 ),
                [ym, d, '予約有', ym, d, ym, d, '予約有']
            )
            data = cursor.fetchall()
            reserve_data = [{
                'area': d[0],
                'timebox': d[1],
                'stadium': d[2],
                'target_id': d[3],
                'reserve_no': d[4],
                'gno': d[5],
                'reserveCnt': d[6]} for d in data]

        ret = {'id': p.id, 'ymd_range': p.ymd_range, 'status': p.status,
               'area_csv': p.area_csv, 'reserved_cnt': p.reserved_cnt, 'target_cnt': p.target_cnt,
               'user_id': p.user_id, 'reserve_data': reserve_data}
    except ReservationPlan.DoesNotExist:
        ret = {}
    return JsonResponse(ret)


@ensure_csrf_cookie
@login_check
def watch_change(req):
    plan_id = req.GET.get('planId')
    is_watch = req.GET.get('isWatch')
    status = PlanStatus.of(is_watch).nm
    user_id = req.session.get('user')
    try:
        ReservationPlan.objects.filter(id=plan_id).update(status=status, user_id=user_id)
    except ReservationPlan.DoesNotExist:
        status = "err"
    return JsonResponse({"status": status})


@ensure_csrf_cookie
@login_check
def get_targets(req):
    date = req.GET['date']
    user_id = req.session.get('user')
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
        p = ReservationPlan.objects.get(ymd_range=date, user_id=user_id)
        items = ReservationTarget.objects.all().filter(plan_id=p.id, user_id=user_id)\
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

            ret['goumens'][t.area][t.gname] = t.gno_csv.split(',')

            tm = time_resolver.get(t.month())[t.timebox]
            ret['times'][t.area][t.gname].append(tm)

            reserve_list = t.reserve_gno_csv.split(',') if t.reserve_gno_csv != '' else []
            ret['reserved'][t.area][t.gname][tm] = reserve_list

    except ReservationTarget.DoesNotExist or ReservationPlan.DoesNotExist:
        ret = {}

    return JsonResponse(ret)


@ensure_csrf_cookie
@login_check
def delete_plan(req):
    date = req.GET['date']
    user_id = req.session.get('user')

    with transaction.atomic():
        p = ReservationPlan.objects.get(ymd_range=date, user_id=user_id)
        ReservationTarget.objects.filter(plan_id=p.id, user_id=user_id).delete()
        p.delete()

    return JsonResponse({"status": 'ok'})


@ensure_csrf_cookie
@login_check
def save_plan(req):
    data = json.loads(req.body.decode('utf-8'))
    mode = req.GET['mode']
    watch_start = req.GET['watchStart']
    holder = PlanTargetHolder(data, PlanStatus.of(watch_start))
    user_id = req.session.get('user')

    with transaction.atomic():
        if mode == 'edit':
            old_targets = ReservationTarget.objects.filter(ym=holder.ym(), dt=holder.dt(), user_id=user_id)
            holder.apply_reserve_gno_csv(old_targets)
            ReservationTarget.objects.filter(ym=holder.ym(), dt=holder.dt(), user_id=user_id).delete()
            ReservationPlan.objects.filter(ymd_range=holder.ymd, user_id=user_id).delete()

        plan_id = ReservationPlan.save_plan(holder, user_id)
        ReservationTarget.save_target(holder, plan_id, user_id)

    return JsonResponse({'ret': "ok"})
