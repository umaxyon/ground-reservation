import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selector } from 'recoil';
import { BottomNavigation, BottomNavigationAction }from '@material-ui/core';
import SportsBaseballOutlinedIcon from '@material-ui/icons/SportsBaseballOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import { useHistory } from 'react-router-dom';
import { SUB_DOMAIN } from '../modules/Constants';
import { changeNavi } from '../modules/PlanListSlice';
import { ConfirmDialog } from './Dialogs';
import { logoutConfirm, logout } from '../modules/AuthSlice';


export const bottomNaviHeight = selector({
    key: 'botomNaviHeight',
    get: () => {
        const bototomNavRect = document.querySelector('.MuiBottomNavigation-root')?.getBoundingClientRect();
        const navHeight = bototomNavRect ? bototomNavRect.height : 56;
        return navHeight;
    }
})


const BottomNavi: React.FC<any> = () => {
    const dispatch = useAppDispatch();
    const { push } = useHistory();

    const navi = useAppSelector(st => st.PlanListSlice.navi)
    const isLoggedIn = useAppSelector(st => st.AuthSlice.isLoggedIn)
    const confirm = useAppSelector(st => st.AuthSlice.confirm)

    const handleChange = (e: React.ChangeEvent<{}>, newVal: string) => {
        dispatch(changeNavi(newVal));
    }

    const handleLogout = () => {
        dispatch(logoutConfirm(true));
    }

    const handleLogoutConfirm = (yesNo: string) => () => {
        if (yesNo === 'yes') {
            dispatch(logout({}));
            dispatch(changeNavi('pList'));
        } else {
            dispatch(logoutConfirm(false));
            dispatch(changeNavi(navi));
        }
    }
    

    return (
        <>
        <BottomNavigation value={navi} onChange={handleChange}>
            <BottomNavigationAction
                label="プラン一覧"
                value="pList"
                icon={<SportsBaseballOutlinedIcon />}
                onClick={() => push(`/${SUB_DOMAIN}/`)}/>
            <BottomNavigationAction
                label="プラン作成" 
                disabled={!isLoggedIn}
                value="add_plan" icon={<AddCircleOutlineIcon />} 
                onClick={() => { if (isLoggedIn) push(`/${SUB_DOMAIN}/add_plan`) }} />
            <BottomNavigationAction
                label="設定"
                disabled={!isLoggedIn}
                value="settings" icon={<SettingsApplicationsOutlinedIcon />} 
                onClick={() => { if (isLoggedIn) push(`/${SUB_DOMAIN}/settings`) }} />
            <BottomNavigationAction
                label="ログアウト"
                disabled={!isLoggedIn}
                value="logout" icon={<DirectionsWalkIcon />} 
                onClick={handleLogout} />
        </BottomNavigation>
        <ConfirmDialog
            open={confirm}
            title="ログアウト"
            message={`ログアウトしてもよいですか？`}
            btnDirection="column"
            txtBtn1="はい"
            txtBtn2="キャンセル"
            handleClick1={handleLogoutConfirm('yes')}
            handleClick2={handleLogoutConfirm('no')}
        />
        </>
    )
}
export default BottomNavi;
