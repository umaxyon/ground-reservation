import datetime
import os
import MySQLdb
from sqlalchemy.pool import QueuePool
from Model import Plan, Target


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
    def get_system_condition(self):
        self.cur.execute('select * from ground_view_systemcondition WHERE id = %s', [1])
        dat = self.cur.fetchone()
        return {'available': dat[1] == 1, 'debug': dat[2] == 1, 'last_update': dat[3]}

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
    def get_available_plans(self, target_status=('監視中',)):
        self.cur.execute('select * from ground_view_reservationplan WHERE status = %s', list(target_status))
        data = self.cur.fetchall()
        return [Plan(self, d) for d in data]

    @transaction
    def get_targets_from_plan_id(self, plan_id):
        self.cur.execute('select * from ground_view_reservationtarget WHERE plan_id = %s', [plan_id])
        data = self.cur.fetchall()
        return [Target(self, d) for d in data]


