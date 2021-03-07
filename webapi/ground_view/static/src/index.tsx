import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';


ReactDOM.render(
    <RecoilRoot>
        <React.Suspense fallback={<div>loading...</div>}>
            <App />
        </React.Suspense>
    </RecoilRoot>
    , document.getElementById('root') as HTMLElement
);
