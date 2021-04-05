import itertools
from ReservationCalender import ReservationCalender
from Scraper import Scraper
from GrandInfo import GrandInfo, get_goumen_num
from ground_view.batch.Share import CalDay, Stadium, TimeboxResolver, Area


class TargetGroupIterator:
    def __init__(self, target_list, group_key, sort_base_keys=None):
        self.group_key = group_key
        self._target_list = sorted(target_list, key=lambda x: x[group_key])
        self._g_list = []

        buf_list = []
        for k, grp in itertools.groupby(self._target_list, key=lambda x: x[group_key]):
            buf_list.append((k, list(grp)))

        if sort_base_keys is None:
            self._g_list = buf_list
        else:
            base_keys = sort_base_keys if sort_base_keys is not None else []
            for base_key in base_keys:
                t_list = [t for t in buf_list if t[0] == base_key]
                if len(t_list) == 1:
                    self._g_list.append(t_list[0])

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
    def __init__(self, log, dao, user_id, account, pswd):
        self.log = log
        self.dao = dao
        self.scraper = Scraper(log, dao, account, pswd)

        self.user_id = user_id
        self.plans = []
        self.targets = []

    def initialize_plan(self):
        self.plans = self.dao.get_available_plans(self.user_id)
        self.targets = list(itertools.chain.from_iterable([p.get_targets(force=True) for p in self.plans]))

    def sort_target_to_prioryty(self, target_list):
        target_map = {stadium: t_list for stadium, t_list in TargetGroupIterator(target_list, 'gname')}

        ret = []
        for area in Area.members():
            for stadium in area.stadiums:
                if stadium.nm in target_map:
                    targets = [t for t in target_map.get(stadium.nm)]  # gnameでグループした時点で1件確定のはず

                    for sp in stadium.priority:
                        t = targets[0]
                        for gno in t.gno_csv.split(','):
                            if sp == gno:
                                ret.append(t)
        return ret

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
        # 日付クリック
        await cal.click_day(CalDay(int(str(ym)[0:4]), int(str(ym)[4:6]), dt))

        clicked_list = []
        # 時間帯で絞る
        timebox_resolve_targets = [(timebox, t_grp_tm) for timebox, t_grp_tm in TargetGroupIterator(targets, "timebox")]
        # resoleved_cnt = 0
        for timebox, t_grp_tm in timebox_resolve_targets:
            reserved_list = [t for t in t_grp_tm if t.status == '予約有']
            if len(reserved_list) != 0:
                reserved = reserved_list[0]
                self.log.debug(f'-- 予約済みあり。スキップ。{reserved.gname} tm={timebox}')
                # resoleved_cnt += 1
                continue

            for t in t_grp_tm:
                clicked_tpl = await info.click_target_btn_at_one_choice(timebox, t)
                if clicked_tpl is not None:
                    clicked_list.append(clicked_tpl)
                    break  # この時間帯で1個押せたら次の時間帯へ。(球場もまたいで1個。ex: 多摩川、六郷橋。。セット内で1個。)

        # # 全ての「エリア、時間帯枠」で予約有が存在する場合、プランを確定とする
        # if resoleved_cnt + len(clicked_list) == len(timebox_resolve_targets):
        #     plan_id = timebox_resolve_targets[0][1][0].plan_id   # 日付で絞れている時点でplan_idは一意に確定している
        #     self.dao.determined_plan(plan_id)
        #     self.log.debug('プラン確定')

        if len(clicked_list) > 0:
            self.log.debug(f"[{ym}{dt}] 選択: {[f'{t[0]}_{t[1]}(tm={t[2]})' for t in clicked_list]}")
            return await self.commit_reserve(info)

        return []

    async def run(self):
        self.initialize_plan()  # 有効なプラン取得
        await self.scraper.get_init_page()

        all_reserved = []
        # エリアで絞る(優先順ソートで回す)
        for area, t_grp_area in TargetGroupIterator(self.targets, "area", sort_base_keys=Area.sort_base_keys()):
            if area == '大森':
                continue

            await self.scraper.move_baseball_reserve_top()
            await self.scraper.click_ground_area_button(area)
            is_login = await self.scraper.login()
            if not is_login:
                return

            # 年月で絞る
            for ym, t_grp_ym in TargetGroupIterator(t_grp_area, 'ym'):
                cal = await ReservationCalender(self.scraper).describe_calender()
                if not await cal.fit_month(ym):
                    await self.scraper.click_to_menu_button()
                    break

                # 日付で絞る
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
        self.check_plan_closing(all_reserved)

    def check_plan_closing(self, all_reserved):
        for day, stadium_nm, goumen, times, fee, reserve_no in all_reserved:
            reserved_data = self.dao.get_reserved_status_data(day)
            unreserved = [r for r in reserved_data if r[2] is None]
            if len(unreserved) == 0:
                # 未予約が無いプランを確定させる
                self.dao.determined_plan(day)

    def update_reserve_result(self, all_reserved):
        self.log.debug(f'all_reserved={all_reserved}')  # all_reservedは予約確定画面のscrapingから取得した情報

        cnt_reserved = 0
        for day, stadium_nm, goumen, times, fee, reserve_no in all_reserved:
            t_month = int(day[4:6])
            stadium = Stadium.full_nm_of(stadium_nm)
            time_ptn = TimeboxResolver(stadium).get(t_month)

            for timebox in times:
                target = self.dao.get_target_from_result_data(day, stadium.nm, time_ptn.index(timebox))

                gno = get_goumen_num(goumen)
                if gno not in target.gno_csv.split(','):
                    self.log.info(f'ターゲットに無い号面が予約された: [{day}][{stadium_nm}][{timebox} goumen={gno}')

                reserve_list = target.reserve_gno_csv.split(',') if target.reserve_gno_csv != '' else []
                reserve_list.append(gno)

                target.status = '予約有'
                target.reserve_gno_csv = ','.join(reserve_list)
                cnt_reserved += 1
                # 保存
                self.dao.tx_save_reserve_result(target, reserve_no, gno)
                self.log.debug(f'結果保存: 予約No{reserve_no} target_id={target.id}')

        return cnt_reserved
