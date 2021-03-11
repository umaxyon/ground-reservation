import datetime as dt
from enum import Enum


class Area(Enum):
    def __init__(self, gid, nm):
        self.id = gid
        self.nm = nm

    @staticmethod
    def members():
        return [*Area.__members__.values()]

    @staticmethod
    def nm_of(nm):
        v = [v for v in Area.members() if v.nm == nm]
        return v[0] if len(v) == 1 else None

    @staticmethod
    def in_targets(reserver):
        target_areas = [t.area for t in reserver.targets]
        return [area for area in Area.members() if area.nm in target_areas]

    OOMORI = (0, '大森')
    OOTA = (1, '太田スタジアム')
    CHOFU = (2, '調布')
    HAGINAKA = (3, '糀谷・羽田')
    KAMATA = (4, '蒲田')


class CalDay:
    def __init__(self, year, month, day, is_current_day, td):
        self.year = year
        self.month = month
        self.day = day
        w = dt.datetime(int(year), int(month), int(day)).weekday()
        self.week_day = ['月', '火', '水', '木', '金', '土', '日'][w]
        self.current = is_current_day
        self.td = td

    def __repr__(self):
        return f'{self.year}/{self.month:0>2}/{self.day:0>2}({self.week_day})'

    def equal_day(self, other):
        return self.year == other.year and self.month == other.month and self.day == other.day


class ReservationModel:
    def __init__(self, dao):
        self.dao = dao


class Plan(ReservationModel):
    def __init__(self, dao, dat):
        super().__init__(dao)
        self.id = dat[0]
        self.status = dat[1]
        self.area_csv = dat[2]
        self.ymd_range = dat[3]
        self.targets_cnt = dat[4]
        self.reserved_cnt = dat[5]
        self.targets = []

    def get_targets(self, force=False):
        if len(self.targets) == 0 or force:
            self.targets = self.dao.get_targets_from_plan_id(self.id)
        return self.targets


class Target(ReservationModel):
    def __init__(self, dao, dat):
        super().__init__(dao)
        self.id = dat[0]
        self.status = dat[1]
        self.ym = dat[2]
        self.dt = dat[3]
        self.week_day = dat[4]
        self.area = dat[5]
        self.gname = dat[6]
        self.timebox = dat[7]
        self.plan_id = dat[8]
        self.gno = dat[9]
        self.gno_csv = dat[10]

    @property
    def year(self):
        return int(str(self.ym)[:4])

    @property
    def month(self):
        return int(str(self.ym)[4:])

    @property
    def calday(self):
        return CalDay(self.year, self.month, self.dt, False, None)

    def is_target_gno(self, gno):
        return self.gno_csv == '' or gno in self.gno_csv.split(',')

    def __repr__(self):
        return (
            f'Target('
            f'[{self.status}]{self.ym}{self.dt}({self.week_day}) '
            f'{self.area} {self.gname}[{self.gno_csv if self.gno_csv is None else "all"}] '
            f'tm={self.timebox} p={self.plan_id})'
        )
