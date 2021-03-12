import React, { useState } from 'react';
import { Grid, Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';
import { Select, ListItemText, Checkbox, MenuItem, InputLabel, Chip } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import MultiSelect from './MultiSelect';


const createCss = makeStyles(() => ({
    root: {
        position: 'relative'
    },
    dialogRoot: {
        margin: '20px'
    },
    rowContainer: {
        position: 'relative',
        height: '100%'
    }
}))

const planTimes = [
    '07-09', '09-11', '11-13', '13-15', '15-17'
]

const areas = [
    '大森', '太田ST', '調布', '糀谷・羽田', '蒲田'
]

const AddTarget: React.FC<any> = (props) => {
    const css = createCss();
    const dt = new Date()
    const startDay = addDays(dt, 3)
    const endDay = addMonths(dt, 2)
    
    const [selectedDate, handleDateChange] = useState<Date|null>(startDay);
    const [planTime, setPlanTime] = useState<string[]>([]);
    const [area, setArea] = useState<string[]>([]);

    const handlePlanTimeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setPlanTime(event.target.value as string[]);
    }
    const handleAreaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setArea(event.target.value as string[]);
    }

    return (
        <div>
            <Dialog fullScreen={true} open={props.open} onClose={props.handleClose} className={css.dialogRoot}>
                <DialogTitle>ターゲットの追加</DialogTitle>
                <DialogActions>
                    <Button variant="outlined" onClick={props.handleClose}>キャンセル</Button>
                </DialogActions>
                <DialogContent>
                    <Grid container={true} direction="column" className={css.rowContainer} spacing={3}>
                        <Grid item={true}>
                            <DatePicker
                                minDate={startDay} maxDate={endDay}
                                value={selectedDate} label="対象日" format="yyyy年MM月dd日(eee)"
                                onChange={dt => handleDateChange(dt)} />
                        </Grid>
                        <Grid item={true}>
                            <MultiSelect 
                                id="area" value={area} valueList={areas} width="270px" label="エリア"
                                handleChange={handleAreaChange} />
                        </Grid>
                        <Grid item={true}>
                            <MultiSelect 
                                id="plnTm" value={planTime} valueList={planTimes} width="270px" label="時間帯"
                                handleChange={handlePlanTimeChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default AddTarget;