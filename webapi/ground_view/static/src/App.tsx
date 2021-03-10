import React,  { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { Container, CssBaseline } from '@material-ui/core';
import PlanList from './component/PlanList';
import ScrollDiv from './component/ScrollDiv';
import BottomNavi from './component/BottomNavi';
import WindowResizeHook from './hook/WindowResizeHook';
import { planListAjax} from './component/PlanList';


const App: React.FC<any> = () => {
    // const [plans, setPlans] = useRecoilState(planListAjax);
    
    // useEffect(() => {
    //     setPlans(() => {});
    // });

    return (
        <>
            <WindowResizeHook />
            <CssBaseline />
            <Container maxWidth='md'>
                <ScrollDiv>
                    <PlanList />
                </ScrollDiv>
                <BottomNavi />
            </Container>
        </>
    );
};

export default App;
