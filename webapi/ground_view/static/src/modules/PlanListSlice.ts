import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ajax, { isEmpty } from '../utils';


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

const PlanListSlice = createSlice({
    name: "PlanList",
    initialState,
    reducers: {
    },
    extraReducers: builder => {
        builder.addCase(fetchPlanList.fulfilled, (state, action) => {
            state.plans = action.payload;
        });
    }
});

export default PlanListSlice.reducer;