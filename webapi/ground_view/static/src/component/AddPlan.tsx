import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Badge } from '@material-ui/core';
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
    cancelCloseTarget,
    clearAllTarget, 
    openEditTarget,
    allTargetDateChange } from '../modules/TargetsSlice';
import { 
    changeNavi,
    submitPlan,
    convertTargetList,
    convertTargetListForSubmit,
    changePickerDate,
    decideDateConfrict,
    decideTargetDateChange} from '../modules/PlanListSlice';
import { SUB_DOMAIN } from '../modules/Constants';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DatePicker } from '@material-ui/pickers';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
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
    
    const targetEditDate = useAppSelector(st => st.PlanListSlice.targetEditDate);
    const pickerDate = useAppSelector(st => st.PlanListSlice.pickerDate) || format(startDay, 'yyyy/MM/dd');
    const dateConfrict = useAppSelector(st => st.PlanListSlice.dateConfrict);
    const addPlanResp = useAppSelector(st => st.PlanListSlice.addPlanResp);
    const open = useAppSelector(st => st.TargetsSlice.open);
    let targets = useAppSelector(st => st.TargetsSlice.targets);
    targets = targets.slice().sort((a, b) => (a.date === b.date) ? 0 : (a.date < b.date) ? -1 : 1);
    const itemList = convertTargetList(targets);
    const mode = itemList.length === 0 ? 'add': 'edit';
    const strMode = mode === 'add' ? '追加': '編集'

    useEffect(() => {
        if (addPlanResp) {
            history.push(`/${SUB_DOMAIN}/`);
            dispatch(changeNavi('pList'))
        }
    }, [addPlanResp, dispatch])

    const handleClickOpen = () => {
        dispatch(changePickerDate({date: pickerDate }));
        if (mode === 'add') {
            dispatch(initNewTarget(['蒲田']));
        } else {
            dispatch(openEditTarget(pickerDate));
        }
    }

    const handleClickClose = () => {
        dispatch(cancelCloseTarget({}))
    }

    const handleClickSave = () => {
        dispatch(submitPlan(convertTargetListForSubmit(targets)));
    }

    const handleClickTargetDelete = () => {
        dispatch(clearAllTarget({}))
    }

    const handleClickRowEdit = (row: any) => {
        dispatch(openEditTarget(pickerDate))
    }

    const handleDateChange = (dt: MaterialUiPickersDate) => {
        const strDate = format(dt as Date, 'yyyy/MM/dd')
        dispatch(changePickerDate({date: strDate, mode }));
    }

    const handleDateConfrict = (mode: string) => () => {
        dispatch(decideDateConfrict(mode))
    }

    const handleTargetDateChangeConfirm = (yesNo: string) => () => {
        if (yesNo === 'yes') {
            dispatch(allTargetDateChange(targetEditDate));
        }
        dispatch(decideTargetDateChange(yesNo));
    }

    const cellStyle = { 
        paddingTop: '8px', paddingBottom: '7.2px'
    }

    return (
        <Paper className={css.paper}>
            <AddTarget open={open} handleClose={handleClickClose}/>
            <Grid direction="column" container={true} spacing={1}>
                <Grid item={true}>
                    <Typography variant="h5">プランの作成</Typography>
                </Grid>
                <Grid item={true}>
                    <DatePicker
                        minDate={startDay} maxDate={endDay}
                        value={pickerDate} label="対象日" format="yyyy年MM月dd日(eee)"
                        onChange={dt => handleDateChange(dt)} 
                        renderDay ={(day, selectedDate, isInCurrentMonth, dayComponent) => {
                            return <Badge color="secondary" variant="dot" >{dayComponent}</Badge>
                        }}
                    />
                </Grid>
                <Grid item={true}>
                    <hr className={css.hrMargin}/>
                </Grid>
                <Grid item={true} container={true} justify="space-between">
                    <Grid item={true}>
                        <Button variant="contained" color="secondary" startIcon={<NoteAddIcon />} disabled={targets.length == 0} onClick={handleClickSave}>登録して監視開始</Button>
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
                open={(dateConfrict !== '')}
                title="日付重複"
                message={`${dateConfrict}のプランがすでに追加されています。`}
                btnDirection="column"
                txtBtn1="登録済みデータを優先して編集モードに入る"
                txtBtn2="登録済みデータを破棄して現在の内容で上書く"
                handleClick1={handleDateConfrict("editOld")}
                handleClick2={handleDateConfrict("forceUpdate")}
            />
            <ConfirmDialog
                open={targetEditDate !== ''}
                title="日付重複"
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
