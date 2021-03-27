import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { windowHeightResize } from '../atom';

const WindowResizeHook = () => {
    const setHeight = useSetRecoilState(windowHeightResize);
    useEffect(() => {
        window.addEventListener('resize', () => {
            setHeight(window.innerHeight);
        });
    });

    return <></>
};

export default WindowResizeHook;
