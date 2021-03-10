import * as Moxios from 'moxios';
import data_system_condition from './serverdata/data_system_condition';
import data_get_plans from './serverdata/data_get_plans';

const IS_MOCK = true;
const STUB_RESPONSE_MAP: {[key: string]: any} = {}

export const installStubRequestIfNeeded = (url: string) => {
    if (!IS_MOCK) {
        return
    }

    const stubRequest = findStubRequest(url)
    if (stubRequest != null && stubRequest[0]) {
        console.log('Handle mock request', stubRequest[0], stubRequest[1])
        Moxios.install()
        Moxios.stubRequest(stubRequest[0], stubRequest[1])
    }
}

export const uninstallStubRequestIfNeeded = () => {
    if (!IS_MOCK) {
        return
    }
    Moxios.uninstall()
}

function findStubRequest(url?: string): [string, any] {
    if (url) {
        const key = Object.keys(STUB_RESPONSE_MAP).find(k => url.startsWith(k))
        if (key != null) {
            return [key!, STUB_RESPONSE_MAP[key!]]
        }
    }
    return ["", {}];
}


const registerAll = () => {
    if (!IS_MOCK) {
        return
    }

    registerStub('/ground_view/get_system_condition/', 200, { response: data_system_condition({}) });
    registerStub('/ground_view/get_plans/', 200, { response: data_get_plans({}) });
}


interface Item {
    response?: any;
    responseText?: string;
    status?: number;
    statusText?: string;
    headers?: any;
}

const registerStub = (path: string, status: number, response: Item) => {
    console.log(`stub request: ${path}`)
    STUB_RESPONSE_MAP[path] = response
}

registerAll();
