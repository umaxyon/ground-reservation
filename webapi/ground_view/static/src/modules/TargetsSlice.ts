import { createSlice } from "@reduxjs/toolkit";

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

export interface GoumenDialog {
    open: boolean,
    area: string,
    stadium: string,
    checked: string[]
}

interface Target {
    date: string,
    areas: [string?],
    stadiums: {[key: string]: string[]},
    times: ITimes,
    goumens: IGoumen
    total: number
}

interface TargetsState {
    state: 'initial'|'modify_date'|'modify_area',
    condition: Target,
    targets: Target[],
    goumenDialog: GoumenDialog
}

const condition: Target = {
    date: '',
    areas: [],
    stadiums: {},
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
    condition,
    targets: [],
    goumenDialog: initialGomenDialog
}

const countGoumens = (goumens: IGoumen) => {
    const total = Object.keys(goumens).map(area => {
        return Object.keys(goumens[area]).map(stadium => goumens[area][stadium].length)
    }).reduce((ac, cv) => ac.concat(cv)).reduce((ac, cv) => ac + cv);
    return total;
}

const TargetsSlice = createSlice({
    name: "TargetsSlice",
    initialState,
    reducers: {
        changeTargetsDate: (state, action) => {
            state.condition.date = action.payload;
            state.targets = state.targets.map(t => t.date = action.payload)
        },
        chageTargetArea: (state, action) => {
            state.condition.areas = action.payload;
        },
        chageTargetStadium: (state, action) => {
            const area: string = action.payload.area;
            state.condition.stadiums[area] = action.payload.value;
        },
        changeTargetTime: (state, action) => {
            const { area, stadium, value } = action.payload;
            const newTimes: ITimes = {...state.condition.times}
            newTimes[area] = (area in newTimes) ? newTimes[area] : {}
            newTimes[area][stadium] = value;

            state.condition.times = newTimes;
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
            state.condition.total = countGoumens(state.condition.goumens);
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
        }
    }
});

export const {
    changeTargetsDate,
    chageTargetArea,
    chageTargetStadium,
    changeTargetTime,
    changeTargetGoumen,
    openGomenDialog,
    closeGomenDialog,
    commitGoumenDialog,
    checkGoumen } = TargetsSlice.actions;
export default TargetsSlice.reducer;