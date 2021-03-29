import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ajax from '../utils';
import { AppDispatch, RootState } from '../store';
import {
    AREAS,
    STADIUMS_DEFAULT_SELECT,
    GOUMENS_DEFAULT_SELECT,
    TimeResolver
} from "./Constants";
import {
    planDateInit
} from "./PlanListSlice";

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

export interface IReserved {
    [key: string]: {
        [key: string]: {
            [key: string]: string[]
        }
    }
}

export interface GoumenDialog {
    open: boolean,
    area: string,
    stadium: string,
    checked: string[]
}
export interface ErrorDialog {
    open: boolean,
    title: string,
    message: string
}

export interface Target {
    date: string,
    areas: string[],
    stadiums: IStadium,
    times: ITimes,
    goumens: IGoumen,
    reserved: IReserved,
    total: number
}

interface TargetsState {
    open: boolean,
    mode: string,
    watchStart: boolean,
    preEditDate: string,
    condition: Target,
    targets: Target[],
    goumenDialog: GoumenDialog,
    errorDialog: ErrorDialog
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
    reserved: {},
    total: 0
}

const initialGomenDialog: GoumenDialog = {
    open: false,
    area: '',
    stadium: '',
    checked: []
}

const initialErrorDialog: ErrorDialog = {
    open: false,
    title: "",
    message: ""
}

const initialState: TargetsState = {
    open: false,
    mode: 'add',
    watchStart: false,
    preEditDate: '',
    condition,
    targets: [],
    goumenDialog: initialGomenDialog,
    errorDialog: initialErrorDialog,
}

const countGoumens = (condition: Target) => {
    const { goumens, times } = condition;
    const total = Object.keys(goumens).map(area => {
        times[area]
        return Object.keys(goumens[area]).map(stadium => {
            const selectTimeCnt = (area in times && stadium in times[area]) ? times[area][stadium].length : 0;
            return goumens[area][stadium].length * selectTimeCnt;
        })
    }).reduce((ac, cv) => ac.concat(cv), []).reduce((ac, cv) => ac + cv, 0);
    return total;
}

const getAddedDiffListForStadium = (state: any, area: string, newStadiums: string[]): string[] => {
    const stadiums = state.condition.stadiums[area];
    return (stadiums) ? newStadiums.filter(k => ! (stadiums.includes(k))) : newStadiums;
}

const adjustGoumenTimesForArea = (state: any, newArea: string[], pickerMonth: number) => {
    const oldAreas: string[] = state.condition.areas;
    // 追加されたエリアの号面と時間帯に初期値投入
    newArea.filter(k => ! (oldAreas.includes(k))).forEach(k => {
        adjustGoumenForStudium(state, k, STADIUMS_DEFAULT_SELECT[k]);
        adujustTimesForStudium(state, k, STADIUMS_DEFAULT_SELECT[k], pickerMonth);
        state.condition.stadiums[k] = STADIUMS_DEFAULT_SELECT[k];
    });
    // 削除された球場の豪面と時間帯クリア
    oldAreas.filter(k => ! (newArea.includes(k))).forEach(deletedArea => {
        adjustGoumenForStudium(state, deletedArea, []);
        adujustTimesForStudium(state, deletedArea, [], pickerMonth);
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

const adujustTimesForStudium =(state: any, area: string, newStadiums: string[], pickerMonth: number) => {
    state.condition.times[area] = state.condition.times[area] || {};

    // 追加された球場の時間帯初期値投入
    getAddedDiffListForStadium(state, area, newStadiums).forEach(stadium => {
        state.condition.times[area][stadium] = new TimeResolver(stadium).get_default(pickerMonth);
    });

    // 削除された球場の時間帯クリア
    const timesStadiums: {[key: string]: string[]} = state.condition.times[area] || {};
    Object.keys(timesStadiums).filter(k => ! (newStadiums.includes(k))).forEach(k => {
        state.condition.times[area][k] = []
    });
}


export const loadTargetsFromDate = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'planList/loadTargetsFromDate',
    async (param, thunk) => {
        const date = thunk.getState().PlanListSlice.pickerDateTmp;
        return await ajax({ url: "/ground_view/get_targets/", params: { date }})
            .then((resp: any) => {
                thunk.dispatch(planDateInit({}));
                return resp;
            });
    }
)


const TargetsSlice = createSlice({
    name: "TargetsSlice",
    initialState,
    reducers: {
        initNewTarget: (state, action) => {
            const areas: string[] = action.payload.areas;
            const pickerMonth: number = action.payload.pickerMonth;
            state.condition.areas = areas;
            areas.map(area => {
                state.condition.stadiums[area] = [...STADIUMS_DEFAULT_SELECT[area]];
                state.condition.times[area] = {};
                state.condition.goumens[area] = {};
                state.condition.stadiums[area].map(stadium => {
                    state.condition.times[area][stadium] = new TimeResolver(stadium).get_default(pickerMonth);
                    state.condition.goumens[area][stadium] = GOUMENS_DEFAULT_SELECT[stadium];
                });
            });
            state.condition.date = action.payload.date;
            state.condition.total = countGoumens(state.condition);
            state.mode = 'add';
            state.preEditDate = '';
            state.open = true;
        },
        openEditTarget: (state, action) => {
            const dt = action.payload;
            const conditions: Target[] = state.targets.filter(t => t.date === dt);
            state.condition = conditions.length > 0 ? conditions[0] : state.condition;
            state.mode = 'edit';
            state.preEditDate = dt;
            state.open = true;
        },
        closeAndClearTarget: (state, action) => {
            state.condition = {...condition}
            state.open = false;
        },
        changeWatch: (state, action) => {
            state.watchStart = action.payload
        },
        changeTargetArea: (state, action) => {
            const newArea: string[] = action.payload.area;
            const pickerMonth: number = action.payload.pickerMonth;

            adjustGoumenTimesForArea(state, newArea, pickerMonth);

            state.condition.areas = newArea;
            state.condition.total = countGoumens(state.condition);
        },
        changeTargetStadium: (state, action) => {
            const area: string = action.payload.area;
            const pickerMonth = action.payload.pickerMonth
            const newStadiums: string[] = action.payload.value;

            adjustGoumenForStudium(state, area, newStadiums);
            adujustTimesForStudium(state, area, newStadiums, pickerMonth);

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
        changeMode: (state, action) => {
            state.mode = action.payload;
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
        createTargetAndClose: (state, action) => {
            const target = state.condition
            if (state.mode === 'edit') {
                const targets: Target[] = state.targets.filter(t => t.date !== state.preEditDate)
                state.targets = targets;
            }
            if (state.mode !== 'week') {
                state.targets.push(target);
            }
            state.condition = {...condition}
            state.open = false;
        },
        openErrorDialog: (state, action) => {
            const { title, message } = action.payload;
            state.errorDialog.title = title;
            state.errorDialog.message = message;
            state.errorDialog.open = true;
        },
        closeErrorDialog: (state, action) => {
            state.errorDialog = initialErrorDialog;
        },
        clearAllTarget: (state, action) => {
            state.targets = []
        },
        allTargetDateChange: (state, action) => {
            const dt = action.payload;
            const newTargets = state.targets.map(t => {
                t.date = dt;
                return t;
            });
            state.targets = newTargets;
        },
        setWeekMode: (state, action) => {
            const { condition } = action.payload;
            state.condition = condition;
            state.mode = 'week';
        },
        updateTotal: (state, action) => {
            state.condition.total = countGoumens(state.condition);
        },
        callbackLoadTargetsFromDate: (state, action) => {
            const target = action.payload;
            state.condition = target;
            state.targets = [target];
            state.mode = 'edit';
        }
    },
    extraReducers: builder => {
        builder.addCase(loadTargetsFromDate.fulfilled, (state, action) => {
            TargetsSlice.caseReducers.callbackLoadTargetsFromDate(state, action)
        });
    }
});

export const {
    initNewTarget,
    openEditTarget,
    closeAndClearTarget,
    changeWatch,
    changeMode,
    changeTargetArea,
    changeTargetStadium,
    changeTargetTime,
    changeTargetGoumen,
    openGomenDialog,
    closeGomenDialog,
    commitGoumenDialog,
    checkGoumen,
    openErrorDialog,
    closeErrorDialog,
    createTargetAndClose,
    clearAllTarget,
    allTargetDateChange,
    setWeekMode } = TargetsSlice.actions;
export default TargetsSlice.reducer;