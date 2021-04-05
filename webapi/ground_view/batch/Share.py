import datetime as dt
import base64
import os
import re
from datetime import timedelta
from enum import Enum
from typing import List


class PlanStatus(Enum):
    ON = (0, '監視中')
    OFF = (1, '待機中')

    def __init__(self, sid, nm):
        self.sid = sid
        self.nm = nm

    @staticmethod
    def members():
        return [*PlanStatus.__members__.values()]

    @staticmethod
    def nm_of(nm):
        v = [v for v in PlanStatus.members() if v.nm == nm]
        return v[0] if len(v) == 1 else None

    @staticmethod
    def of(watch_status):
        return PlanStatus.ON if watch_status == 'true' else PlanStatus.OFF


time_ptn = {
    1: ['07-09', '09-11', '11-13', '13-15', '15-17'],
    2: ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
    3: ['08-10', '10-12', '12-14', '14-16'],
    4: ['06-08', '08-10', '10-12', '12-14', '14-16', '16-18'],
    5: ['09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
}

timebox_table = {
    # '昭和島運動場': {0: time_ptn[1], 1: time_ptn[4]},
    # '平和島公園': {0: time_ptn[1], 1: time_ptn[4]},
    '大田ｽﾀｼﾞｱﾑ': {0: time_ptn[2], 1: time_ptn[2]},
    '東調布公園': {0: time_ptn[3], 1: time_ptn[5]},
    '多摩川緑地': {0: time_ptn[1], 1: time_ptn[4]},
    '六郷橋緑地': {0: time_ptn[1], 1: time_ptn[4]},
    '大師橋緑地': {0: time_ptn[1], 1: time_ptn[4]},
    'ｶﾞｽ橋緑地': {0: time_ptn[1], 1: time_ptn[4]},
    '萩中公園': {0: time_ptn[3], 1: time_ptn[2]}
}


class TimeboxResolver:
    def __init__(self, stadium):
        self.stadium = stadium

    def get(self, month):
        # TODO 4月からいつまで同じ日付パターンなのか不明。
        time_idx = 0 if month <= 3 else 1
        return timebox_table[self.stadium.nm][time_idx]


class Stadium(Enum):
    def __init__(self, sid, full_nm, nm, priority):
        self.id = sid
        self.full_nm = full_nm
        self.nm = nm
        self.priority = priority

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

    def timebox(self, month) -> List:
        return TimeboxResolver(self).get(month)

    # SHOWAJIMA = (0, '昭和島運動場野球場', '昭和島運動場')
    # HEIWAJIMA = (1, '平和島公園野球場', '平和島公園')
    OOTA_ST = (2, '大田スタジアム', '大田ｽﾀｼﾞｱﾑ', ['1'])
    HIGASHI_CHOFU = (3, '東調布公園', '東調布公園', ['1'])
    HAGINAKA = (4, '萩中公園', '萩中公園', ['1'])
    TAMAGAWA = (5, '多摩川緑地野球場', '多摩川緑地', ['9', '13', '12', '14', '15', '10', '8', '7', '11', '16', '4', '5', '3', '2'])
    ROKUGOBASHI = (6, '多摩川六郷橋緑地野球場', '六郷橋緑地', ['1', '4', '2', '3', '5'])
    TAISHIBASHI = (7, '多摩川大師橋緑地野球場', '大師橋緑地', [])
    GASUBASHI = (8, '多摩川ガス橋緑地野球場', 'ｶﾞｽ橋緑地', ['6', '7', '8', '4', '3', '2', '1'])


class Area(Enum):
    def __init__(self, aid, nm, stadiums, priority):
        self.id = aid
        self.nm = nm
        self.stadiums = stadiums
        self.priority = priority

    @staticmethod
    def members():
        mems = [*Area.__members__.values()]
        mems.sort(key=lambda a: a.priority)
        return mems

    @staticmethod
    def nm_of(nm):
        v = [v for v in Area.members() if v.nm == nm]
        return v[0] if len(v) == 1 else None

    @staticmethod
    def in_targets(reserver):
        target_areas = [t.area for t in reserver.targets]
        return [area for area in Area.members() if area.nm in target_areas]

    @staticmethod
    def sort_base_keys():
        return [a.nm for a in Area.members()]

    # OOMORI = (0, '大森', [Stadium.SHOWAJIMA, Stadium.HEIWAJIMA])
    OOTA = (1, '大田ST', [Stadium.OOTA_ST], 1)
    KOUJIYA_HANEDA = (3, '糀谷・羽田', [Stadium.HAGINAKA], 2)
    KAMATA = (4, '蒲田', [Stadium.TAMAGAWA, Stadium.ROKUGOBASHI, Stadium.TAISHIBASHI, Stadium.GASUBASHI], 3)
    CHOFU = (2, '調布', [Stadium.HIGASHI_CHOFU], 4)


def get_weekday(year, month, day):
    w = dt.datetime(int(year), int(month), int(day)).weekday()
    return ['月', '火', '水', '木', '金', '土', '日'][w]


class CalDay:
    def __init__(self, year, month, day, is_current_day=None, td=None):
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
    def __init__(self, post_row, day=None):
        self.ymd = ''
        self.ym = ''
        self.dt = ''
        self.week_day = ''
        self.stadium = Stadium.nm_of(post_row['stadium'])

        if 'date' in post_row and post_row['date'] != '':
            y = post_row['date'][0:4]
            m = post_row['date'][4:6]
            d = post_row['date'][6:]
            self.ym = f"{y}{m}"
            self.dt = d
            self.ymd = f"{y}{m}{d}"
            self.week_day = get_weekday(y, m, d)
            self.timebox = self.stadium.timebox(int(m)).index(post_row['time'])
        else:
            # WeeklyPlannerで作成する場合、ターゲット日がdayでわたってくる想定
            m = day[4:6]
            self.timebox = self.stadium.timebox(int(m)).index(post_row['time'])

        self.status = '未予約'
        self.area = post_row['area']
        self.gname = self.stadium.nm
        self.goumens = post_row['goumen'] or []
        self.reserve_gno_csv = ""

    def count(self):
        return len(self.goumens)

    def to_param(self, plan_id, ymd="", user_id=""):
        buf = ymd or self.ymd
        ym = buf[0:6]
        d = buf[6:]
        week_day = DateTimeUtil.week_day(buf)

        # "plan_id, status, ym, dt, week_day, area, gname, gno_csv, timebox, reserve_gno_csv, user_id"
        return (
            plan_id, self.status, int(ym), int(d), week_day, self.area,
            self.gname, ','.join(self.goumens), self.timebox, self.reserve_gno_csv, user_id
        )


class PlanTargetHolder:
    def __init__(self, items, plan_status, day=None):
        self.ymd = ""
        self.areas = set([])
        self.targets: List[TargetRowHolder] = []

        for r in items:
            t = TargetRowHolder(r, day=day)
            self.ymd = t.ymd
            self.areas.add(t.area)
            self.week_day = t.week_day
            self.targets.append(t)
            self.plan_status = plan_status

    def target_count(self):
        return sum(t.count() for t in self.targets)

    def ym(self):
        return int(self.ymd[0:6])

    def dt(self):
        return int(self.ymd[6:])

    def apply_reserve_gno_csv(self, old_targets):
        for old_t in old_targets:
            for t in self.targets:
                if t.area == old_t.area and t.gname == old_t.gname and t.timebox == old_t.timebox:
                    t.reserve_gno_csv = old_t.reserve_gno_csv

    def create(self, dao, day, user_id):
        p_sql = (
            "insert into ground_view_reservationplan("
            "status, area_csv, ymd_range, reserved_cnt, target_cnt, author, user_id) values ("
            "%s, %s, %s, %s, %s, %s, %s)"
        )

        # target_cnt = reduce(lambda a, b: a + b, [len(t.goumens) for t in self.targets])
        params = ('監視中', (",".join(self.areas)), day, 0, self.target_count(), 'sys', user_id)
        p_id = dao.insert_exec(p_sql, params)

        t_sql = (
            "insert into ground_view_reservationtarget("
            "plan_id, status, ym, dt, week_day, area, gname, gno_csv, timebox, reserve_gno_csv, user_id) values ("
            "%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        t_values = [t.to_param(p_id, day, user_id) for t in self.targets]
        dao.insert_multi_exec(t_sql, t_values)


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
    KEYS = {
        'id': 0, 'status': 1, 'ym': 2, 'dt': 3, 'week_day': 4, 'area': 5,
        'gname': 6, 'timebox': 7, 'plan_id': 8, 'gno': 9, 'gno_csv': 10, 'reserve_gno_csv': 11
    }

    def __init__(self, dao, dat):
        super().__init__(dao)
        self._dat = dat
        self.id = dat[0]
        self.status = dat[1]
        self.ym = dat[2]
        self.dt = dat[3]
        self.week_day = dat[4]
        self.area = dat[5]
        self.gname = dat[6]
        self.timebox = dat[7]
        self.plan_id = dat[8]
        self.gno_csv = dat[9]
        self.reserve_gno_csv = dat[10]

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
            f'[{self.status}]{self.ym}{self.dt:0>2}({self.week_day}) '
            f'{self.area} {self.gname}[{self.gno_csv if self.gno_csv is not None else "all"}] '
            f'tm={self.timebox} p={self.plan_id})'
        )

    def __getitem__(self, item):
        return self._dat[Target.KEYS[item]]


class DayOfWeek(Enum):
    Monday = 0
    Tuesday = 1
    Wednesday = 2
    Thursday = 3
    Friday = 4
    Saturday = 5
    Sunday = 6

    def iso_value(self):
        return self.value + 1

    def to_japanese(self):
        return '月火水木金土日'[self.value]

    @property
    def shortname(self):
        return self.name[:3]

    @staticmethod
    def from_date(d: dt.datetime):
        return DayOfWeek(d.weekday())

    @staticmethod
    def from_csv(val_csv: str):
        return tuple([DayOfWeek(int(v)) for v in val_csv.split(',')]) if val_csv != '' else None

    @classmethod
    def all(cls):
        return (cls.Monday,
                cls.Tuesday,
                cls.Wednesday,
                cls.Thursday,
                cls.Friday,
                cls.Saturday,
                cls.Sunday,)

    @classmethod
    def weekday(cls):
        return (cls.Monday,
                cls.Tuesday,
                cls.Wednesday,
                cls.Thursday,
                cls.Friday,)

    @classmethod
    def holiday(cls):
        return (cls.Saturday,
                cls.Sunday,)


class DateTimeUtil(object):

    @staticmethod
    def today():
        return dt.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)

    @staticmethod
    def add_day(d: dt.datetime, days: int):
        return d + timedelta(days=days)

    @staticmethod
    def add_day_str(d: str, days: int):
        return DateTimeUtil.to_str(DateTimeUtil.add_day(DateTimeUtil.from_str(d), days))

    @staticmethod
    def to_str(day: dt.datetime):
        return day.strftime('%Y%m%d')

    @staticmethod
    def from_str(str_day: str):
        return dt.datetime.strptime(str_day, '%Y%m%d')

    @staticmethod
    def from_str_jp(str_day_jp: str):
        return dt.datetime.strptime(re.sub(r'\(.+\)', '', str_day_jp), '%Y年%m月%d日')

    @staticmethod
    def week_day(str_day: str):
        return DayOfWeek.from_date(DateTimeUtil.from_str(str_day)).to_japanese()

    @staticmethod
    def str_today():
        return DateTimeUtil.to_str(DateTimeUtil.today())

    @staticmethod
    def str_after_day(str_date, days):
        day = DateTimeUtil.from_str(str_date)
        return DateTimeUtil.to_str(day + timedelta(days=days))

    @staticmethod
    def make_day_range_with_week_day(start_day, end_day, week_days=()):
        day = DateTimeUtil.from_str(start_day)
        end = DateTimeUtil.from_str(end_day)

        ret = []
        while day < end:
            if DayOfWeek.from_date(day) in week_days:
                ret.append(DateTimeUtil.to_str(day))
            day = day + timedelta(days=1)
        return ret


def pass_decode(str_pass):
    return base64.b64decode(str_pass).decode('utf-8').replace(os.environ['SALT'], '')
