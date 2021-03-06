import time
import datetime
import asyncio
import multiprocessing
from Scraper import Scraper


def now():
    return datetime.datetime.utcnow() + datetime.timedelta(hours=9)


def run_scraper():
    asyncio.get_event_loop().run_until_complete(Scraper().run())


def schedule(interval, wait=True):
    start_tm = time.time()
    while True:
        p = multiprocessing.Process(target=run_scraper)
        print(f"[{now()}] start.")
        p.start()
        if wait:
            p.join()
        next_tm = ((start_tm - time.time()) % interval) or interval
        print(f"[{now()}] end. next_tm={next_tm} (after second)")
        time.sleep(next_tm)


if __name__ == "__main__":
    schedule(3 * 60)
