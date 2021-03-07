import os
import MySQLdb
from sqlalchemy.pool import QueuePool


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
        self.pool = QueuePool(lambda :MySQLdb.connect(**self.conf), pool_size=3)
        self.conn = None
        self.cur = None

    @transaction
    def get_system_condition(self):
        self.cur.execute('select * from ground_view_systemcondition WHERE id = %s', [1])
        return self.cur.fetchone()

    @transaction
    def recreate_groundinfo(self, params):
        self.cur.execute("delete from ground_view_groundinfo")
        self.cur.executemany((
            "insert into ground_view_groundinfo(ym, dt, week_day, area, gname, timebox) "
            "values(%s, %s, %s, %s, %s, %s)"
        ), params)

