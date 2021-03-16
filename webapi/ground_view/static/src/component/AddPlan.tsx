import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import AddTarget from './AddTarget';
import { initNewTarget, cancelCloseTarget } from '../modules/TargetsSlice';
import { green } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MaterialTable, { MTableToolbar } from 'material-table';
import { TableIcons, TableLocalization } from './TableConst';
import { clearAllTarget, openEditTarget } from '../modules/TargetsSlice';
import { submitPlan, convertTargetList, convertTargetListForSubmit } from '../modules/PlanListSlice';
import { SUB_DOMAIN } from '../modules/Constants';
import { changeNavi } from '../modules/PlanListSlice';


const useStyles = makeStyles((theme: Theme) => 
    createStyles({
        paper: {
            padding: theme.spacing(2),
            margin: 'auto'
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
    
    const addPlanResp = useAppSelector(st => st.PlanListSlice.addPlanResp);
    const open = useAppSelector(st => st.TargetsSlice.open);
    let targets = useAppSelector(st => st.TargetsSlice.targets);
    targets = targets.slice().sort((a, b) => (a.date === b.date) ? 0 : (a.date < b.date) ? -1 : 1);
    const itemList = convertTargetList(targets);

    useEffect(() => {
        if (addPlanResp) {
            history.push(`/${SUB_DOMAIN}/`);
            dispatch(changeNavi('pList'))
        }
    }, [addPlanResp, dispatch])

    const handleClickOpen = () => {
        dispatch(initNewTarget(['蒲田']))
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
        dispatch(openEditTarget({row}))
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
                    <hr />
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
                            { title: '日付', field: 'date', cellStyle },
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
                                                ターゲットの追加
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
                            padding: 'dense'
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
}
export default AddPlan;
