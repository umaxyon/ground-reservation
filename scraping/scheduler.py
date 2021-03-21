import time
import datetime
import asyncio
import multiprocessing
from pathlib import Path
import logging
from logging import StreamHandler
from logging.handlers import RotatingFileHandler
from Reserver import Reserver
from Dao import Dao


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


def run_reserver(debug):
    log_level = logging.DEBUG if debug else logging.INFO
    log.setLevel(log_level)
    asyncio.get_event_loop().run_until_complete(Reserver(log, dao).run())


def schedule(interval, wait=True):
    start_tm = time.time()
    while True:
        sys_con = dao.get_system_condition()
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


if __name__ == "__main__":
    schedule(10 * 60)
