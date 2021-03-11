import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchPlanList } from '../modules/PlanListSlice';
import { isEmpty } from '../utils';
import PlanRow, { Plan } from './PlanRow';


const PlanList: React.FC<any> = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchPlanList())
    }, [dispatch]);

    const plans = useAppSelector(state => state.PlanListSlice.plans)

    let ret;
    if (isEmpty(plans)) {
        ret = <div>loading...</div>;
    } else {
        const watchList = plans.監視中
        ret = []
        for (const k in watchList) {
            ret.push(<PlanRow key={`plan_${k}`} row={k} data={new Plan(watchList[k])} />)
        }
    }

    return <>{ret}</>;
};

export default PlanList;