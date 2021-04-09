import unittest
import freezegun
import os
os.environ['DB_USER'] = 'root'
os.environ['DB_PASS'] = 'root'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '33306'
os.environ['SALT'] = '1234abcd5678efgh'

from scraping.scheduler import init_logger
from scraping.Reserver import Reserver
from scraping.Dao import Dao
from ground_view.batch.Share import Target

dao = Dao()
logger = init_logger()


class ReserverTest(unittest.TestCase):

    def test_check_time_18_00(self):
        sut = Reserver(logger, dao, 'dev', '0000', 'MTIzNGFiY2Q1Njc4ZWZnaDEyMzQ1Ng==')

        ym, dt, week_day = 202104, 12, '月'  # 3日後想定
        t = Target(dao, [
            0, '未予約', ym, dt, week_day, 'area', 'gname', 'timebox', 'plan_id', 'gno_csv', 'reserve_gno_csv'])

        with freezegun.freeze_time('2021-04-08 18:00:00') as freeze_datetime:
            self.assertTrue(sut.check_time_before_18_00(t.ymd))

        with freezegun.freeze_time('2021-04-09 17:59:59') as freeze_datetime:
            self.assertTrue(sut.check_time_before_18_00(t.ymd))

        with freezegun.freeze_time('2021-04-09 18:00:00') as freeze_datetime:
            self.assertFalse(sut.check_time_before_18_00(t.ymd))

        with freezegun.freeze_time('2021-04-09 23:59:59') as freeze_datetime:
            self.assertFalse(sut.check_time_before_18_00(t.ymd))

        with freezegun.freeze_time('2021-04-10 17:59:59') as freeze_datetime:
            self.assertFalse(sut.check_time_before_18_00(t.ymd))


if __name__ == "__main__":
    unittest.main()
