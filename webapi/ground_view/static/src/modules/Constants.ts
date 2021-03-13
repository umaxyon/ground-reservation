export const STADIUMS: Map<string, string[]> = new Map(Object.entries({
    '大森': ['昭和島運動場', '平和島公園'],
    '大田ST': ['大田ｽﾀｼﾞｱﾑ'],
    '調布': ['東調布公園'],
    '糀谷・羽田': ['萩中公園'],
    '蒲田': ['多摩川緑地', '六郷橋緑地', '大師橋緑地', 'ｶﾞｽ橋緑地']
}))


export const TIME_RANGES: Map<string, string[]> = new Map(Object.entries({
    '昭和島運動場': ['07-09','09-11','11-13','13-15','15-17'],
    '平和島公園': ['07-09','09-11','11-13','13-15','15-17'],
    '大田ｽﾀｼﾞｱﾑ': ['07-09','09-11','11-13','13-15','15-17','17-19','19-21'],
    '東調布公園': ['08-10','10-12','12-14','14-16'],
    '萩中公園': ['08-10','10-12','12-14','14-16'],
    '多摩川緑地': ['07-09','09-11','11-13','13-15','15-17'],
    '六郷橋緑地': ['07-09','09-11','11-13','13-15','15-17'],
    '大師橋緑地': ['07-09','09-11','11-13','13-15','15-17'],
    'ｶﾞｽ橋緑地': ['07-09','09-11','11-13','13-15','15-17']
}))


export const GOUMENS: Map<string, string[]> = new Map(Object.entries({
    '昭和島運動場': ['1','2','3'],
    '平和島公園': ['1'],
    '大田ｽﾀｼﾞｱﾑ': ['1'],
    '東調布公園': ['1'],
    '萩中公園': ['1'],
    '多摩川緑地': ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],
    '六郷橋緑地': ['1','2','3','4','5'],
    '大師橋緑地': ['1','2'],
    'ｶﾞｽ橋緑地': ['1','2','3','4','6','7','8']
}))


export const STADIUM_KEYS: Map<string, string> = new Map(Object.entries({
    '昭和島運動場': 'showajima', '平和島公園': 'heiwajima',
    '大田ｽﾀｼﾞｱﾑ': 'ootast',
    '東調布公園': 'higashichofu',
    '萩中公園': 'haginaka',
    '多摩川緑地': 'tamagawa', '六郷橋緑地': 'rokugobashi', '大師橋緑地': 'taisibashi', 'ｶﾞｽ橋緑地': 'gasubashi'
}))