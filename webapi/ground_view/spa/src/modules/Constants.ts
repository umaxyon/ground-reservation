export const IS_LOCAL = false;
export const SUB_DOMAIN = (IS_LOCAL) ? 'dist' : 'ground_view';

export const AREAS: string[] = [
    '大森', '大田ST', '調布', '糀谷・羽田', '蒲田'
]

export const AREA_KEYS = new Map(Object.entries({
    '大森': 'oomori', '大田ST': 'oota', '調布': 'chofu', '糀谷・羽田': 'kojitani', '蒲田': 'kamata'
}))


export const STADIUMS: {[key: string]: string[]} = {
    '大森': ['昭和島運動場', '平和島公園'],
    '大田ST': ['大田ｽﾀｼﾞｱﾑ'],
    '調布': ['東調布公園'],
    '糀谷・羽田': ['萩中公園'],
    '蒲田': ['多摩川緑地', '六郷橋緑地', '大師橋緑地', 'ｶﾞｽ橋緑地']
}

export const STADIUMS_DEFAULT_SELECT: {[key: string]: string[]} = {
    '大森': ['昭和島運動場', '平和島公園'],
    '大田ST': ['大田ｽﾀｼﾞｱﾑ'],
    '調布': ['東調布公園'],
    '糀谷・羽田': ['萩中公園'],
    '蒲田': ['多摩川緑地', '六郷橋緑地', 'ｶﾞｽ橋緑地']
}


const time_ptn = {
    1: ['07-09', '09-11', '11-13', '13-15', '15-17'],
    2: ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
    3: ['08-10', '10-12', '12-14', '14-16'],
    4: ['06-08', '08-10', '10-12', '12-14', '14-16', '16-18'],
    5: ['09-11', '11-13', '13-15', '15-17', '17-19', '19-21']
}

const timebox_table: {[keys: string]: { [keys: number]: string[]}} = {
    '昭和島運動場': {0: time_ptn[1], 1: time_ptn[4]},
    '平和島公園': {0: time_ptn[1], 1: time_ptn[4]},
    '大田ｽﾀｼﾞｱﾑ': {0: time_ptn[2], 1: time_ptn[2]},
    '東調布公園': {0: time_ptn[3], 1: time_ptn[5]},
    '萩中公園': {0: time_ptn[3], 1: time_ptn[2]},
    '多摩川緑地': {0: time_ptn[1], 1: time_ptn[4]},
    '六郷橋緑地': {0: time_ptn[1], 1: time_ptn[4]},
    '大師橋緑地': {0: time_ptn[1], 1: time_ptn[4]},
    'ｶﾞｽ橋緑地': {0: time_ptn[1], 1: time_ptn[4]}
}

const timebox_default_table: {[keys: string]: { [keys: number]: string[]}} = {
    '昭和島運動場': {
        0: ['07-09','09-11','11-13'],
        1: ['08-10', '10-12']},
    '平和島公園': {
        0: ['07-09','09-11','11-13'],
        1: ['08-10', '10-12']},
    '大田ｽﾀｼﾞｱﾑ': {
        0: ['07-09','09-11','11-13'],
        1: ['07-09','09-11','11-13']},
    '東調布公園': {
        0: ['08-10','10-12'],
        1: ['09-11', '11-13']},
    '萩中公園': {
        0: ['08-10','10-12'],
        1: ['07-09', '09-11']},
    '多摩川緑地': {
        0: ['07-09','09-11'],
        1: ['08-10', '10-12']},
    '六郷橋緑地': {
        0: ['07-09','09-11'],
        1: ['08-10', '10-12']},
    '大師橋緑地': {
        0: ['07-09','09-11'],
        1: ['08-10', '10-12']},
    'ｶﾞｽ橋緑地': {
        0: ['07-09','09-11'],
        1: ['08-10', '10-12']}
}

export class TimeResolver {
    stadium: string = "";
    time_ptn: {[keys: number]: string[]} = {}
    default_ptn: {[keys: number]: string[]} = {}

    constructor(stadium: string) {
        this.stadium = stadium;
        this.time_ptn = timebox_table[this.stadium];
        this.default_ptn = timebox_default_table[this.stadium];
    }

    private get_ptn(month: number, ptn: {[keys: number]: string[]}) {
        if (!month) {
            return [];
        }

        // TODO 4月からいつまで同じ日付パターンなのか不明。
        const time_idx = (Number(month) <= 3 ) ? 0 : 1
        return ptn[time_idx];
    }

    get(month: number) {
        return this.get_ptn(month, this.time_ptn);
    }

    get_default(month: number) {
        return this.get_ptn(month, this.default_ptn);
    }
}

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

export const GOUMENS_DEFAULT_SELECT: {[key: string]: string[]} = {
    '昭和島運動場': ['1','2','3'],
    '平和島公園': ['1'],
    '大田ｽﾀｼﾞｱﾑ': ['1'],
    '東調布公園': ['1'],
    '萩中公園': ['1'],
    '多摩川緑地': ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],
    '六郷橋緑地': ['1','2','3','4','5'],
    '大師橋緑地': ['1','2'],
    'ｶﾞｽ橋緑地': ['1','2','3','4','6','7','8']
}


export const STADIUM_KEYS: Map<string, string> = new Map(Object.entries({
    '昭和島運動場': 'showajima', '平和島公園': 'heiwajima',
    '大田ｽﾀｼﾞｱﾑ': 'ootast',
    '東調布公園': 'higashichofu',
    '萩中公園': 'haginaka',
    '多摩川緑地': 'tamagawa', '六郷橋緑地': 'rokugobashi', '大師橋緑地': 'taisibashi', 'ｶﾞｽ橋緑地': 'gasubashi'
}))


export const WEEK: string[] = [
    '月', '火', '水', '木', '金', '土', '日'
]

export const WEEK_KEYS = new Map(Object.entries({
    '月': 'mon', '火': 'tue', '水': 'wed', '木': 'thu', '金': 'fri', '土': 'sat', '日': 'san'
}))