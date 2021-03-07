import Axios from 'axios';
import { atom, selector } from 'recoil';

export const systemCondition = atom({
    key: 'systemCondition',
    default: {}
});

export const systemConditionAjax = selector({
    key: 'systemCondition',
    get: async ({get}) => {
        return await Axios.get("/ground_view/get_system_condition/").then(resp => resp.data);
    }
});
