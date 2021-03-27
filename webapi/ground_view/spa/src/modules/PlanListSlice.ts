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
    detail: PlanType,
    count: number,
    addPlanResp: boolean,
    delPlanResp: boolean,
    navi: 'pList' | 'addPlan' | 'settings',
    pickerDate: string,
    pickerDateTmp: string,
    changeDate: boolean,
    dateConfrict: string,
    targetEditDate: string,
    deleteConfirm: boolean
}

const initialPlantype: PlanType = {
    id: '',
    status: '',
    ymd_range: '',
    area_csv: '',
    reserved_cnt: -1,
    target_cnt: -1
}

const initialState: PlanListState = {
    loading: 'idle',
    first: true,
    plans: [],
    detail: initialPlantype,
    count: -1,
    addPlanResp: false,
    delPlanResp: false,
    navi: 'pList',
    pickerDate: '',
    pickerDateTmp: '',
    changeDate: false,
    dateConfrict: '',
    targetEditDate: '',
    deleteConfirm: false,
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

export const loadPlanById = createAsyncThunk(
    'planList/loadPlanById',
    async (planId: string, thunk) => {
        return await ajax({ url: "/ground_view/get_plan_by_id/", params: { planId }}).then((resp: any) => resp);
    }
)

export const submitWatchChange = createAsyncThunk(
    'planList/submitWatchChange',
    async (params: any, thunk) => {
        return await ajax({ url: "/ground_view/watch_change/", params }).then((resp: any) => resp);
    }
)

export const getPlanFromDate = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'planList/getPlanFromDate',
    async (params: any, thunk) => {
        const date = params.date;
        const ret = await ajax({ url: "/ground_view/get_plan/", params: { date }}).then((resp: any) => resp);
        if (isEmpty(ret)) {
            thunk.dispatch(clearAllTarget({}));
            thunk.dispatch(changeMode('add'));
        }
        ret.from = params.from;
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

export const deletePlan = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'planList/deletePlan',
    async (date: string, thunk) => {
        return await ajax({ url: "/ground_view/delete_plan/", params: { date }}).then((resp: any) => resp);
    }
)


export const changePickerDateConfirm = (date: string) => async (dispatch: AppDispatch, getState: any) => {
    dispatch(PlanListSlice.actions.setPickerDateTmp(date));
    dispatch(getPlanFromDate({ date, from: "changePickerDateConfirm" }));
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
        callbackPlanDetailOpenEdit: (state, action) => {
            state.pickerDate = action.payload.ymd_range;
            state.pickerDateTmp = action.payload.ymd_range;
        },
        planDateInit: (state, action) => {
            state.pickerDate = state.pickerDateTmp;
            state.pickerDateTmp = "";
            state.changeDate = false;
            state.dateConfrict = "";
        },
        firstEnd: (state, action) => {
            state.first = false;
        },
        callbackLoadPlanById: (state, action) => {
            state.detail = action.payload;
        },
        callbackSubmitWatchChange: (state, action) => {
            state.detail.status = action.payload.status;
        },
        openDeleteConfirm: (state, action) => {
            state.deleteConfirm = true;
        },
        closeDeleteConfirm: (state, action) => {
            state.deleteConfirm = false;
            state.delPlanResp = false;
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchPlanList.fulfilled, (state, action) => {
            state.plans = action.payload.plans;
            state.count = action.payload.count;
        });
        builder.addCase(getPlanFromDate.fulfilled, (state, action) => {
            if (action.payload.from === 'changePickerDateConfirm') {
                delete action.payload.from;
                PlanListSlice.caseReducers.callbackDateCheck(state, action);
            } else {
                PlanListSlice.caseReducers.callbackPlanDetailOpenEdit(state, action);
            }
        });
        builder.addCase(submitPlan.fulfilled, (state, action) => {
            state.pickerDate = "";
            state.dateConfrict = "";
            state.targetEditDate = "";
            state.addPlanResp = true;
        });
        builder.addCase(deletePlan.fulfilled, (state, action) => {
            state.delPlanResp = true;
        });
        builder.addCase(loadPlanById.fulfilled, (state, action) => {
            PlanListSlice.caseReducers.callbackLoadPlanById(state, action);
        });
        builder.addCase(submitWatchChange.fulfilled, (state, action) => {
            PlanListSlice.caseReducers.callbackSubmitWatchChange(state, action);
        });
    }
});

export const {
    changeNavi,
    changePickerDate,
    planDateInit,
    decideTargetDateChange,
    firstEnd,
    openDeleteConfirm,
    closeDeleteConfirm
} = PlanListSlice.actions;
export default PlanListSlice.reducer;