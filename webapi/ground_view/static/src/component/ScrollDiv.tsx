import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { windowHeightResize } from '../atom';
import { useRecoilValue } from 'recoil';
import { bottomNaviHeight } from './BottomNavi';

const useStyles = (height: any) => {
    return makeStyles({
        scrollDiv: {
            height: `${height}px`,
            overflowY: 'scroll',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-track': {
                borderRadius: '5px',
                boxShadow: 'inset 0 0 6px rgba(0, 0, 0, .1)',
                webkitBoxShadow: 'inset 0 0 6px rgba(0, 0, 0, .1)'
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 50, .5)',
                borderRadius: '5px',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, .3)',
                webkitBoxShadow: '0 0 0 1px rgba(255, 255, 255, .3)'
            },
            padding: '10px 20px 5px 20px',
            borderTop: '1px solid #ccc',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.1) inset'
        }
    });
};


const ScrollDiv: React.FC<any> = (props) => {
    const height = useRecoilValue(windowHeightResize);
    const navHeight = useRecoilValue(bottomNaviHeight);
    const classes = useStyles(height - navHeight)();
    return <div className={classes.scrollDiv}>{props.children}</div>
};

export default ScrollDiv;
