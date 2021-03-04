import re
import datetime as dt


async def get_style(page, elm):
    return await page.evaluate('(elm) => JSON.parse(JSON.stringify(getComputedStyle(elm)))', elm)


async def get_class(page, elm):
    return await page.evaluate('elm => elm.className', elm)


def get_ym(ym):
    m = re.match(r'(\d+)年(\d)月', ym)
    return m.group(1), m.group(2)


class CalDay:
    def __init__(self, year, month, day, is_current_day, td):
        self.year = year
        self.month = month
        self.day = day
        w = dt.datetime(int(year), int(month), int(day)).weekday()
        self.week_day = ['月', '火', '水', '木', '金', '土', '日'][w]
        self.current = is_current_day
        self.td = td

    def __repr__(self):
        return f'{self.year}/{self.month:0>2}/{self.day:0>2}({self.week_day})'

    def equal_day(self, other):
        return self.year == other.year and self.month == other.month and self.day == other.day


class ReservationCalender:
    def __init__(self, page):
        self.page = page
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

    async def click_day(self, cal_day):
        target = None
        for cd in self.open_days:
            if cd.equal_day(cal_day):
                target = cd
                break
        if target is not None:
            await target.td.click()
            await self.page.waitForNavigation()
        else:
            print(f'not in target. {cal_day}')

    async def click_next_month(self):
        cal_frame = await self.get_calendar_frame()
        btns = await cal_frame[0].JJ('td.SETSUMEI + td > a')
        await btns[1].click()
        await self.page.waitForNavigation()

    async def is_not_next_page(self):
        err = await self.page.J('td.LBATR')
        return err is not None

    async def describe_calender(self):
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
            self.open_days.append(CalDay(self.year, self.month, day.strip(), is_current_day, td))
