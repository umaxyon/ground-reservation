from ground_view.batch.Share import Stadium
from ground_view.batch.Share import DateTimeUtil as Du


unsupported = {
    'ｶﾞｽ橋緑地_5': 'selectboxに軟式野球が無い'
}

normal_time_table = ['07-09', '09-11', '11-13', '13-15', '15-17']
summer_time_table = ['08-10', '10-12', '12-14', '14-16', '16-18']

ZEN_HAN_TRANS = str.maketrans({chr(0xFF01 + i): chr(0x21 + i) for i in range(94)})


class GrandInfo:
    def __init__(self, scraper):
        self.scraper = scraper
        self.log = scraper.log
        self.page = scraper.page
        self.time_tbl = normal_time_table
        self.open_grounds = {}

    async def get_name(self, td):
        title = await self.page.evaluate('elm => elm.innerHTML', td)
        ground_name = [v.strip() for v in title.split('<br>')][1]
        buf = ground_name.split('_')
        st = Stadium.full_nm_of(buf[0]) or buf[0]
        # name = name_map[buf[0]] if buf[0] in name_map else buf[0]
        if len(buf) == 2:
            goumen = buf[1] if buf[1] != '野球場' else '1'
            return st.nm, goumen.translate(ZEN_HAN_TRANS).replace('号面', '')
        else:
            return st.nm, ''

    async def get_trs(self):
        return await self.page.JJ('div > table.STTL > tbody > tr:last-child')

    async def get_tds(self, tr_row_num):
        trs = await self.get_trs()
        return await trs[tr_row_num].JJ('td')

    def check_unsupported_target(self, target, gno):
        return f'{target.gname}_{gno}' in unsupported.keys()

    async def click_abailable_target_btn(self, target):
        trs = await self.get_trs()
        click_cnt = 0

        self.log.debug(f"[{target.gname}]")
        for row, tr in enumerate(trs):
            tds = await self.get_tds(row)
            name, gno = await self.get_name(tds[0])

            if self.check_unsupported_target(target, gno) or target.gname != name or not target.is_target_gno(gno):
                continue

            for i in range(len(tds) - 2):
                if target.timebox == i:
                    tds = await self.get_tds(row)
                    btn = await tds[i + 2].J('input[type=button]')
                    if btn is not None:
                        await btn.click()
                        await self.scraper.page.waitForNavigation()
                        click_cnt += 1
        return click_cnt

    async def click_reservation_next_button(self):
        reservation_next_btn = await self.page.J('form > div > table:last-child a')
        await reservation_next_btn.click()
        await self.page.waitForNavigation()

    async def click_reservation_back_button(self):
        back_btn = await self.page.J('form > div > table:last-child a:first-child')
        await back_btn.click()
        await self.page.waitForNavigation()

    async def click_submit_reservation(self):
        sub_btn = await self.page.J('form > div > table:last-child a:last-child')
        await sub_btn.click()
        await self.page.waitForNavigation()

    async def click_continue_application(self):
        css = (
            'form > div > table > tbody > tr > td > table:last-of-type > '
            'tbody > tr:last-child a:first-child'
        )
        continue_btn = await self.page.J(css)
        await continue_btn.click()
        await self.page.waitForNavigation()

    async def get_reservation_no(self):
        css = (
            'form > div > table > tbody > tr > td > table:first-of-type > '
            'tbody > tr:nth-child(3) > td b'
        )
        item = await self.page.J(css)
        return await (await item.getProperty('textContent')).jsonValue()

    async def get_reservation_datas(self):
        css = (
            'form > div > table > tbody > tr > td > table:nth-of-type(3) > tbody > tr.WTBL'
        )
        trs = await self.page.JJ(css)
        ret = []
        for row, tr in enumerate(trs):
            if len(trs) - 1 == row:
                break  # 最終行は合計金額行なので不要

            tds = await trs[row].JJ('td')
            day = await self.page.evaluate('elm => elm.innerHTML', tds[1])
            stadium = await self.page.evaluate('elm => elm.innerHTML', tds[2])
            times = await self.page.evaluate('elm => elm.innerHTML', tds[3])
            fee = await self.page.evaluate('elm => elm.innerHTML', tds[5])

            day = Du.to_str(Du.from_str_jp(day))
            stadium = Stadium.full_nm_of(stadium.split('_')[0])
            times = [f"{r.split('-')[0][:2]}-{r.split('-')[1][:2]}" for r in times.split(' ') if r != '']

            ret.append((day, stadium, times, fee))
        return ret

    async def select_mokuteki(self):
        mokuteki_select = await self.page.JJ('form > div > table.STTL > tbody > tr.WTBL select')
        if mokuteki_select is None:
            return False  # 時間外

        for num, sel in enumerate(mokuteki_select):
            # TODO 軟式野球が無い場合、エラーログ出力
            await self.page.select(f'select[name=LST_RIYOUMOKUTEKI_{num + 1}', '60')

        return True
