import React from 'react';
import { selector } from 'recoil';
import { BottomNavigation, BottomNavigationAction }from '@material-ui/core';
import SportsBaseballOutlinedIcon from '@material-ui/icons/SportsBaseballOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';

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

    return (
        <BottomNavigation value={value} onChange={handleChange}>
            <BottomNavigationAction label="プラン一覧" value="pList" icon={<SportsBaseballOutlinedIcon />} />
            <BottomNavigationAction label="設定" value="settings" icon={<SettingsApplicationsOutlinedIcon />} />
        </BottomNavigation>
    )
}
export default BottomNavi;
