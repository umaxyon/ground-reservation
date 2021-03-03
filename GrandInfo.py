name_map = {
    '多摩川緑地野球場': '多摩川緑地',
    '多摩川六郷橋緑地野球場': '六郷橋緑地',
    '多摩川ガス橋緑地野球場': 'ガス橋緑地',
    '多摩川大師橋緑地野球場': '大師橋緑地'
}

normal_time_table = ['07-09', '09-11', '11-13', '13-15', '15-17']
summer_time_table = ['08-10', '10-12', '12-14', '14-16', '16-18']

ZEN_HAN_TRANS = str.maketrans({chr(0xFF01 + i): chr(0x21 + i) for i in range(94)})


class GrandInfo:
    def __init__(self, page):
        self.page = page
        self.time_tbl = normal_time_table
        self.open_grounds = {}

    async def get_name(self, td):
        title = await self.page.evaluate('elm => elm.innerHTML', td)
        ground_name = [v.strip() for v in title.split('<br>')][1]
        buf = ground_name.split('_')
        name = name_map[buf[0]] if buf[0] in name_map else buf[0]
        return f'{name}_{buf[1].translate(ZEN_HAN_TRANS)}'

    async def describe_grand_info(self):
        trs = await self.page.JJ('div > table.STTL > tbody > tr:last-child')
        for tr in trs:
            tds = await tr.JJ('td')
            name = await self.get_name(tds[0])
            open_buf = []
            for i in range(4):
                btn = await tds[i + 2].J('input[type=button]')
                if btn is not None:
                    open_buf.append(self.time_tbl[i])
            if len(open_buf) > 0:
                self.open_grounds[name] = open_buf

        print(self.open_grounds)
