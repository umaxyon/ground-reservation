import { configureStore } from '@reduxjs/toolkit';
import PlanListSlice from './modules/PlanListSlice';


const store = configureStore({
    reducer: {
        PlanListSlice
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
