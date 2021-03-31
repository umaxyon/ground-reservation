import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import PlanListSlice from './modules/PlanListSlice';
import TargetsSlice from './modules/TargetsSlice';
import SettingsSlice from './modules/SettingsSlice';
import AuthSlice from './modules/AuthSlice';


const logger = (store: { getState: () => any; }) => (next: (arg0: any) => void) => (action: any) => {
    console.log("before: %O", store.getState());
    next(action);
    console.log("after %O", store.getState());
};

const store = configureStore({
    reducer: {
        PlanListSlice,
        TargetsSlice,
        SettingsSlice,
        AuthSlice
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
