import 'source-map-support/register';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import { RecoilRoot } from 'recoil'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import jaLocale from "date-fns/locale/ja"
import format from "date-fns/format";

class ExtendedUtils extends DateFnsUtils {
    getCalendarHeaderText(date: number|Date) {
      return format(date, "yyyy年MMM", { locale: this.locale });
    }
    getDatePickerHeaderText(date: number|Date) {
      return format(date, "MMMd日(eee)", { locale: this.locale });
    }
  }

ReactDOM.render(
    <MuiPickersUtilsProvider utils={ExtendedUtils} locale={jaLocale}>
        <RecoilRoot>
            <Provider store={store}>
                <App />
            </Provider>
        </RecoilRoot>
    </MuiPickersUtilsProvider>
    , document.getElementById('root') as HTMLElement
);
