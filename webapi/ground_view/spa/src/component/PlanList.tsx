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

    const st = useAppSelector(state => state.PlanListSlice)

    let ret;
    if (isEmpty(st.plans) && st.count < 0) {
        ret = <div>loading...</div>;
    } else if(st.count === 0) {
        ret = <div>プランがありません</div>
    } else {
        // const watchList = st.plans.監視中
        ret = []
        for (const k in st.plans) {
            ret.push(<PlanRow key={`plan_${k}`} row={k} data={new Plan(st.plans[k])} />)
        }
    }

    return <>{ret}</>;
};

export default PlanList;