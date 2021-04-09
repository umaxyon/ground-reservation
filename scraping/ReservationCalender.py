import re
from scraping.Dao import Target
from ground_view.batch.Share import CalDay


async def get_style(page, elm):
    return await page.evaluate('(elm) => JSON.parse(JSON.stringify(getComputedStyle(elm)))', elm)


async def get_class(page, elm):
    return await page.evaluate('elm => elm.className', elm)


def get_ym(ym):
    m = re.match(r'(\d+)年(\d)月', ym)
    return m.group(1), m.group(2)


class ReservationCalender:
    def __init__(self, scraper):
        self.log = scraper.log
        self.page = scraper.page
        self.year = None
        self.month = None
        self.open_days = []

    async def get_calendar_frame(self):
        return await self.page.JJ('table td.SETSUMEI > table')

    async def get_yyyy_mm(self, cal_frame):
        ym = await cal_frame[0].Jeval('td.SETSUMEI', '(ele) => ele.textContent')
        self.year, self.month = get_ym(ym.strip())

    async def get_available_days_td_list(self, cal_frame):
        cal_td = await cal_frame[1].JJ('tbody > tr.WTBL > td.NATR')
        tds = []
        for i in range(1, len(cal_td)):
            styles = await get_style(self.page, cal_td[i])
            is_current_day = styles['backgroundColor'] == "rgb(153, 255, 102)"

            td = await cal_td[i].J('td')
            if td is not None:
                day = await self.page.evaluate('elm => elm.textContent', td)
                tds.append((day, td, is_current_day))
        return tds

    async def get_match_days(self, t: Target):
        await self.describe_calender()
        return [d for d in self.open_days if d.equal_day(t.calday)]

    def is_open_day(self, ym, dt):
        cald = CalDay(int(str(ym)[0:4]), int(str(ym)[4:6]), dt)
        return len([d for d in self.open_days if d.equal_day(cald)]) == 1

    async def click_day(self, cal_day):
        target = None
        await self.describe_calender()
        for cd in self.open_days:
            if cd.equal_day(cal_day):
                target = cd
                break
        if target is not None:
            await target.td.click()
            await self.page.waitForNavigation()
        else:
            self.log.warn(f'not in target. {cal_day}')

    async def click_next_month(self):
        cal_frame = await self.get_calendar_frame()
        btns = await cal_frame[0].JJ('td.SETSUMEI + td > a')
        await btns[1].click()
        await self.page.waitForNavigation()

    async def is_not_next_page(self):
        err = await self.page.J('td.LBATR')
        return err is not None

    async def fit_month(self, ym):
        # 2ヶ月以上先は登録できない事を前提として、ymはcal_ymの1月先以上はあり得ない前提で回さない
        cal_ym = int(f"{self.year}{self.month:0>2}")
        if ym > cal_ym:
            await self.click_next_month()
            if await self.is_not_next_page():
                return False

            await self.describe_calender()
        return True

    async def describe_calender(self):
        self.open_days = []
        cal_frame = await self.get_calendar_frame()
        await self.get_yyyy_mm(cal_frame)  # 年月

        cal_td = await cal_frame[1].JJ('tbody > tr.WTBL > td.NATR')
        for i in range(1, len(cal_td)):
            styles = await get_style(self.page, cal_td[i])
            is_current_day = styles['backgroundColor'] == "rgb(153, 255, 102)"

            td = await cal_td[i].J('td')
            if td is None:
                continue  # カレンダー日付無し

            class_name = await get_class(self.page, td)

            if class_name == "BLANKMARK":
                continue  # 空きなし

            day = await self.page.evaluate('elm => elm.textContent', td)
            self.open_days.append(CalDay(int(self.year), int(self.month), int(day.strip()), is_current_day, td))

        return self
