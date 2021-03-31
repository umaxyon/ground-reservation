import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '../store';
import ajax from '../utils';
import { changeNavi } from '../modules/PlanListSlice'
import { initSettings } from  '../modules/SettingsSlice';

// export class Roles {
//     private roles: string[]

//     constructor(roles: string[]) {
//         this.roles = roles
//     }

//     public hasRole = (role: string) => {
//         return this.roles.includes(role)
//     }

//     public toString = (): string => {
//         return "[Roles: " + this.roles + "]"
//     }
// }

// const NO_ROLES = new Roles([]);

export interface IAuthInput {
    [key: string]: string | boolean,
    username: string,
    pswd: string,
    showPassword: boolean
}

export interface IAuthState {
    [key: string]: string | boolean | IAuthInput | undefined,
    ready: boolean,
    isRequesting: boolean,
    token?: string,
    isLoggedIn: boolean,
    error: string,
    input: IAuthInput,
    confirm: boolean
  }

const initialAuthInput: IAuthInput = {
    username: "",
    pswd: "",
    showPassword: false
}

const initialState: IAuthState = {
    ready: false,
    isRequesting: false,
    isLoggedIn: false,
    input: initialAuthInput,
    error: "",
    confirm: false
}

export const checkSession = (dispatch: AppDispatch) => (resp: any) => {
    if ('session_check_err' in resp) {
        dispatch(AuthSlice.actions.logout({}))
        dispatch(changeNavi('pList'));
        dispatch(initSettings({}))
    }
    return resp
}

export const requestLogin = createAsyncThunk<any, any, { dispatch: AppDispatch, state: RootState }>(
    'authSlice/requestLogin',
    async (_, thunk) => {
        const data = thunk.getState().AuthSlice.input;
        return await ajax({ url: "/ground_view/do_login/", method: 'post', data }).then((resp: any) => checkSession(thunk.dispatch)(resp))
    }
)

const JWT_TOKEN = "jwt_token"

export const getLocalToken = () => {
    return localStorage.getItem(JWT_TOKEN) || undefined
}

const setLocalToken = (token: string) => {
    sessionStorage.setItem(JWT_TOKEN, token)
}
  
const clearLocalToken = () => {
    sessionStorage.removeItem(JWT_TOKEN)
}


const AuthSlice = createSlice({
    name: "AuthSlice",
    initialState,
    reducers: {
        initAuth: (state, action) => {
            state.ready = true;
        },
        logoutConfirm: (state, action) => {
            state.confirm = action.payload;
        },
        logout: (state, action) => {
            state.isLoggedIn = false;
            state.ready = true;
            state.isRequesting = false;
            state.input = initialAuthInput;
            state.error = "";
            state.confirm = false;
            clearLocalToken();
        },
        changeAuthText: (state, action) => {
            if (action.payload.username !== undefined) {
                state.input.username = action.payload.username;
            }
            if (action.payload.pswd !== undefined) {
                state.input.pswd = action.payload.pswd;
            }
        },
        toggleShowPassword: (state, action) => {
            state.input.showPassword = !state.input.showPassword;
        },
        callbackRequestLogin: (state, action) => {
            if (action.payload.status === 'ok') {
                setLocalToken(action.payload.token);
                state.isLoggedIn = true;
                state.ready = true;
            } else {
                state.isLoggedIn = false;
                state.ready = false;
                state.error = action.payload.error;
            }
        }
    },
    extraReducers: builder => {
        builder
            .addCase(requestLogin.fulfilled, (state, action) => {
                AuthSlice.caseReducers.callbackRequestLogin(state, action);
            })
            .addCase(requestLogin.rejected, (state, action) => {
                console.log('login error');
                state.error = 'ログインエラー'
            });
    }
});

export const {
    changeAuthText,
    toggleShowPassword,
    initAuth,
    logout,
    logoutConfirm
} = AuthSlice.actions;
export default AuthSlice.reducer;
