import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { systemConditionAjax } from './atom';


const App: React.FC<any> = () => {
    const cond: any = useRecoilValue(systemConditionAjax);
    return (
        <div>{cond.last_update}</div>
    );
};

export default App;
