import { configureStore } from '@reduxjs/toolkit';
import PlanListSlice from './modules/PlanListSlice';
import TargetsSlice from './modules/TargetsSlice';


const store = configureStore({
    reducer: {
        PlanListSlice,
        TargetsSlice
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
