import React, { useEffect } from 'react'
import { Redirect } from 'react-router';
import { IAuthState, initAuth } from '../modules/AuthSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SUB_DOMAIN } from '../modules/Constants';


export const RequireLogin = (props: { isLoggedIn: boolean, ready: boolean } & any) => {
    const dispatch = useAppDispatch();

    const auth = useAppSelector(st => st.AuthSlice);

    useEffect(() => {
        dispatch(initAuth({}));
    }, [dispatch]);

    if (!auth.ready) {
        return "please wait.."
    } else {
        if (auth.isLoggedIn) {
            return props.children
        } else {
            return (<Redirect to={`/${SUB_DOMAIN}/login`} />)
        }
    }
}

// export const requireRole = (role: string, auth: IAuthState) => (component: React.ComponentType) => {
//     if (isLoggedIn(auth) && auth.roles.hasRole(role)) {
//         return component
//     } else {
//         // TODO: 権限が足りない場合はどうするか? (何らかのダイアログポップアップ)
//         return () => <Redirect to={`${process.env.PUBLIC_URL}/login`} />
//     }
// }