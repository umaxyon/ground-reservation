from django.db import models
from django.core.validators import MaxLengthValidator, RegexValidator


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
