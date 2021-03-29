import itertools
from ReservationCalender import ReservationCalender
from Scraper import Scraper
from GrandInfo import GrandInfo, get_goumen_num
from ground_view.batch.Share import CalDay, Stadium, TimeboxResolver


class TargetGroupIterator:
    def __init__(self, target_list, group_key):
        self.group_key = group_key
        self._target_list = sorted(target_list, key=lambda x: x[group_key])
        self._g_list = []
        for k, grp in itertools.groupby(self._target_list, key=lambda x: x[group_key]):
            self._g_list.append((k, list(grp)))
        self._i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self._i == len(self._g_list):
            raise StopIteration()

        ret = self._g_list[self._i]
        self._i += 1
        return ret


class Reserver:
    def __init__(self, log, dao, account, pswd):
        self.log = log
        self.dao = dao
        self.scraper = Scraper(log, dao, account, pswd)

        self.plans = []
        self.targets = []

    def initialize_plan(self):
        self.plans = self.dao.get_available_plans()
        self.targets = list(itertools.chain.from_iterable([p.get_targets(force=True) for p in self.plans]))

    async def commit_reserve(self, info):
        await info.click_reservation_next_button()
        if not await info.select_mokuteki():
            await info.click_reservation_back_button()
            return

        await info.click_submit_reservation()  # 予約確定
        no = await info.get_reservation_no()
        reserve_data = await info.get_reservation_datas()
        self.log.info(f'[予約確定] 予約no={no}')

        await info.click_continue_application()  # 申し込みを続ける
        return [(*r, no) for r in reserve_data]

    async def process_try_reservation_to_day(self, cal, ym, dt, targets):
        info = GrandInfo(self.scraper)
        await cal.click_day(CalDay(int(str(ym)[0:4]), int(str(ym)[4:6]), dt))

        clicked_list = []
        for timebox, t_grp_tm in TargetGroupIterator(targets, "timebox"):

            # TODO t_grp_tm の球場優先順ソート
            for t in t_grp_tm:
                clicked_tpl = await info.click_target_btn_at_one_choice(timebox, t)
                if clicked_tpl is not None:
                    clicked_list.append(clicked_tpl)
                    break  # この時間帯で1個押せたら次の時間帯へ。

        if len(clicked_list) > 0:
            self.log.debug(f"[{ym}{dt}] 選択: {[f'{t[0]}_{t[1]}(tm={t[2]})' for t in clicked_list]}")
            return await self.commit_reserve(info)

        return []

    async def run(self):
        self.initialize_plan()
        await self.scraper.get_init_page()

        all_reserved = []
        for area, t_grp_area in TargetGroupIterator(self.targets, "area"):
            await self.scraper.move_baseball_reserve_top()
            await self.scraper.click_ground_area_button(area)
            await self.scraper.login()

            for ym, t_grp_ym in TargetGroupIterator(t_grp_area, 'ym'):
                cal = await ReservationCalender(self.scraper).describe_calender()
                await cal.fit_month(ym)

                for dt, t_grp_dt in TargetGroupIterator(t_grp_ym, 'dt'):
                    if cal.is_open_day(ym, dt):
                        self.log.debug(f"[{area}] {str(ym)[0:4]}年{str(ym)[4:6]}月{dt:0>2}日 open try.")

                        # エリア、年月日で絞ったターゲットで予約トライ
                        reserve_data = await self.process_try_reservation_to_day(cal, ym, dt, t_grp_dt)
                        all_reserved.extend(reserve_data)

                await cal.click_next_month()  # 翌月
                if await cal.is_not_next_page():
                    await self.scraper.click_to_menu_button()
                    break

        self.update_reserve_result(all_reserved)

    def update_reserve_result(self, all_reserved):
        self.log.debug(all_reserved)

        for day, stadium_nm, goumen, times, fee, reserve_no in all_reserved:
            t_month = int(day[4:6])
            stadium = Stadium.full_nm_of(stadium_nm)
            time_ptn = TimeboxResolver(stadium).get(t_month)

            for timebox in times:
                target = self.dao.get_target_from_result_data(day, stadium.nm, time_ptn.index(timebox))

                goumen = get_goumen_num(goumen)
                if goumen not in target.gno_csv.split(','):
                    self.log.info(f'ターゲットに無い号面が予約された: [{day}][{stadium_nm}][{timebox} goumen={goumen}')

                reserve_list = target.reserve_gno_csv.split(',') if target.reserve_gno_csv != '' else []
                reserve_list.append(goumen)

                target.status = '予約有'
                target.reserve_gno_csv = ','.join(reserve_list)

                # 保存
                self.dao.tx_save_reserve_result(target, reserve_no, goumen)
                self.log.debug(f'結果保存: 予約No{reserve_no} target_id={target.id}')
