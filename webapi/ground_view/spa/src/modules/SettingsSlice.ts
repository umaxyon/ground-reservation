import { createSlice, createAsyncThunk, ThunkAction } from "@reduxjs/toolkit";
import ajax from '../utils';
import { AppDispatch, RootState } from '../store';
import { convertTargetListForSubmit } from './PlanListSlice';
import { changeMode, setWeekMode, closeAndClearTarget } from './TargetsSlice';
import { checkSession } from './AuthSlice';


function encrypt(word: string) {
    return btoa(process.env.SALT + word);
}

function decrypt(word: string) {
    return word ? atob(word).replace(process.env.SALT as string, '') : "";
}

export const getSettings = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'Settings/getSettings',
    async (_, thunk) => {
        return await ajax({ url: "/ground_view/get_settings/"}).then((resp: any) => checkSession(thunk.dispatch)(resp));
    }
)

export const saveSettings = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'Settings/saveSettings',
    async (_, thunk) => {
        const dat = thunk.getState().SettingsSlice;
        const params: { [key: string]: any } = {}
        Object.keys(dat).forEach(k => {
            params[k] = dat[k]
        })

        if (dat.pswd) {
            params.pswd = encrypt(dat.pswd)
        }
        params.targets = dat.weekData;

        return await ajax({ url: "/ground_view/save_settings/", data: params, method: 'POST' }).then((resp: any) => checkSession(thunk.dispatch)(resp));
    }
)

type TargetRow = {
    area: string,
    time: string,
    date: string,
    stadium: string,
    goumen: string[]
}

export const openAddTargetForWeek = (week: string): ThunkAction<void, RootState, undefined, any> => (dispatch: AppDispatch, getState) => {
    const dat = getState().SettingsSlice.weekData[week];
    if (dat && dat.json) {
        const targets: TargetRow[] = JSON.parse(dat.json);
        const areas = Array.from(new Set(targets.map(t => t.area)));
        const stadiums: { [key: string]: string[] } = {};
        
        const times: { [key: string]: { [key: string]: string[] }} = {};
        const goumens: { [key: string]: { [key: string]: string[] }} = {};

        areas.forEach(area => {
            const currentAreaRows = targets.filter(t => t.area === area);
            const currentStadiums = Array.from(new Set(currentAreaRows.map(t => t.stadium)));
            stadiums[area] = currentStadiums;
            times[area] = times[area] || {};
            goumens[area] = goumens[area] || {};

            currentStadiums.forEach(stadium => {
                times[area][stadium] = Array.from(new Set(currentAreaRows.filter(t => t.stadium === stadium).map(t => t.time)));
                goumens[area][stadium] = currentAreaRows.filter(t => t.stadium === stadium).map(t => t.goumen)[0];
            });
        });
        const condition = { areas, stadiums, times, goumens };
        dispatch(setWeekMode({ condition }));
    } else {
        dispatch(changeMode("week"));
    }
    dispatch(SettingsSlice.actions.changeOpenTargetWeek(week));
}


export const createWeekTargetAndClose = (week: string): ThunkAction<void, RootState, undefined, any> => (dispatch: AppDispatch, getState) => {
    const dat = getState().TargetsSlice.condition;
    const items = convertTargetListForSubmit([dat])
    dispatch(SettingsSlice.actions.setWeekDataTarget({ items, week }));
    dispatch(changeMode('add'));
    dispatch(closeAndClearTarget({}))
}

// type TWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'san'

interface WeekData {
    [key: string]: {
        enable: boolean,
        json: string
    }
}


interface SettingsState {
    [key: string]: string | number | boolean | string[] | WeekData,
    available: number,
    weekTargets: string,
    account: string,
    pswd: string,
    isEdit: boolean,
    weeks: string[],
    weekData: WeekData,
    openTaregeWeek: string
}

const initialState: SettingsState = {
    available: 1,
    weekTargets: "",
    account: "",
    pswd: "",
    isEdit: false,
    weeks: [],
    weekData: {},
    openTaregeWeek: ""
}

const SettingsSlice = createSlice({
    name: "Settings",
    initialState,
    reducers: {
        noticeEdit: (state, action) => {
            Object.keys(action.payload).forEach(k => {
                state[k] = action.payload[k]
            })
            state.isEdit = true
        },
        changeAccountText: (state, action) => {
            state.account = action.payload
        },
        changePasswordText: (state, action) => {
            state.pswd = action.payload
        },
        initSettings: (state, action) => {
            state.available = 1;
            state.weekTargets = "";
            state.account = "";
            state.pswd = "";
            state.isEdit = false;
            state.weeks = [];
            state.weekData = {};
            state.openTaregeWeek = "";
        },
        changeWeek: (state, action) => {
            const newWeeks: string[] = action.payload;
            state.weeks = newWeeks;
            const oldWeekData = Object.assign({}, state.weekData);
            const oldWeeks = Object.keys(oldWeekData)
            const keys = Array.from(new Set([...oldWeeks, ...newWeeks]));
            keys.forEach(w => {
                if ((oldWeeks.includes(w) && !newWeeks.includes(w)) || (!oldWeeks.includes(w) && newWeeks.includes(w))) {
                    oldWeekData[w] = { enable: false, json: "" }
                } 
            });
            state.weekData = oldWeekData;
            state.isEdit = true;
        },
        changeWeekEnabled: (state, action) => {
            const { enable, week } = action.payload;
            state.weekData[week].enable = enable;
            state.isEdit = true;
        },
        changeOpenTargetWeek: (state, action) => {
            state.openTaregeWeek = action.payload;
        },
        setWeekDataTarget: (state, action) => {
            const { items, week } = action.payload;
            const data = JSON.stringify(items)
            state.weekData[week].json = data;
            state.isEdit = true;
            state.openTaregeWeek = "";
        },
        callBackGetSystemCondition: (state, action) => {
            state.available = action.payload.available;
            state.account = action.payload.account;
            state.weekTargets = action.payload.weekTargets;
            state.isEdit = false;
            state.pswd = decrypt(action.payload.pswd);
            state.weekData = action.payload.weekData;
            state.weeks = action.payload.weeks;
        },
        callBackSaveSettings: (state, action) => {
            state.isEdit = false;
        }
    },
    extraReducers: builder => {
        builder.addCase(getSettings.fulfilled, (state, action) => {
            if (!action.payload.session_check_err) {
                SettingsSlice.caseReducers.callBackGetSystemCondition(state, action);
            }
        });
        builder.addCase(saveSettings.fulfilled, (state, action) => {
            SettingsSlice.caseReducers.callBackSaveSettings(state, action);
        });
    }
});

export const {
    noticeEdit,
    changeAccountText,
    changePasswordText,
    changeWeek,
    changeWeekEnabled,
    changeOpenTargetWeek,
    initSettings
} = SettingsSlice.actions;
export default SettingsSlice.reducer;
    