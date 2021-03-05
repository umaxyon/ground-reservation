from django.db import models


class GroundInfo(models.Model):
    ym = models.IntegerField('年月', max_length=6)
    dt = models.IntegerField('日', max_length=2)
    week_day = models.CharField('曜日', max_length=1)
    area = models.CharField('地域', max_length=10)
    gname = models.CharField('グラウンド名', max_length=15)
    timebox = models.IntegerField('時間帯', max_length=2)

    def __str__(self):
        return f"[{self.ym}{self.dt:0>2}_{self.timebox}]{self.gname}"
