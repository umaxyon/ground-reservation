import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
    Grid, Button, CardContent, Badge, FormControlLabel, Checkbox, FormGroup,
    Dialog, DialogActions, DialogTitle, DialogContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import addDays from 'date-fns/addDays';
import parse from 'date-fns/parse'
import format from 'date-fns/format';
import ja from 'date-fns/locale/ja'
import MultiSelect from './MultiSelect';
import {
    createTargetAndClose,
    changeTargetArea, 
    changeTargetStadium,
    changeTargetTime, 
    openGomenDialog, ITimes, IGoumen,
    GoumenDialog, closeGomenDialog, commitGoumenDialog, checkGoumen,
    ErrorDialog, openErrorDialog, closeErrorDialog } from '../modules/TargetsSlice';
import { createWeekTargetAndClose } from '../modules/SettingsSlice';
import ScrollDiv from './ScrollDiv';
import GridOnIcon from '@material-ui/icons/GridOn';
import { AREAS, AREA_KEYS, STADIUMS, STADIUM_KEYS, GOUMENS, TimeResolver } from '../modules/Constants';
import { AlertDialog } from './Dialogs';

const timeSelectWidth = 335

const createCss = makeStyles(() => ({
    root: {
        position: 'relative'
    },
    dialogRoot: {
        margin: '20px'
    },
    dialogAction: {
        paddingLeft: '25px'
    },
    selectCountTypo: {
        paddingLeft: '10px',
        marginBottom: '-5px',
        fontWeight: 'bold'
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

const countSelectGoumen = (area: string, stadium: string, goumens: IGoumen) => {
    return (! (area in goumens) || ! (stadium in goumens[area])) ? 0 : goumens[area][stadium].length;
}

const AddTarget: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const css = createCss();
    const dt = new Date();
    const mode = useAppSelector(st => st.TargetsSlice.mode);
    const strMode = (mode === 'edit' || mode === 'week') ? '編集' : '追加';
    const pickerDate = useAppSelector(st => st.PlanListSlice.pickerDate);
    const pDate = (pickerDate) ? parse(pickerDate, 'yyyyMMdd', dt) : addDays(dt, 3);
    const pickerMonth = pDate.getMonth() + 1;

    const selectedAreas = useAppSelector(st => st.TargetsSlice.condition.areas) || [];
    const selectedStadiumOb = useAppSelector(st => st.TargetsSlice.condition.stadiums);
    const selectedStadiumMap = new Map(Object.entries(selectedStadiumOb));
    const selectedTimesOb: ITimes = useAppSelector(st => st.TargetsSlice.condition.times);
    const goumenDialog: GoumenDialog = useAppSelector(st => st.TargetsSlice.goumenDialog);
    const selectedGoumensOb: IGoumen = useAppSelector(st => st.TargetsSlice.condition.goumens);
    const errorDialog: ErrorDialog = useAppSelector(st => st.TargetsSlice.errorDialog);
    const total = useAppSelector(st => st.TargetsSlice.condition.total);
    const week = useAppSelector(st => st.SettingsSlice.openTaregeWeek);

    const handleAreaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(changeTargetArea({ area: event.target.value, pickerMonth }));
    }

    const handleStadiumChange = (area: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(changeTargetStadium({area, value:event.target.value, pickerMonth }));
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

    const handleCommitBtnClick = () => {
        if (total === 0) {
            dispatch(openErrorDialog({title: "ターゲットがありません", message: "ターゲットを1件以上選択してください"}));
            return
        }
        
        if (week !== "") {
            dispatch(createWeekTargetAndClose(week));
        } else {
            dispatch(createTargetAndClose({}));
        }
    }

    const handleErrorOkClick = () => {
        dispatch(closeErrorDialog({}));
    }

    const titleDate = (mode === "week") ? `週次プラン: ${week}曜日` :
        format(pDate, 'yyyy年MM月dd日(eee)', {locale: ja})

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
        const k = AREA_KEYS.get(area);
        const stadiumVals = STADIUMS[area];
        const selectedStadiums = selectedStadiumMap.get(area) || stadiumVals || [];

        const stadiumGrid = selectedStadiums.map((stadium: string) => {
            const k = STADIUM_KEYS.get(stadium);
            const timeResolver = new TimeResolver(stadium)
            const timeVals = timeResolver.get(pickerMonth);
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
                <DialogTitle>ターゲットの{strMode}</DialogTitle>
                <DialogActions className={css.dialogAction}>
                    <Grid container={true} spacing={2}>
                        <Grid item={true}><Button variant="outlined" onClick={props.handleClose}>キャンセル</Button></Grid>
                        <Grid item={true}><Button variant="contained" color="secondary" onClick={handleCommitBtnClick}>{strMode}</Button></Grid>
                    </Grid>
                </DialogActions>
                <DialogContent>
                    <Grid container={true} direction="column" className={css.rowContainer} spacing={3}>
                        <Grid item={true} container={true} direction="row" spacing={2} alignItems="center">
                            <Grid item={true}>
                                <Typography variant="h5">{titleDate}</Typography>
                            </Grid>
                            <Grid item={true}>
                                <Typography variant="subtitle2" className={css.selectCountTypo}>
                                    {total} 件選択中
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item={true}>
                            <MultiSelect 
                                    id="area" value={selectedAreas} valueList={AREAS} width="270px" label="エリア"
                                    handleChange={handleAreaChange} />
                        </Grid>
                        <Grid item={true} container={true} className={css.scrollRootGrid}>
                            <ScrollDiv diffHeight={270} width="100%" padding='10px 2px 5px 2px'>
                                <div className={css.scrollContentWrap}>
                                    {areaGrids}
                                </div>
                            </ScrollDiv>
                        </Grid>  
                    </Grid>
                </DialogContent>
            </Dialog>
            {goumeDialogContent}
            <AlertDialog 
                open={errorDialog.open} 
                title={errorDialog.title}
                message={errorDialog.message} 
                handleOkClick={handleErrorOkClick}
            />
        </div>
    )
}
export default AddTarget;
