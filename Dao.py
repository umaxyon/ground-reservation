import os
import MySQLdb


class Dao:
    def __init__(self):
        self.conf = {
            "user": os.environ['DB_USER'],
            "passwd": os.environ['DB_PASS'],
            "host": "localhost",
            "db": "ground_reservation",
            "charset": "utf8mb4"
        }

    def insert_exec(self, params):
        conn = MySQLdb.connect(**self.conf)
        cur = conn.cursor()
        try:
            cur.executemany("insert into ground_info values(%s, %s, %s, %s, %s, %s)", params)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

