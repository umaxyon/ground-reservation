import sourceMapSupport from 'source-map-support';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import { RecoilRoot } from 'recoil'


sourceMapSupport.install();

ReactDOM.render(
    <RecoilRoot>
        <Provider store={store}>
            <App />
        </Provider>
    </RecoilRoot>
    , document.getElementById('root') as HTMLElement
);
