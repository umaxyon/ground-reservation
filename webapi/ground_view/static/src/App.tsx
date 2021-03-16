import React from 'react';
import { Container, CssBaseline } from '@material-ui/core';
import PlanList from './component/PlanList';
import AddPlan from './component/AddPlan';
import ScrollDiv from './component/ScrollDiv';
import BottomNavi from './component/BottomNavi';
import WindowResizeHook from './hook/WindowResizeHook';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { SUB_DOMAIN } from './modules/Constants';

const App: React.FC<any> = () => {
    return (
        <>
            <BrowserRouter>
                <WindowResizeHook />
                <CssBaseline />
                <Container maxWidth='md'>
                    <ScrollDiv>
                        <Switch>
                            <Route exact={true} path={`/${SUB_DOMAIN}/`} component={PlanList} />
                            <Route exact={true} path={`/${SUB_DOMAIN}/add_plan`} component={AddPlan} />
                            {/* <Route exact={true} path={"/${SUB_DOMAIN}/edit_plan/:planId"} component={() => <div>edit_plan</div>} /> */}
                            <Route exact={true} path={`/${SUB_DOMAIN}/settings`} component={() => <div>settings</div>} />
                        </Switch>
                    </ScrollDiv>
                    <BottomNavi />
                </Container>
            </BrowserRouter>
        </>
    );
};

export default App;
