import time
import datetime
import asyncio
import multiprocessing
from pathlib import Path
import logging
from logging import StreamHandler
from logging.handlers import RotatingFileHandler
from Scraper import Scraper


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


def run_scraper():
    asyncio.get_event_loop().run_until_complete(Scraper(log).run())


def schedule(interval, wait=True):
    start_tm = time.time()
    while True:
        p = multiprocessing.Process(target=run_scraper)
        log.info(f"start.")
        p.start()
        if wait:
            p.join()
        next_tm = ((start_tm - time.time()) % interval) or interval
        log.info(f"end. next_tm={next_tm} (after second)")
        time.sleep(next_tm)


if __name__ == "__main__":
    schedule(3 * 60)
