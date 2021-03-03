import asyncio
from pyppeteer import launch
from ReservationCalender import ReservationCalender
from GrandInfo import GrandInfo

OOTA = 1
HAGINAKA = 3
KAMATA = 4

TARGET_GROUNDS = [OOTA, HAGINAKA, KAMATA]


class Scraper:
    def __init__(self):
        self.mode = {'headless': False, 'appMode': True, 'devtools': False}
        self.viewport = {'width': 1200, 'height': 1000}
        self.page = None

    async def get_init_page(self):
        browser = await launch(**self.mode)
        page = await browser.newPage()
        await page.setViewport(self.viewport)
        await page.goto('http://www.yoyaku.city.ota.tokyo.jp/')
        await page.waitForNavigation()
        self.page = page

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

    async def click_ground_area_button(self, num):
        btns = await self.page.JJ('.btnlr')
        await btns[num].click()
        await self.page.waitForNavigation()

    async def click_to_menu_button(self):
        btn_menu = await self.page.J('body > table:first-child a')
        await btn_menu.click()
        await self.page.waitForNavigation()

    async def login(self):
        btn = await self.page.J('form > div > table:last-child a')
        await btn.click()
        await self.page.waitForNavigation()
        await self.page.waitForSelector('input[name=PWD] + div > a')
        await self.page.type('input[name=ID]', "00124574")
        await self.page.type('input[name=PWD]', "123456")
        login_btn = await self.page.J('input[name=PWD] + div > a')
        await login_btn.click()
        await self.page.waitForNavigation()

    async def run(self):
        await self.get_init_page()

        for target in TARGET_GROUNDS:
            await self.move_baseball_reserve_top()
            await self.click_ground_area_button(target)
            await self.login()

            cal = ReservationCalender(self.page)
            await cal.describe_calender()

            skip = True
            for cd in cal.open_days:
                if skip and cd.current:
                    skip = False

                if skip:
                    continue

                print(cd)
                cal = ReservationCalender(self.page)
                await cal.describe_calender()
                await cal.click_day(cd)

                info = GrandInfo(self.page)
                await info.describe_grand_info()

            print(cal.open_days)
            await self.click_to_menu_button()


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(Scraper().run())
