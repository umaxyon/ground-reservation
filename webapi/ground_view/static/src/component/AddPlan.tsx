import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Badge, Switch, FormControlLabel } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import AddTarget from './AddTarget';
import { green } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MaterialTable, { MTableToolbar } from 'material-table';
import { TableIcons, TableLocalization } from './TableConst';
import {
    initNewTarget,
    changeWatch,
    cancelCloseTarget,
    clearAllTarget, 
    openEditTarget,
    allTargetDateChange,
    loadTargetsFromDate } from '../modules/TargetsSlice';
import { 
    changeNavi,
    submitPlan,
    convertTargetList,
    convertTargetListForSubmit,
    changePickerDate,
    decideTargetDateChange,
    planDateInit,
    changePickerDateConfirm,
    firstEnd} from '../modules/PlanListSlice';
import { SUB_DOMAIN } from '../modules/Constants';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DatePicker } from '@material-ui/pickers';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import ja from 'date-fns/locale/ja';
import { ConfirmDialog } from './Dialogs';


const useStyles = makeStyles((theme: Theme) => 
    createStyles({
        paper: {
            padding: theme.spacing(2),
            margin: 'auto'
        },
        hrMargin: {
            marginTop: '10px',
            marginBottom: '10px'
        },
        listRoot: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
        },
        tableHeaderDiv: {
            padding: '3px 10px'
        },
        btnDelete: {
            marginLeft: '12px'
        }
    }),
);

const theme = createMuiTheme({
    palette: { primary: green },
});

const AddPlan: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const css = useStyles();
    
    const dt = new Date();
    const startDay = addDays(dt, 3)
    const endDay = addMonths(dt, 2)
    
    const ts = useAppSelector(st => st.TargetsSlice);
    const ps = useAppSelector(st => st.PlanListSlice);

    const plans = Object.keys(ps.plans).map<string[]>(k => ps.plans[k].map<string>(p => p.ymd_range));
    const planedDays = Array.from(new Set(([] as string[]).concat(...plans)))
    let pickerDate = ps.pickerDate || format(startDay, 'yyyyMMdd');

    const targets = ts.targets.slice().sort((a, b) => (a.date === b.date) ? 0 : (a.date < b.date) ? -1 : 1);
    const itemList = convertTargetList(targets);
    const existsTarget = itemList.length === 0 ? 'add': 'edit';
    const strMode = ts.mode === 'add' ? '登録': '編集';
    
    if (existsTarget === 'add') {
        while (planedDays.includes(pickerDate)) {
            pickerDate = format(addDays(parse(pickerDate, 'yyyyMMdd', dt), 1), 'yyyyMMdd')
        }
    }

    useEffect(() => {
        if (ps.addPlanResp) {
            history.push(`/${SUB_DOMAIN}/`);
            dispatch(changeNavi('pList'))
        }
    }, [ps.addPlanResp, dispatch])

    useEffect(() => {
        if (ps.first) {
            dispatch(changePickerDate({date: pickerDate }))
            dispatch(firstEnd({}))
        }
    }, [dispatch])

    const handleClickOpen = () => {
        dispatch(changePickerDate({date: pickerDate }));
        if (existsTarget === 'add') {
            dispatch(initNewTarget({areas: ['蒲田'], date: pickerDate}));
        } else {
            dispatch(openEditTarget(pickerDate));
        }
    }

    const handleChangeWatch = () => {
        dispatch(changeWatch(!ts.watchStart))
    }

    const handleClickClose = () => {
        dispatch(cancelCloseTarget({}))
    }

    const handleClickSave = () => {
        dispatch(submitPlan({ itemList: convertTargetListForSubmit(targets) }));
    }

    const handleClickTargetDelete = () => {
        dispatch(clearAllTarget({}))
    }

    const handleClickRowEdit = (row: any) => {
        dispatch(openEditTarget(pickerDate))
    }

    const handleDateChange = (dt: MaterialUiPickersDate) => {
        const strDate = format(dt as Date, 'yyyyMMdd')
        dispatch(changePickerDateConfirm(strDate));
    }

    const handleDateConfrict = (mode: string) => () => {
        if (mode === 'editOld') {
            dispatch(loadTargetsFromDate({}))
        } else {
            dispatch(planDateInit({})) // キャンセル
        }
    }

    const handleTargetDateChangeConfirm = (yesNo: string) => () => {
        if (yesNo === 'yes') {
            dispatch(allTargetDateChange(ps.targetEditDate));
        }
        dispatch(decideTargetDateChange(yesNo));
    }

    const cellStyle = { 
        paddingTop: '8px', paddingBottom: '7.2px'
    }

    return (
        <Paper className={css.paper}>
            <AddTarget open={ts.open} handleClose={handleClickClose}/>
            <Grid direction="column" container={true} spacing={1}>
                <Grid item={true}>
                    <Typography variant="h5">プランの{strMode}</Typography>
                </Grid>
                <Grid item={true}>
                    <DatePicker
                        minDate={startDay} maxDate={endDay}
                        value={parse(pickerDate, 'yyyyMMdd', new Date())} label="対象日" format="yyyy年MM月dd日(eee)"
                        onChange={dt => handleDateChange(dt)} 
                        renderDay ={(day, selectedDate, isInCurrentMonth, dayComponent) => {
                            const selD = format((day as Date), 'yyyyMMdd', {locale: ja});
                            return <Badge color="secondary" invisible={!planedDays.includes(selD)} variant="dot" >{dayComponent}</Badge>
                        }}
                    />
                </Grid>
                <Grid item={true}>
                    <hr className={css.hrMargin}/>
                </Grid>
                <Grid item={true} container={true} justify="space-between">
                    <Grid item={true} container={true} spacing={2}>
                        <Grid item={true}>
                            <Button variant="contained" color="secondary" startIcon={<NoteAddIcon />} disabled={targets.length == 0} onClick={handleClickSave}>
                                {strMode}確定
                            </Button>
                        </Grid>
                        <Grid item={true}>
                            <FormControlLabel label={`${strMode}と同時に監視を始める`} disabled={targets.length == 0}
                                control={<Switch color="primary" checked={ts.watchStart} onChange={handleChangeWatch} />} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item={true}>
                    <MaterialTable
                        title="ターゲット一覧"
                        columns={[
                            { title: 'エリア', field: 'area', cellStyle },
                            { title: '球場', field: 'stadium', cellStyle },
                            { title: '時間帯', field: 'time', cellStyle },
                            { title: '号面数', field: 'goumen', searchable: false, cellStyle }
                        ]}
                        components={{
                            Toolbar: props => (
                                <div>
                                    <MTableToolbar {...props} />
                                    <div className={css.tableHeaderDiv}>
                                        <ThemeProvider theme={theme}>
                                            <Button variant="contained" color="primary" startIcon={<GroupAddIcon />} onClick={handleClickOpen}>
                                                ターゲットの{strMode}
                                            </Button>
                                        </ThemeProvider>
                                        <Button variant="contained" startIcon={<DeleteForeverIcon />} disabled={targets.length == 0} className={css.btnDelete} onClick={handleClickTargetDelete}>
                                            全て削除
                                        </Button>
                                    </div>
                                </div>
                            )
                        }}
                        actions={[
                            {
                                icon: () => <Edit />,
                                tooltip: '編集',
                                onClick: (e, rowData) => handleClickRowEdit(rowData)
                            }
                        ]}
                        icons={TableIcons}
                        localization={TableLocalization}
                        data={itemList}
                        options={{
                            pageSize: 10,
                            padding: 'dense'
                        }}
                    />
                </Grid>
            </Grid>
            <ConfirmDialog
                open={(ps.dateConfrict !== '')}
                title="日付重複"
                message={`${ps.dateConfrict}のプランがすでに存在します。`}
                btnDirection="column"
                txtBtn1="登録済みプランをロードして編集モードに入る"
                txtBtn2="キャンセル"
                handleClick1={handleDateConfrict("editOld")}
                handleClick2={handleDateConfrict("cancel")}
            />
            <ConfirmDialog
                open={ps.targetEditDate !== ''}
                title="日付変更"
                message={`現在のターゲットの日付を変更して良いですか？`}
                btnDirection="column"
                txtBtn1="はい"
                txtBtn2="キャンセル"
                handleClick1={handleTargetDateChangeConfirm('yes')}
                handleClick2={handleTargetDateChangeConfirm('no')}
            />
        </Paper>
    );
}
export default AddPlan;
