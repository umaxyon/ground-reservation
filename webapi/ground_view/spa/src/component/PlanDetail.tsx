import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme, withStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
    Grid, Paper, Button,  Typography, Badge, Switch, FormControlLabel, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import { 
    loadPlanById,
    submitWatchChange,
    changeNavi,
    getPlanFromDate,
    openDeleteConfirm,
    closeDeleteConfirm,
    deletePlan } from '../modules/PlanListSlice';
import { loadTargetsFromDate, initNewTarget } from '../modules/TargetsSlice'; 
import { useParams } from 'react-router-dom';
import { SUB_DOMAIN, AREAS } from '../modules/Constants';
import { ConfirmDialog } from './Dialogs';
import { Plan } from './PlanRow';


interface DetailParamType {
    planId: string
}

const theme = createMuiTheme({
    palette: { primary: green },
});

const useStyles = makeStyles((theme: Theme) => 
    createStyles({
        paper: {
            padding: theme.spacing(2),
            margin: 'auto'
        },
        hrMargin: {
            width: '100%',
            marginTop: '10px',
            marginBottom: '10px'
        },
        countInfoRow: {
            marginLeft: '20px'
        },
        parentRow: {
            position: 'relative',
            height: '100%'
        },
        vcenter: {
            display: 'inline-block',
            position: 'absolute',
            top: '50%',
            transform: 'translate(0, -50%)'
        },
        ymdRow: {
            paddingTop: '10px',
            paddingBottom: '20px'
        }
    }),
);

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

const PlanDetail: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const css = useStyles();
    const params = useParams<DetailParamType>()
    const ps = useAppSelector(st => st.PlanListSlice);
    const dtl = new Plan(ps.detail);

    useEffect(() => {
        dispatch(loadPlanById(params.planId))
    }, [params.planId, dispatch])

    useEffect(() => {
        if (ps.delPlanResp) {
            history.push(`/${SUB_DOMAIN}/`);
            dispatch(closeDeleteConfirm({}));
            dispatch(changeNavi('pList'))
        }
    }, [ps.delPlanResp, dispatch])

    const reserved_cnt = dtl.dat.reserved_cnt > -1 ? dtl.dat.reserved_cnt.toString() : '';
    const target_cnt = dtl.dat.target_cnt > -1 ? dtl.dat.target_cnt.toString() : '';
    const isWatch = dtl.dat.status === '監視中'

    const handleChangeWatch = () => {
        dispatch(submitWatchChange({ planId: params.planId, isWatch: (!isWatch) }))
    }

    const handleClickOpen = async () => {
        await dispatch(getPlanFromDate({ date: dtl.dat.ymd_range, from: "PlanDetail" }));
        await dispatch(loadTargetsFromDate({}));
        dispatch(changeNavi('add_plan'));
        history.push(`/${SUB_DOMAIN}/add_plan`);
    }

    const handleClickDelete = () => {
        dispatch(openDeleteConfirm({}));
    }

    const handleDeleteConfirm = (yesNo: string) => () => {
        if (yesNo === 'delete') {
            dispatch(initNewTarget({areas: AREAS}));
            dispatch(deletePlan(dtl.dat.ymd_range));
        } else {
            dispatch(closeDeleteConfirm({}));
        }
    }

    const reserveDetail = dtl.reservedData().map((r, i) => {
        return (
            <TableRow key={`reserveDat_${r.area}_${r.timebox}_${i}`}>
                <TableCell component="th" scope="row">{r.area}</TableCell>
                <TableCell>{r.timebox || ""}</TableCell>
                <TableCell>{r.stadium || "未"}</TableCell>
                <TableCell>{r.gno || ""}</TableCell>
                <TableCell>{r.reserve_no || ""}</TableCell>
            </TableRow>
        )
    })

    return (
        <Paper className={css.paper}>
            <Grid direction="column" container={true} spacing={1}>
                <Grid item={true}>
                    <Typography variant="h5">プラン詳細</Typography>
                </Grid>
                <Grid item={true} style={{ width: '100%' }}>
                    <hr className={css.hrMargin}/>
                </Grid>
                <Grid item={true}>
                    <Typography variant="h4" className={css.ymdRow}>{dtl.ymdFull()}</Typography>
                </Grid>
                <Grid item={true} container={true} className={css.countInfoRow} spacing={3}>
                    <Grid item={true}>
                        予約済み: <Typography variant="h6" display="block">{reserved_cnt}</Typography>
                    </Grid>
                    <Grid item={true}>
                        ターゲット数: <Typography variant="h6" display="block">{target_cnt}</Typography>
                    </Grid>
                </Grid>
                <Grid item={true} container={true}>
                    <Grid item={true} container={true} component="label" spacing={2} className={css.parentRow}>
                        <Grid item={true}>
                            <Typography variant="subtitle1" className={css.vcenter} >監視: </Typography>
                        </Grid>
                        <Grid item={true} className={css.vcenter} style={{ marginLeft: '50px'}}>Off</Grid>
                        <Grid item={true} style={{ marginLeft: '60px'}}>
                            <Switch color="primary" checked={isWatch} onChange={handleChangeWatch} />
                        </Grid>
                        <Grid item={true} className={css.vcenter} style={{ marginLeft: '140px'}}>On</Grid>
                    </Grid>
                    <Grid item={true}>
                        <ThemeProvider theme={theme}>
                            <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleClickOpen} style={{ marginTop: '20px'}}>
                                プランを編集する
                            </Button>
                        </ThemeProvider>
                        <Button variant="contained" color="secondary" startIcon={<DeleteForeverIcon />} onClick={handleClickDelete} style={{ marginLeft: '20px', marginTop: '20px'}}>
                            プランを削除する
                        </Button>
                    </Grid>
                </Grid>
                <Grid item={true} style={{ width: '100%' }}>
                    <hr className={css.hrMargin} />
                </Grid>
                <Grid item={true}>
                    <Typography variant="subtitle1">予約状況 </Typography>
                </Grid>
                <Grid item={true} container={true}>
                    <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>エリア</StyledTableCell>
                                    <StyledTableCell>時間帯</StyledTableCell>
                                    <StyledTableCell>球場</StyledTableCell>
                                    <StyledTableCell>号面</StyledTableCell>
                                    <StyledTableCell>予約番号</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reserveDetail}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <ConfirmDialog
                open={ps.deleteConfirm}
                title="プラン削除"
                message={`プランを削除してもよろしいですか？`}
                btnDirection="column"
                txtBtn1="はい"
                txtBtn2="キャンセル"
                handleClick1={handleDeleteConfirm("delete")}
                handleClick2={handleDeleteConfirm("cancel")}
            />
        </Paper>
    )
}

export default PlanDetail;