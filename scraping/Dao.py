import datetime
import os
import MySQLdb
from sqlalchemy.pool import QueuePool
from ground_view.batch.Share import Plan, Target


def jst_now():
    return datetime.datetime.utcnow() + datetime.timedelta(hours=9)


def transaction(f):
    def wrapped(inst, *args, **kwargs):
        inst.conn = inst.pool.connect()
        inst.cur = inst.conn.cursor()
        try:
            ret = f(inst, *args, **kwargs)
            inst.conn.commit()
            return ret
        except Exception as e:
            inst.conn.rollback()
            raise e
        finally:
            inst.cur.close()
            inst.conn.close()
            inst.cur = None
            inst.conn = None

    return wrapped


class Dao:
    def __init__(self):
        self.conf = {
            "user": os.environ['DB_USER'],
            "passwd": os.environ['DB_PASS'],
            "host": os.environ['DB_HOST'],
            "port": int(os.environ['DB_PORT']),
            "db": "ground_reservation",
            "charset": "utf8mb4"
        }
        self.pool = QueuePool(lambda: MySQLdb.connect(**self.conf), pool_size=3)
        self.conn = None
        self.cur = None

    @transaction
    def get_system_condition(self, user_id):
        self.cur.execute('select * from ground_view_systemcondition WHERE user_id = %s', [user_id])
        dat = self.cur.fetchone()
        return {'available': dat[1] == 1, 'debug': dat[2] == 1,
                'last_update': dat[3], 'week_targets': dat[4],
                'account': dat[5], 'pswd': dat[6]}

    @transaction
    def recreate_groundinfo(self, params):
        now = jst_now().strftime("%Y/%m/%d_%H:%M:%S")
        self.cur.execute("update ground_view_systemcondition set last_update = %s where id = %s", [now, 1])
        self.cur.execute("delete from ground_view_groundinfo")
        self.cur.executemany((
            "insert into ground_view_groundinfo(ym, dt, week_day, area, gname, timebox) "
            "values(%s, %s, %s, %s, %s, %s)"
        ), params)

    @transaction
    def get_available_plans(self, user_id, target_status='監視中'):
        self.cur.execute(
            'select * from ground_view_reservationplan WHERE status = %s and user_id = %s',
            [target_status, user_id])
        data = self.cur.fetchall()
        return [Plan(self, d) for d in data]

    @transaction
    def get_plan_from_ymd(self, str_ymd, user_id):
        self.cur.execute(
            'select * from ground_view_reservationplan WHERE ymd_range = %s and user_id = %s',
            [str_ymd, user_id])
        data = self.cur.fetchone()
        return Plan(self, data)

    @transaction
    def get_targets_from_plan_id(self, plan_id):
        self.cur.execute('select * from ground_view_reservationtarget WHERE plan_id = %s', [plan_id])
        data = self.cur.fetchall()
        return [Target(self, d) for d in data]

    @transaction
    def get_target_from_result_data(self, day, gname, timebox) -> Target:
        ym, dt = int(day[:6]), int(day[6:8])

        self.cur.execute(
            ('select * from ground_view_reservationtarget '
             'WHERE ym = %s and dt = %s and gname = %s and timebox = %s'),
            [ym, dt, gname, timebox])
        data = self.cur.fetchone()
        return Target(self, data) if data is not None else None

    @transaction
    def find_last_plan_created_by_system(self, user_id):
        self.cur.execute((
            'select * from ground_view_reservationplan '
            'WHERE author = %s and user_id = %s ORDER BY ymd_range DESC LIMIT 1'), ['sys', user_id])
        data = self.cur.fetchone()
        return Plan(self, data) if data is not None else None

    @transaction
    def get_all_users(self):
        self.cur.execute('select * from ground_view_user')
        data = self.cur.fetchall()
        return list(data)

    def get_week_targets(self, user_id):
        cond = self.get_system_condition(user_id)
        return cond['week_targets']

    @transaction
    def get_weekly_target_json(self, targets, user_id):
        param = [r.value for r in targets]
        param.append(user_id)
        week_days_placeholders = ', '.join(map(lambda x: '%s', targets))
        sql = (
            f'SELECT * FROM ground_view_reservationweeklytarget WHERE week_day in ({week_days_placeholders}) '
            f'and enable = 1 and user_id = %s')
        self.cur.execute(sql, param)
        data = self.cur.fetchall()
        return {d[1]: d[2] for d in data}

    @transaction
    def insert_exec(self, sql, params):
        self.cur.execute(sql, params)
        return self.conn.insert_id()

    @transaction
    def insert_multi_exec(self, sql, params):
        self.cur.executemany(sql, params)

    @transaction
    def find_old_plan(self, today):
        self.cur.execute('select id from ground_view_reservationplan where ymd_range < %s', [today])
        return [r[0] for r in self.cur.fetchall()]

    @transaction
    def delete_targets_and_plan(self, pid):
        self.cur.execute('delete from ground_view_reservationtarget where plan_id = %s', [pid])
        self.cur.execute('delete from ground_view_reservationplan where id = %s', [pid])

    @transaction
    def determined_plan(self, ymd):
        self.cur.execute(
            'update ground_view_reservationplan set status = %s where ymd_range = %s', ['予約済', ymd]
        )

    @transaction
    def tx_save_reserve_result(self, t: Target, reserve_no, g_no):
        # 1トランでターゲット・プラン更新、resevation_result追加を行う

        self.cur.execute(
            ('update ground_view_reservationtarget set '
             'status = %s, ym = %s, dt = %s, week_day = %s, area = %s, '
             'gname = %s, timebox = %s, gno_csv = %s, reserve_gno_csv = %s '
             'where id = %s'),
            [t.status, t.ym, t.dt, t.week_day, t.area, t.gname, t.timebox, t.gno_csv, t.reserve_gno_csv, t.id])

        reserved_cnt = len(t.reserve_gno_csv.split(',')) if t.reserve_gno_csv != '' else 0
        self.cur.execute(
            'update ground_view_reservationplan set reserved_cnt = reserved_cnt + %s where id = %s',
            [reserved_cnt, t.plan_id])

        self.cur.execute((
            "insert into ground_view_reservationresult(reserve_no, g_no, timebox, target_id) "
            "values(%s, %s, %s, %s)"
        ), [reserve_no, g_no, t.timebox, t.id])

    @transaction
    def get_reserved_count(self, ymd):
        ym = int(ymd[0:6])
        d = int(ymd[6:8])
        self.cur.execute(
            ('select sum(b.cnt) as reserved_cnt '
             '  from '
             '    (select '
             '       a.area,'
             '       (select count(*) from ground_view_reservationtarget '
             '         where ym = %s and dt = %s and status = %s and area = a.area) as cnt '
             '       from (select area from ground_view_reservationtarget where ym = %s and dt = %s group by area) as a'
             '       group by a.area'
             '    ) b'), [ym, d, '予約有', ym, d]
        )
        data = self.cur.fetchone()
        return data

    @transaction
    def get_reserved_status_data(self, ymd):
        ym = int(ymd[0:6])
        d = int(ymd[6:8])
        self.cur.execute(
            ('select'
             '  a.area,'
             '  a.timebox,'
             '  (select gname from ground_view_reservationtarget'
             '    where ym = %s and dt = %s and status = %s and area = a.area and timebox = a.timebox) as gname,'
             '  (select count(*) from ground_view_reservationtarget '
             '    where ym = %s and dt = %s and status = %s and area = a.area) as cnt '
             '  from (select area, timebox from ground_view_reservationtarget'
             '         where ym = %s and dt = %s group by area, timebox) as a '),
            [ym, d, '予約有', ym, d, '予約有', ym, d]
        )
        data = self.cur.fetchall()
        return [(d[0], d[1], d[2], d[3]) for d in data]

