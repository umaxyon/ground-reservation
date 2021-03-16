import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ajax, { isEmpty } from '../utils';
import { Target } from '../modules/TargetsSlice';


export type PlanType = {
    id: string,
    status: string,
    ymd_range: string,
    area_csv: string,
    target_cnt: number,
    reserved_cnt: number
}

export type PlanListType = {[key: string] : [PlanType]};


interface PlanListState {
    loading: 'idle' | 'pending' | 'succeeded' | 'failed',
    plans: PlanListType
}

const initialState: PlanListState = {
    loading: 'idle',
    plans: {} 
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
                    itemList.push({ date: t.date, area, stadium, time, goumen})
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
    },
    extraReducers: builder => {
        builder.addCase(fetchPlanList.fulfilled, (state, action) => {
            state.plans = action.payload;
        });
        builder.addCase(submitPlan.fulfilled, (state, action) => {
            console.log('hoge');
        });
    }
});

export const {
} = PlanListSlice.actions;
export default PlanListSlice.reducer;