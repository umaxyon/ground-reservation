import React, { useEffect } from 'react';
import { atom, selector, useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import ajax, { isEmpty } from '../utils';


export const planList = atom({
    key: 'planList',
    default: {}
})

export const planListAjax = selector({
    key: 'planListAjax',
    get: async ({get}) => {
        return await ajax({ url: "/ground_view/get_plans/"}).then((resp: any) => resp);
        
    },
    set: ({set}, newData: any) => {
        set(planList, newData);
    }
})

export type PlanType = {
    status: string,
    ymd_range: string,
    area_csv: string
}
export type PlanListType = {[key: string] : [PlanType]};

const PlanList: React.FC<any> = () => {
    const [ajaxPlans,setPlans] = useRecoilState(planListAjax);
    const plans: PlanListType = useRecoilValue(planList);

    useEffect(() => {
        setPlans(ajaxPlans);
    });

    // const plans = props.list;

    let ret;
    if (isEmpty(plans)) {
        ret = <div>loading...</div>;
    } else {
        const watchList = plans.監視中
        ret = []
        for (const k in watchList) {
            ret.push(<div key={`plan_${k}`}>{watchList[k].ymd_range}</div>)
        }
    }

    return <>{ret}</>;
};

export default PlanList;