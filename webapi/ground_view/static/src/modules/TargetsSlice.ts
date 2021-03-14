import { createSlice, Dispatch } from "@reduxjs/toolkit";
import {
    AREAS,
    STADIUMS, STADIUMS_DEFAULT_SELECT,
    TIME_RANGES_DEFAULT_SELECT,
    GOUMENS_DEFAULT_SELECT
} from "./Constants";

export interface ITimes {
    [key: string]: {
        [key: string]: string[]
    }
}

export interface IGoumen {
    [key: string]: {
        [key: string]: string[]
    }
}

export interface IStadium {
    [key: string]: string[]
}

export interface GoumenDialog {
    open: boolean,
    area: string,
    stadium: string,
    checked: string[]
}

interface Target {
    date: string,
    areas: string[],
    stadiums: IStadium,
    times: ITimes,
    goumens: IGoumen
    total: number
}

interface TargetsState {
    state: 'initial'|'modify_date'|'modify_area',
    open: boolean,
    condition: Target,
    targets: Target[],
    goumenDialog: GoumenDialog
}

const initStadiumsOb = (): IStadium => {
    const ob: IStadium = {}
    AREAS.forEach(area => ob[area] = []);
    return ob;
}

const condition: Target = {
    date: '',
    areas: [],
    stadiums: initStadiumsOb(),
    times: {},
    goumens: {},
    total: 0
}

const initialGomenDialog: GoumenDialog = {
    open: false,
    area: '',
    stadium: '',
    checked: []
}

const initialState: TargetsState = {
    state: 'initial',
    open: false,
    condition,
    targets: [],
    goumenDialog: initialGomenDialog
}

const countGoumens = (condition: Target) => {
    const { goumens, times } = condition;
    const total = Object.keys(goumens).map(area => {
        times[area]
        return Object.keys(goumens[area]).map(stadium => {
            const selectTimeCnt = (area in times && stadium in times[area]) ? times[area][stadium].length : 0;
            return goumens[area][stadium].length * selectTimeCnt;
        })
    }).reduce((ac, cv) => ac.concat(cv)).reduce((ac, cv) => ac + cv);
    return total;
}

const getAddedDiffListForStadium = (state: any, area: string, newStadiums: string[]): string[] => {
    return newStadiums.filter(k => ! (state.condition.stadiums[area].includes(k)))
}

const adjustGoumenTimesForArea = (state: any, newArea: string[]) => {
    const oldAreas: string[] = state.condition.areas;
    // 追加されたエリアの号面と時間帯に初期値投入
    newArea.filter(k => ! (oldAreas.includes(k))).forEach(k => {
        adjustGoumenForStudium(state, k, STADIUMS_DEFAULT_SELECT[k]);
        adujustTimesForStudium(state, k, STADIUMS_DEFAULT_SELECT[k]);
        state.condition.stadiums[k] = STADIUMS_DEFAULT_SELECT[k];
    });
    // 削除された球場の豪面と時間帯クリア
    oldAreas.filter(k => ! (newArea.includes(k))).forEach(deletedArea => {
        adjustGoumenForStudium(state, deletedArea, []);
        adujustTimesForStudium(state, deletedArea, []);
        state.condition.stadiums[deletedArea] = []
    });
}

const adjustGoumenForStudium = (state: any, area: string, newStadiums: string[]) => {
    state.condition.goumens[area] = state.condition.goumens[area] || {};

    // 追加された球場の号面初期値投入
    getAddedDiffListForStadium(state, area, newStadiums).forEach(stadium => {
        state.condition.goumens[area][stadium] = GOUMENS_DEFAULT_SELECT[stadium]
    });

    // 削除された球場の号面クリア
    const gomenStadiums: {[key: string]: string[]} = state.condition.goumens[area] || {};
    Object.keys(gomenStadiums).filter(k => ! (newStadiums.includes(k))).forEach(k => {
        state.condition.goumens[area][k] = []
    });
}

const adujustTimesForStudium =(state: any, area: string, newStadiums: string[]) => {
    state.condition.times[area] = state.condition.times[area] || {};

    // 追加された球場の時間帯初期値投入
    getAddedDiffListForStadium(state, area, newStadiums).forEach(stadium => {
        state.condition.times[area][stadium] = TIME_RANGES_DEFAULT_SELECT[stadium]
    });

    // 削除された球場の時間帯クリア
    const timesStadiums: {[key: string]: string[]} = state.condition.times[area] || {};
    Object.keys(timesStadiums).filter(k => ! (newStadiums.includes(k))).forEach(k => {
        state.condition.times[area][k] = []
    });
}

const TargetsSlice = createSlice({
    name: "TargetsSlice",
    initialState,
    reducers: {
        initNewTarget: (state, action) => {
            const areas: string[] = action.payload;
            state.condition.areas = areas;
            areas.map(area => {
                state.condition.stadiums[area] = [...STADIUMS_DEFAULT_SELECT[area]];
                state.condition.times[area] = {};
                state.condition.goumens[area] = {};
                state.condition.stadiums[area].map(stadium => {
                    state.condition.times[area][stadium] = TIME_RANGES_DEFAULT_SELECT[stadium];
                    state.condition.goumens[area][stadium] = GOUMENS_DEFAULT_SELECT[stadium];
                });
            });
            state.condition.total = countGoumens(state.condition);
            state.open = true;
        },
        cancelCloseTarget: (state, action) => {
            state.open = false;
        },
        changeTargetsDate: (state, action) => {
            state.condition.date = action.payload;
            state.targets = state.targets.map(t => t.date = action.payload)
        },
        changeTargetArea: (state, action) => {
            const newArea: string[] = action.payload;

            adjustGoumenTimesForArea(state, newArea)

            state.condition.areas = newArea;
            state.condition.total = countGoumens(state.condition);
        },
        changeTargetStadium: (state, action) => {
            const area: string = action.payload.area;
            const newStadiums: string[] = action.payload.value;

            adjustGoumenForStudium(state, area, newStadiums);
            adujustTimesForStudium(state, area, newStadiums);

            state.condition.stadiums[area] = newStadiums;
            state.condition.total = countGoumens(state.condition);
        },
        changeTargetTime: (state, action) => {
            const { area, stadium, value } = action.payload;
            const newTimes: ITimes = {...state.condition.times}
            newTimes[area] = (area in newTimes) ? newTimes[area] : {}
            newTimes[area][stadium] = value;

            state.condition.times = newTimes;
            state.condition.total = countGoumens(state.condition);
        },
        changeTargetGoumen: (state, action) => {
            const { area, stadium, value } = action.payload;
            const newGoumens: IGoumen = {...state.condition.goumens}
            newGoumens[area] = (area in newGoumens) ? newGoumens[area] : {}
            newGoumens[area][stadium] = value;

            state.condition.goumens = newGoumens;
            state.condition
        },
        openGomenDialog: (state, action) => {
            const { area, stadium } = action.payload;
            state.goumenDialog.area = area;
            state.goumenDialog.stadium = stadium;
            state.goumenDialog.open = true;
            if (area in state.condition.goumens && stadium in state.condition.goumens[area]) {
                state.goumenDialog.checked = state.condition.goumens[area][stadium];
            }
        },
        closeGomenDialog: (state, action) => {
            state.goumenDialog = initialGomenDialog;
        },
        commitGoumenDialog: (state, action) => {
            const { area, stadium, checked } = state.goumenDialog;
            if (! (area in state.condition.goumens)) {
                state.condition.goumens[area] = {}
            }
            state.condition.goumens[area][stadium] = checked;
            state.condition.total = countGoumens(state.condition);
            state.goumenDialog = initialGomenDialog;
        },
        checkGoumen: (state, action) => {
            let newArr = [...state.goumenDialog.checked];
            if (newArr.includes(action.payload)) {
                newArr = newArr.filter(n => n !== action.payload);
            } else {
                newArr.push(action.payload);
            }
            state.goumenDialog.checked = newArr;
        },
        updateTotal: (state, action) => {
            state.condition.total = countGoumens(state.condition);
        }
    }
});

// export const changeTargetAreaWithUpdateTotal = (val: any) => async (dispatch: Dispatch) => {
//     await dispatch(TargetsSlice.actions.chageTargetArea(val));
//     await dispatch(TargetsSlice.actions.updateTotal({}));
// }

export const {
    initNewTarget,
    cancelCloseTarget,
    changeTargetsDate,
    changeTargetArea,
    changeTargetStadium,
    changeTargetTime,
    changeTargetGoumen,
    openGomenDialog,
    closeGomenDialog,
    commitGoumenDialog,
    checkGoumen } = TargetsSlice.actions;
export default TargetsSlice.reducer;