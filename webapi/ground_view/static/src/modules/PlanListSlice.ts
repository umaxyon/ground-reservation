import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ajax from '../utils';
import { Target } from '../modules/TargetsSlice';


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
    plans: PlanListType,
    count: number,
    addPlanResp: boolean,
    navi: 'pList' | 'addPlan' | 'settings',
    pickerDate: string,
    changeDate: boolean,
    dateConfrict: string,
    targetEditDate: string
}

const initialState: PlanListState = {
    loading: 'idle',
    plans: {},
    count: -1,
    addPlanResp: false,
    navi: 'pList',
    pickerDate: '',
    changeDate: false,
    dateConfrict: '',
    targetEditDate: ''
}

export const fetchPlanList = createAsyncThunk(
    'planList/fetchPlanList',
    async () => {
        return await ajax({ url: "/ground_view/get_plans/"}).then((resp: any) => resp);
    }
)

export const submitPlan = createAsyncThunk(
    'planList/submitPlan',
    async (itemList: any) => {
        return await ajax({ url: "/ground_view/save_plan/", method: 'post', data: itemList}).then((resp: any) => resp);
    }
)

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

// export const changeTargetAreaWithUpdateTotal = (val: any) => async (dispatch: Dispatch) => {
//     await dispatch(TargetsSlice.actions.chageTargetArea(val));
//     await dispatch(TargetsSlice.actions.updateTotal({}));
// }


const PlanListSlice = createSlice({
    name: "PlanList",
    initialState,
    reducers: {
        changeNavi: (state, action) => {
            state.navi = action.payload;
            state.addPlanResp = false;
        },
        changePickerDate: (state, action) => {
            if (action.payload.mode == 'edit') {
                // TODO コンフリクト判定
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
        decideDateConfrict: (state, action) => {
            const mode = action.payload;
            // if (mode === 'editOld') {
            //     const conditions: Target[] = state.targets.filter(t => t.date === state.dateConfrict)
            //     state.mode = 'edit';
            //     state.condition = conditions[0];
            // } else {
            //     const targets: Target[] = state.targets.filter(t => t.date !== state.dateConfrict)
            //     targets.push(state.condition);
            //     state.targets = targets;
            //     state.condition = {...condition}
            //     state.open = false;
            // }
            state.dateConfrict = '';
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchPlanList.fulfilled, (state, action) => {
            state.plans = action.payload.plans;
            state.count = action.payload.count;
        });
        builder.addCase(submitPlan.fulfilled, (state, action) => {
            state.addPlanResp = true;
        });
    }
});

export const {
    changeNavi,
    changePickerDate,
    decideDateConfrict,
    decideTargetDateChange
} = PlanListSlice.actions;
export default PlanListSlice.reducer;