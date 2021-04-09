import time
import datetime
import asyncio
import multiprocessing
from pathlib import Path
import logging
from logging import StreamHandler
from logging.handlers import RotatingFileHandler
from scraping.Reserver import Reserver
from scraping.Dao import Dao
from scraping.WeeklyPlanner import WeeklyPlanner
from scraping.PlanEraser import PlanEraser


def now():
    return datetime.datetime.utcnow() + datetime.timedelta(hours=9)


def init_logger():
    logger = logging.getLogger("scraper")
    f = logging.Formatter("%(asctime)s [%(filename)s:%(lineno)d] %(levelname)-8s %(message)s")

    rh = RotatingFileHandler(Path.cwd() / 'scraper.log', maxBytes=100000, backupCount=0)
    rh.setFormatter(f)
    logger.addHandler(rh)

    sh = StreamHandler()
    sh.setFormatter(f)
    logger.addHandler(sh)

    logger.setLevel(logging.DEBUG)
    return logger


log = init_logger()
dao = Dao()


async def process():
    users = dao.get_all_users()
    for user in users:
        sc = dao.get_system_condition(user[0])
        log.info(f'[{user[1]}]')
        await Reserver(log, dao, user[0], sc['account'], sc['pswd']).run()

    WeeklyPlanner(log, dao).run()
    PlanEraser(log, dao).run()


def run_reserver(debug):
    log_level = logging.DEBUG if debug == 1 else logging.INFO
    log.setLevel(log_level)
    asyncio.get_event_loop().run_until_complete(process())


def schedule(interval, wait=True):
    start_tm = time.time()
    while True:
        sys_con = dao.get_system_condition("0")
        if sys_con['available']:
            p = multiprocessing.Process(target=run_reserver, args=(sys_con['debug'],))
            log.info(f"start.")
            p.start()
            if wait:
                p.join()
            next_tm = ((start_tm - time.time()) % interval) or interval
            log.info(f"end. next_tm={next_tm} (after second)")
            time.sleep(next_tm)
        else:
            log.info('system not available. exit.')
            break


if __name__ == "__main__":
    schedule(5 * 60)
