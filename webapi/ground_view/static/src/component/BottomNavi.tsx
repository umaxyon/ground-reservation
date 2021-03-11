import React from 'react';
import { selector } from 'recoil';
import { BottomNavigation, BottomNavigationAction }from '@material-ui/core';
import SportsBaseballOutlinedIcon from '@material-ui/icons/SportsBaseballOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useHistory } from 'react-router-dom';

export const bottomNaviHeight = selector({
    key: 'botomNaviHeight',
    get: () => {
        const bototomNavRect = document.querySelector('.MuiBottomNavigation-root')?.getBoundingClientRect();
        const navHeight = bototomNavRect ? bototomNavRect.height : 56;
        return navHeight;
    }
})


const BottomNavi: React.FC<any> = () => {
    const [value, setValue] = React.useState('pList');
    const handleChange = (e: React.ChangeEvent<{}>, newVal: string) => {
        setValue(newVal);
    }
    const { push } = useHistory();
    return (
        <BottomNavigation value={value} onChange={handleChange}>
            <BottomNavigationAction
                label="プラン一覧"
                value="pList"
                icon={<SportsBaseballOutlinedIcon />}
                onClick={() => push('/dist/')}/>
            <BottomNavigationAction
                label="プラン追加" 
                value="add_plan" icon={<AddCircleOutlineIcon />} 
                onClick={() => push('/dist/add_plan')} />
            <BottomNavigationAction
                label="設定" 
                value="settings" icon={<SettingsApplicationsOutlinedIcon />} 
                onClick={() => push('/dist/settings')} />
        </BottomNavigation>
    )
}
export default BottomNavi;
