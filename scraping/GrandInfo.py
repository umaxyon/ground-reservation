from Model import Stadium

# name_map = {
#     '昭和島運動場野球場': '昭和島運動場',
#     '平和島公園野球場': '平和島公園',
#     '東調布公園': '東調布公園',
#     '多摩川緑地野球場': '多摩川緑地',
#     '多摩川六郷橋緑地野球場': '六郷橋緑地',
#     '多摩川ガス橋緑地野球場': 'ガス橋緑地',
#     '多摩川大師橋緑地野球場': '大師橋緑地'
# }

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
        name = Stadium.full_nm_of(buf[0]) or buf[0]
        # name = name_map[buf[0]] if buf[0] in name_map else buf[0]
        if len(buf) == 2:
            return name, buf[1].translate(ZEN_HAN_TRANS).replace('号面', '')
        else:
            return name, ''

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

    async def select_mokuteki(self):
        mokuteki_select = await self.page.JJ('form > div > table.STTL > tbody > tr.WTBL select')
        if mokuteki_select is None:
            return False  # 時間外

        for num, sel in enumerate(mokuteki_select):
            # TODO 軟式野球が無い場合、エラーログ出力
            await self.page.select(f'select[name=LST_RIYOUMOKUTEKI_{num + 1}', '60')

        return True
