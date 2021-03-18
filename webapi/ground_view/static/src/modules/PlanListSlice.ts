import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ajax from '../utils';
import { Target, clearAllTarget, changeMode } from '../modules/TargetsSlice';
import { AppDispatch, RootState } from '../store';
import { isEmpty } from '../utils';


export type PlanType = {
    id: string,
    status: string,
    ymd_range: string,
    area_csv: string,
    target_cnt: number,
    reserved_cnt: number
}

export type PlanListType = {
    [key: string] : [PlanType]
};


interface PlanListState {
    loading: 'idle' | 'pending' | 'succeeded' | 'failed',
    first: boolean,
    plans: PlanType[],
    count: number,
    addPlanResp: boolean,
    navi: 'pList' | 'addPlan' | 'settings',
    pickerDate: string,
    pickerDateTmp: string,
    changeDate: boolean,
    dateConfrict: string,
    targetEditDate: string
}

const initialState: PlanListState = {
    loading: 'idle',
    first: true,
    plans: [],
    count: -1,
    addPlanResp: false,
    navi: 'pList',
    pickerDate: '',
    pickerDateTmp: '',
    changeDate: false,
    dateConfrict: '',
    targetEditDate: ''
}

export const convertTargetListForSubmit = (targets: Target[]) => {
    const itemList:any = [];
    targets.forEach((t, i) => {
        Object.keys(t.times).forEach((area, j) => {
            Object.keys(t.times[area]).forEach((stadium, k) => {
                const goumen = t.goumens[area][stadium];
                t.times[area][stadium].forEach((time, l) => {
                    itemList.push({ date: t.date, area, stadium, time, goumen})
                })
            });
        });
    });
    return itemList;
}


export const convertTargetList = (targets: Target[]) => {
    const itemList:any = [];
    targets.forEach((t, i) => {
        Object.keys(t.times).forEach((area, j) => {
            Object.keys(t.times[area]).forEach((stadium, k) => {
                const goumen = t.goumens[area][stadium].length;
                t.times[area][stadium].forEach((time, l) => {
                    itemList.push({ area, stadium, time, goumen})
                })
            });
        });
    });
    return itemList;
}

export const fetchPlanList = createAsyncThunk(
    'planList/fetchPlanList',
    async () => {
        return await ajax({ url: "/ground_view/get_plans/"}).then((resp: any) => resp);
    }
)

export const getPlanFromDate = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'planList/getPlanFromDate',
    async (date: string, thunk) => {
        const ret = await ajax({ url: "/ground_view/get_plan/", params: { date }}).then((resp: any) => resp);
        if (isEmpty(ret)) {
            thunk.dispatch(clearAllTarget({}));
            thunk.dispatch(changeMode('add'));
        }
        return ret;
    }
)

export const submitPlan = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'planList/submitPlan',
    async (param: any, thunk) => {
        const { mode, watchStart } = thunk.getState().TargetsSlice;
        const ret = await ajax({ url: "/ground_view/save_plan/", method: 'post', data: param.itemList, params: { mode, watchStart }}).then((resp: any) => resp);
        thunk.dispatch(clearAllTarget({}));
        return ret;
    }
)

export const changePickerDateConfirm = (date: string) => async (dispatch: AppDispatch, getState: any) => {
    dispatch(PlanListSlice.actions.setPickerDateTmp(date));
    dispatch(getPlanFromDate(date));
}


const PlanListSlice = createSlice({
    name: "PlanList",
    initialState,
    reducers: {
        changeNavi: (state, action) => {
            state.navi = action.payload;
            state.addPlanResp = false;
        },
        setPickerDateTmp: (state, action) => {
            state.pickerDateTmp = action.payload;
        },
        changePickerDate: (state, action) => {
            if (action.payload.mode == 'edit') {
                state.targetEditDate = action.payload.date;
            } else {
                state.pickerDate = action.payload.date;
                state.changeDate = true;
            }
        },
        decideTargetDateChange: (state, action) => {
            const yesNo = action.payload;
            if (yesNo === 'yes') {
                state.pickerDate = state.targetEditDate;
                state.changeDate = true;
            }
            state.targetEditDate = '';
        },
        callbackDateCheck: (state, action) => {
            if (! isEmpty(action.payload)) {
                state.dateConfrict = action.payload.ymd_range
            } else {
                state.pickerDate = state.pickerDateTmp;
                state.pickerDateTmp = ""
                state.changeDate = true;
            }
        },
        planDateInit: (state, action) => {
            state.pickerDate = state.pickerDateTmp;
            state.pickerDateTmp = "";
            state.changeDate = false;
            state.dateConfrict = "";
        },
        firstEnd: (state, action) => {
            state.first = false;
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchPlanList.fulfilled, (state, action) => {
            state.plans = action.payload.plans;
            state.count = action.payload.count;
        });
        builder.addCase(getPlanFromDate.fulfilled, (state, action) => {
            PlanListSlice.caseReducers.callbackDateCheck(state, action);
        });
        builder.addCase(submitPlan.fulfilled, (state, action) => {
            state.pickerDate = "";
            state.dateConfrict = "";
            state.targetEditDate = "";
            state.addPlanResp = true;
        });
    }
});

export const {
    changeNavi,
    changePickerDate,
    planDateInit,
    decideTargetDateChange,
    firstEnd
} = PlanListSlice.actions;
export default PlanListSlice.reducer;