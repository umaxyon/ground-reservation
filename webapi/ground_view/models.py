from django.db import models
from django.core.validators import MaxLengthValidator, RegexValidator
from .batch.Share import PlanTargetHolder


class GroundInfo(models.Model):
    ym = models.IntegerField('年月', validators=[MaxLengthValidator(6)])
    dt = models.IntegerField('日', validators=[MaxLengthValidator(2)])
    week_day = models.CharField('曜日', max_length=1)
    area = models.CharField('地域', max_length=10)
    gname = models.CharField('グラウンド名', max_length=15)
    timebox = models.IntegerField('時間帯', validators=[MaxLengthValidator(2)])

    def __str__(self):
        return f"[{self.ym}{self.dt:0>2}_{self.timebox}]{self.gname}"


class SystemCondition(models.Model):
    reg_on_off = RegexValidator(regex=r'[0-1]')
    reg_ymdhms = RegexValidator(regex=r'\d{4}/\d{2}/\d{2}_\d{2}:\d{2}:\d{2}')

    available = models.IntegerField('システム利用可否', validators=[reg_on_off])
    debug = models.IntegerField('デバッグモード', validators=[reg_on_off])
    last_update = models.CharField('最終更新', max_length=19, validators=[reg_ymdhms])


class ReservationPlan(models.Model):
    status = models.CharField('状態', max_length=10)
    ymd_range = models.CharField('年月日範囲', max_length=17, default='')
    area_csv = models.CharField('地域', max_length=80, default='')
    target_cnt = models.IntegerField('ターゲット数', validators=[MaxLengthValidator(3)], default=0)
    reserved_cnt = models.IntegerField('予約済み数', validators=[MaxLengthValidator(3)], default=0)

    @staticmethod
    def save_plan(dat: PlanTargetHolder):
        plan = ReservationPlan(
            status=dat.plan_status.nm,
            area_csv=','.join(dat.areas),
            ymd_range=dat.ymd,
            reserved_cnt=0,
            target_cnt=dat.target_count()
        )
        plan.save()
        return plan.id

    @staticmethod
    def convert_request_to_plan(items):
        holder = PlanTargetHolder(items)
        print(holder.target_count())
        pass


class ReservationTarget(models.Model):
    plan = models.ForeignKey(ReservationPlan, on_delete=models.CASCADE, null=True)
    status = models.CharField('状態', max_length=10)

    # gno = models.IntegerField('号面', validators=[MaxLengthValidator(2)], default=0)
    ym = models.IntegerField('年月', validators=[MaxLengthValidator(6)])
    dt = models.IntegerField('日', validators=[MaxLengthValidator(2)])
    week_day = models.CharField('曜日', max_length=1)
    area = models.CharField('地域', max_length=10)
    gname = models.CharField('グラウンド名', max_length=15)
    gno_csv = models.CharField('号面CSV', max_length=40, default='')
    reserve_gno_csv = models.CharField('予約済み号面CSV', max_length=40, default='')
    timebox = models.IntegerField('時間帯', validators=[MaxLengthValidator(2)])

    @staticmethod
    def save_target(dat: PlanTargetHolder, plan_id):
        targets = [ReservationTarget(
            status=th.status,
            plan_id=plan_id,
            ym=th.ym,
            dt=th.dt,
            week_day=th.week_day,
            area=th.area,
            gname=th.gname,
            timebox=th.timebox,
            reserve_gno_csv=th.reserve_gno_csv,
            gno_csv=','.join(th.goumens)
        ) for th in dat.targets]
        ReservationTarget.objects.bulk_create(targets)

    def __str__(self):
        return (f"{self.status} {self.ym}{self.dt} {self.plan_id} {self.area} {self.gname} {self.timebox} "
                f"{self.gno_csv} {self.reserve_gno_csv}")
