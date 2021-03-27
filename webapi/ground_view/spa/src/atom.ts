import ajax from './utils';
import { atom, selector } from 'recoil';

export const systemCondition = atom({
    key: 'systemCondition',
    default: {}
});

export const systemConditionAjax = selector({
    key: 'systemConditionAjax',
    get: async ({get}) => {
        return await ajax({ url: "/ground_view/get_system_condition/"}).then((resp: any) => resp);
    }
});

export const windowHeightResize = atom({
    key: 'windowHeightResize',
    default: window.innerHeight
})
