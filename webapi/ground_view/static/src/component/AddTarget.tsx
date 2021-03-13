import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
    Grid, Button, CardContent, Badge, FormControlLabel, Checkbox, FormGroup,
    Dialog, DialogActions, DialogTitle, DialogContent, Typography } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import MultiSelect from './MultiSelect';
import {
    changeTargetsDate, 
    chageTargetArea, 
    chageTargetStadium, 
    changeTargetTime, 
    openGomenDialog, ITimes, IGoumen,
    GoumenDialog, closeGomenDialog, commitGoumenDialog, checkGoumen } from '../modules/TargetsSlice';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import ScrollDiv from './ScrollDiv';
import GridOnIcon from '@material-ui/icons/GridOn';
import { STADIUMS, STADIUM_KEYS, GOUMENS, TIME_RANGES } from '../modules/Constants';

const timeSelectWidth = 335

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
    },
    areaDiv: {
        display: 'block',
        overFlow: 'hidden',
        padding: '5px 2px 5px 2px',
        width: '455px'
    },
    areaTitle: {
        fontWeight: 'bold',
        fontSize: '1.2em',
        marginBottom: '3px'
    },
    studiumTitle: {
        fontWeight: 'bold'
    },
    studiumPanel: {
        marginLeft: '10px'
    },
    stadiumTimeGridRoot: {
        position: 'relative'
    },
    goumenGrid: {
        display: 'inline-block',
        position: 'absolute',
        top: '55%',
        transform: 'translate(0, -50%)',
        left: `${timeSelectWidth + 30}px`
    },
    scrollRootGrid: {
        position: 'relative'
    },
    scrollContentWrap: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    stadiumSelectGrid: {
        marginBottom: '10px'
    }
}))

const areas: string[] = [
    '大森', '大田ST', '調布', '糀谷・羽田', '蒲田'
]

const defaultAreas: string[] = ['蒲田']

const areaKeys = new Map(Object.entries({
    '大森': 'oomori', '大田ST': 'oota', '調布': 'chofu', '糀谷・羽田': 'kojitani', '蒲田': 'kamata'
}))

const countSelectGoumen = (area: string, stadium: string, goumens: IGoumen) => {
    return (! (area in goumens) || ! (stadium in goumens[area])) ? 0 : goumens[area][stadium].length;
}


const AddTarget: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const css = createCss();
    const dt = new Date();
    const startDay = addDays(dt, 3)
    const endDay = addMonths(dt, 2)

    const handleDateChange = (dt: MaterialUiPickersDate) => {
        const strDate = format(dt as Date, 'yyyy/MM/dd')
        dispatch(changeTargetsDate(strDate));
    }

    const handleAreaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(chageTargetArea(event.target.value));
    }

    const handleStadiumChange = (area: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(chageTargetStadium({area, value:event.target.value}));
    }

    const handleTimeChange = (area: string, stadium: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string[] || [];
        dispatch(changeTargetTime({area, stadium, value}))
    }

    const handleGoumenBtnClick = (area: string, stadium: string) => () => {
        dispatch(openGomenDialog({area, stadium}));
    }

    const handleGoumenClose = () => {
        dispatch(closeGomenDialog({}));
    }

    const handleGoumenCheckClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(checkGoumen((event.target as HTMLInputElement).value));
    }

    const handleGoumenOkClick = () => {
        dispatch(commitGoumenDialog({}));
    }

    const selectedDate = useAppSelector(st => st.TargetsSlice.condition.date) || startDay;
    const selectedAreas = useAppSelector(st => st.TargetsSlice.condition.areas) || [];
    const selectedStadiumOb = useAppSelector(st => st.TargetsSlice.condition.stadiums);
    const selectedStadiumMap = new Map(Object.entries(selectedStadiumOb));
    const selectedTimesOb: ITimes = useAppSelector(st => st.TargetsSlice.condition.times);
    const goumenDialog: GoumenDialog = useAppSelector(st => st.TargetsSlice.goumenDialog);
    const selectedGoumensOb: IGoumen = useAppSelector(st => st.TargetsSlice.condition.goumens);

    const goumenDialogCurrentValues = GOUMENS.get(goumenDialog.stadium) || [];
    const goumeDialogContent = (
        <Dialog open={goumenDialog.open} onClose={handleGoumenClose} disableBackdropClick={true}>
            <DialogTitle>号面選択</DialogTitle>
            <DialogContent>
                <Grid container={true}>
                    <Grid item={true}>
                        <FormGroup row={true}>
                            {goumenDialogCurrentValues.map(v => {
                                return (<FormControlLabel key={`goumen_dialog_label_${v}`}
                                            control={
                                                <Checkbox key={`goumen_dialog_check_${v}`}
                                                    value={v}
                                                    checked={goumenDialog.checked.includes(v)}
                                                    onChange={handleGoumenCheckClick} name={v} />
                                            }
                                            label={v}/>)
                            })}
                        </FormGroup>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button autoFocus={true} onClick={handleGoumenClose} color="primary">キャンセル</Button>
                <Button onClick={handleGoumenOkClick} color="primary">OK</Button>
            </DialogActions>
        </Dialog>
    )

    const areaGrids = selectedAreas.map(v => {
        const area: string = v || "";
        const k = areaKeys.get(area);
        const stadiumVals = STADIUMS.get(area);
        const selectedStadiums = selectedStadiumMap.get(area) || stadiumVals || [];

        const stadiumGrid = selectedStadiums.map((stadium: string) => {
            const k = STADIUM_KEYS.get(stadium);
            const timeVals = TIME_RANGES.get(stadium);
            const buf = (area in selectedTimesOb) ? selectedTimesOb[area]: {};
            const selectedTimes = (stadium in buf) ? buf[stadium]: [];
            const cntGoumen = countSelectGoumen(area, stadium, selectedGoumensOb);
            return (
                <Grid key={`st_g_${k}`} item={true} container={true} direction="column" spacing={1}>
                    <Grid item={true}>
                        <Typography key={`st_title_${k}`} variant="subtitle1" display="block" className={css.studiumTitle}>{stadium}</Typography>
                    </Grid>
                    <Grid item={true} container={true} className={css.stadiumTimeGridRoot}>
                        <Grid item={true} className={css.studiumPanel}>
                            <MultiSelect id={`tm_${k}`} key={`k_tm_${k}`}
                                value={selectedTimes} valueList={timeVals} width={`${timeSelectWidth}px`} label="時間帯"
                                handleChange={handleTimeChange(area, stadium)} />
                        </Grid>
                        <Grid item={true} className={css.goumenGrid}>
                            <Badge badgeContent={cntGoumen} color="primary">
                                <Button variant="outlined" onClick={handleGoumenBtnClick(area, stadium)}>
                                    <GridOnIcon />
                                </Button>
                            </Badge>
                        </Grid>
                    </Grid>
                </Grid>
            )
        });

        return (
            <Grid key={`area_g_${k}`} item={true}>
                <div className={css.areaDiv}>
                    <Grid container={true}>
                        <Grid item={true}>
                            <CardContent>
                                <Typography key={`area_title_${k}`} variant="h5" display="block" className={css.areaTitle}>{area}</Typography>
                            </CardContent>
                        </Grid>
                        <Grid item={true} container={true} spacing={2}>
                            <CardContent>
                            <Grid item={true} className={css.stadiumSelectGrid}>
                                <MultiSelect id={`stadium_${k}`} key={`k_stadium_${k}`}
                                    value={selectedStadiums} valueList={stadiumVals} width="340px" label="球場"
                                    handleChange={handleStadiumChange(area)} />
                            </Grid>
                            {stadiumGrid}
                            </CardContent>
                        </Grid>
                    </Grid>
                </div>
            </Grid>
        )
    });

    return (
        <div>
            <Dialog fullScreen={true} open={props.open} onClose={props.handleClose} className={css.dialogRoot}>
                <DialogTitle>ターゲットの追加</DialogTitle>
                <DialogActions>
                    <Button variant="outlined" onClick={props.handleClose}>キャンセル</Button>
                </DialogActions>
                <DialogContent>
                    <Grid container={true} direction="column" className={css.rowContainer} spacing={3}>
                        <Grid item={true} container={true} direction="row" spacing={3}>
                            <Grid item={true}>
                                <DatePicker
                                    minDate={startDay} maxDate={endDay}
                                    value={selectedDate} label="対象日" format="yyyy年MM月dd日(eee)"
                                    onChange={dt => handleDateChange(dt)} />
                            </Grid>
                            <Grid item={true}>
                                <MultiSelect 
                                    id="area" value={selectedAreas} valueList={areas} width="270px" label="エリア"
                                    handleChange={handleAreaChange} />
                            </Grid>
                        </Grid>
                        <Grid item={true} container={true} className={css.scrollRootGrid}>
                            <ScrollDiv diffHeight={220} width="100%" padding='10px 2px 5px 2px'>
                                <div className={css.scrollContentWrap}>
                                    {areaGrids}
                                </div>
                            </ScrollDiv>
                        </Grid>  
                    </Grid>
                </DialogContent>
            </Dialog>
            {goumeDialogContent}
        </div>
    )
}
export default AddTarget;