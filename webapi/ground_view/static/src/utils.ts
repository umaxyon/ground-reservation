import Axios, { Method } from 'axios';
import { installStubRequestIfNeeded, uninstallStubRequestIfNeeded } from './test/apimock';

export interface IAjaxParam {
    url: string,
    method?: Method,
    data?: any,
    params?: any,
}

const defaultParam: IAjaxParam = {
    url: '',
    method: "get",
}

function ajax(param: IAjaxParam) {
    const p: IAjaxParam = Object.assign({}, defaultParam, param);
    if (param.url) {
      p.url = param.url;
    }
    const data = (param.data) ? param.data : '';
    const params = (param.params) ? param.params : '';
    const url = p.url;
    const headers: any = {
        'Content-Type': 'application/json; charset=UTF-8'
    }

    const method = p.method!
    const config = { url, method, headers, data, params }

    installStubRequestIfNeeded(url)

    return new Promise((resolve, reject) => {
        Axios.create().request(config)
          .then((resp: any) => {
            resolve(resp.data);
            uninstallStubRequestIfNeeded()
          })
          .catch((err: any) => {
            console.log(err);
            reject(err);
          })
      })
}

export function isEmpty(obj: {}) {
  return !Object.keys(obj).length;
}

export default ajax;
