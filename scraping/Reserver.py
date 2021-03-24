import itertools
from ReservationCalender import ReservationCalender
from Scraper import Scraper
from GrandInfo import GrandInfo
from ground_view.batch.Share import Area


class Reserver:
    def __init__(self, log, dao):
        self.log = log
        self.dao = dao
        self.scraper = Scraper(log, dao)

        self.plans = []
        self.targets = []

    def initialize_plan(self):
        self.plans = self.dao.get_available_plans()
        self.targets = list(itertools.chain.from_iterable([p.get_targets(force=True) for p in self.plans]))

    async def exec_reservation(self, cal, targets):
        click_cnt = 0
        info = GrandInfo(self.scraper)
        await cal.describe_calender()
        this_month_targets = [t[1] for t in targets if f"{cal.year}{cal.month:0>2}" == t[0]]
        for t in this_month_targets:
            match_days = await cal.get_match_days(t)
            for d in match_days:
                # TODO describe_calenderからここまでの間に予約されて押せない場合の実験が必要
                await cal.click_day(d)
                click_cnt += await info.click_abailable_target_btn(t)
        ret = []
        if click_cnt > 0:
            await info.click_reservation_next_button()
            if not await info.select_mokuteki():
                await info.click_reservation_back_button()
                return

            await info.click_submit_reservation()  # 予約確定
            no = await info.get_reservation_no()
            reserve_data = await info.get_reservation_datas()
            ret.extend(reserve_data)
            self.log.info(f'[予約確定] 予約no={no}')

            await info.click_continue_application()  # 申し込みを続ける
        return ret

    def update_reserve_result(self, results):
        pass

    async def run(self):
        self.initialize_plan()
        target_areas = Area.in_targets(self)

        await self.scraper.get_init_page()

        all_reserved = []
        for area in target_areas:
            self.log.debug(area.nm)
            await self.scraper.move_baseball_reserve_top()
            await self.scraper.click_ground_area_button(area.id)
            await self.scraper.login()

            cur_area_targets = [(f"{t.ym}", t) for t in self.targets if t.area == area.nm]

            while True:
                cal = ReservationCalender(self.scraper)

                reserve_data = await self.exec_reservation(cal, cur_area_targets)
                all_reserved.extend(reserve_data)

                await cal.click_next_month()  # 翌月
                if await cal.is_not_next_page():
                    await self.scraper.click_to_menu_button()
                    break

        self.update_reserve_result(all_reserved)
