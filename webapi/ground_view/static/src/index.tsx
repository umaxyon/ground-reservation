import sourceMapSupport from 'source-map-support';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';

sourceMapSupport.install();

ReactDOM.render(
    <RecoilRoot>
        <React.Suspense fallback={<div>loading...</div>}>
            <App />
        </React.Suspense>
    </RecoilRoot>
    , document.getElementById('root') as HTMLElement
);
