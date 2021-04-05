import os
from distutils.util import strtobool
from pyppeteer import launch
from ground_view.batch.Share import pass_decode, Area


OOMORI = 0
OOTA = 1
CHOFU = 2
HAGINAKA = 3
KAMATA = 4

TARGET_GROUNDS = [OOMORI, OOTA, CHOFU, HAGINAKA, KAMATA]
AREA_NAME = {OOMORI: "大森", OOTA: "太田スタジアム", CHOFU: "調布", HAGINAKA: "糀谷・羽田", KAMATA: "蒲田"}


class Scraper:
    def __init__(self, log, dao, account, pswd):
        self.log = log
        headless = bool(strtobool(os.getenv('HEADLESS', default='True')))
        no_sand = bool(strtobool(os.getenv('NO_SANDBOX', default='True')))
        arg_no_sand = "--no-sandbox" if no_sand else ""
        self.mode = {'headless': headless, 'appMode': True, 'devtools': False, 'options': {'args': [arg_no_sand]}}
        self.viewport = {'width': 1200, 'height': 1000}
        self.browser = None
        self.page = None
        self.dao = dao

        self.account = account
        self.pswd = pass_decode(pswd)

    async def get_init_page(self):
        async def __access():
            try:
                self.browser = await launch(**self.mode)
                page = await self.browser.newPage()
                await page.setViewport(self.viewport)
                await page.goto('http://www.yoyaku.city.ota.tokyo.jp/')
                await page.waitForNavigation()
                self.page = page
            except Exception as e:
                self.log.error(e)
                self.log.error(type(e))
                await self.browser.close()

        await __access()

    async def move_baseball_reserve_top(self):
        css_selector = (
            'form > table > tbody > tr > td:nth-child(1) > div:nth-child(5) > '
            'table > tbody > tr > td:last-child > table > tbody > tr:nth-child(2) a'
        )
        a = await self.page.J(css_selector)
        await a.click()
        await self.page.waitForNavigation()
        baseball_btn = await self.page.J('.nb01 > tbody > tr:nth-child(3) > td:nth-child(3)')
        await baseball_btn.click()
        await self.page.waitForNavigation()

    async def click_ground_area_button(self, area_nm):
        num = Area.nm_of(area_nm).id
        btns = await self.page.JJ('.btnlr')
        await btns[num].click()
        await self.page.waitForNavigation()

    async def login(self):
        btn = await self.page.J('form > div > table:last-child a')
        await btn.click()
        await self.page.waitForNavigation()
        await self.page.waitForSelector('input[name=PWD] + div > a')
        await self.page.type('input[name=ID]', self.account)
        await self.page.type('input[name=PWD]', self.pswd)
        login_btn = await self.page.J('input[name=PWD] + div > a')
        await login_btn.click()
        await self.page.waitForNavigation()

        # 文言「利用者または暗証番号がまちがっています。」
        login_err = await self.page.J(
            'form > div > div> table:first-child > tbody > tr > td > div > table > tbody > tr:nth-child(2) > td.LBATR')

        if login_err:
            self.log.info(f'利用者または暗証番号がまちがっています。 account={self.account}')

        return login_err is None

    async def click_to_menu_button(self):
        btn_menu = await self.page.J('body > table:first-child a')
        await btn_menu.click()
        await self.page.waitForNavigation()

    # async def get_ground_info_list_in_month(self, cal):
    #     ret = []
    #     skip = True
    #     for cd in cal.open_days:
    #         if skip and cd.current:
    #             skip = False
    #
    #         if skip:
    #             continue
    #
    #         cal = ReservationCalender(self)
    #         await cal.describe_calender()
    #         await cal.click_day(cd)
    #
    #         info = GrandInfo(self.page, cd, self.log)
    #         await info.describe_grand_info()
    #         ret.append(info)
    #
    #     return ret
    #
    # def save(self, infos):
    #     params = []
    #     for area, info_list in infos.items():
    #         for info in info_list:
    #             params.extend(info.to_insert_param(AREA_NAME[area]))
    #     self.dao.recreate_groundinfo(params)
    #
    # async def run(self):
    #     await self.get_init_page()
    #     infos = {}
    #
    #     for target in TARGET_GROUNDS:
    #         self.log.debug(AREA_NAME[target])
    #         await self.move_baseball_reserve_top()
    #         await self.click_ground_area_button(target)
    #         await self.login()
    #
    #         infos[target] = []
    #         while True:
    #             cal = ReservationCalender(self)
    #             await cal.describe_calender()
    #
    #             month_info_list = await self.get_ground_info_list_in_month(cal)
    #             infos[target].extend(month_info_list)
    #
    #             await cal.click_next_month()
    #             if await cal.is_not_next_page():
    #                 await self.click_to_menu_button()
    #                 break
    #
    #     self.save(infos)
    #     await self.browser.close()

