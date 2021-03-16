import datetime as dt
from enum import Enum

time_ptn = {
    1: ['07-09', '09-11', '11-13', '13-15', '15-17'],
    2: ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
    3: ['08-10', '10-12', '12-14', '14-16']
}

timebox_table = {
    '昭和島運動場': {0: time_ptn[1]},
    '平和島公園': {0: time_ptn[1]},
    '大田ｽﾀｼﾞｱﾑ': {0: time_ptn[2]},
    '東調布公園': {0: time_ptn[3]},
    '萩中公園': {0: time_ptn[3]},
    '多摩川緑地': {0: time_ptn[1]},
    '六郷橋緑地': {0: time_ptn[1]},
    '大師橋緑地': {0: time_ptn[1]}
}


class TimeboxResolver:
    def __init__(self, stadium):
        self.stadium = stadium

    def get(self):
        return timebox_table[self.stadium.nm][0]


class Stadium(Enum):
    def __init__(self, sid, full_nm, nm):
        self.id = sid
        self.full_nm = full_nm
        self.nm = nm

    @staticmethod
    def members():
        return [*Stadium.__members__.values()]

    @staticmethod
    def nm_of(nm):
        v = [v for v in Stadium.members() if v.nm == nm]
        return v[0] if len(v) == 1 else None

    @staticmethod
    def full_nm_of(full_nm):
        v = [v for v in Stadium.members() if v.full_nm == full_nm]
        return v[0] if len(v) == 1 else None

    def timebox(self):
        return TimeboxResolver(self).get()

    SHOWAJIMA = (0, '昭和島運動場野球場', '昭和島運動場')
    HEIWAJIMA = (1, '平和島公園野球場', '平和島公園')
    OOTA_ST = (2, '大田スタジアム', '大田ｽﾀｼﾞｱﾑ')
    HIGASHI_CHOFU = (3, '東調布公園', '東調布公園')
    HAGINAKA = (4, '萩中公園', '萩中公園')
    TAMAGAWA = (5, '多摩川緑地野球場', '多摩川緑地')
    ROKUGOBASHI = (6, '多摩川六郷橋緑地野球場', '六郷橋緑地')
    TAISHIBASHI = (7, '多摩川大師橋緑地野球場', '大師橋緑地')
    GASUBASHI = (8, '多摩川ガス橋緑地野球場', 'ｶﾞｽ橋緑地')


class Area(Enum):
    def __init__(self, aid, nm, stadiums):
        self.id = aid
        self.nm = nm
        self.stadiums = stadiums

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

    OOMORI = (0, '大森', [Stadium.SHOWAJIMA, Stadium.HEIWAJIMA])
    OOTA = (1, '太田スタジアム', [Stadium.OOTA_ST])
    CHOFU = (2, '調布', [Stadium.HIGASHI_CHOFU])
    KOUJIYA_HANEDA = (3, '糀谷・羽田', [Stadium.HAGINAKA])
    KAMATA = (4, '蒲田', [Stadium.TAMAGAWA, Stadium.ROKUGOBASHI, Stadium.TAISHIBASHI, Stadium.GASUBASHI])


def get_weekday(year, month, day):
    w = dt.datetime(int(year), int(month), int(day)).weekday()
    return ['月', '火', '水', '木', '金', '土', '日'][w]


class CalDay:
    def __init__(self, year, month, day, is_current_day, td):
        self.year = year
        self.month = month
        self.day = day
        self.week_day = get_weekday(year, month, day)
        self.current = is_current_day
        self.td = td

    def __repr__(self):
        return f'{self.year}/{self.month:0>2}/{self.day:0>2}({self.week_day})'

    def equal_day(self, other):
        return self.year == other.year and self.month == other.month and self.day == other.day


class TargetRowHolder:
    def __init__(self, post_row):
        y, m, d = post_row['date'].split('/')

        self.status = '未予約'
        self.ym = f"{y}{m}"
        self.dt = d
        self.week_day = get_weekday(y, m, d)
        self.area = d['area']
        self.gname = d['stadium']
        self.goumens = d['goumen'] or []

    def ymd(self):
        return f"{self.ym}{self.dt}"

    def count(self):
        return len(self.goumens)


class PlanTargetHolder:
    ymd_min = ""
    ymd_max = ""
    areas = set([])
    targets = []

    def __init__(self, items):
        for r in items:
            t = TargetRowHolder(r)
            self.set_ymd(t.ymd())
            self.areas.add(t.area)
            self.week_day = t.week_day
            self.targets.append(t)

    def target_count(self):
        return sum(t.count() for t in self.targets)

    def set_ymd(self, ymd):
        self.ymd_min = ymd if self.ymd_min == "" else min(self.ymd_min, ymd)
        self.ymd_max = max(self.ymd_max, ymd)


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
