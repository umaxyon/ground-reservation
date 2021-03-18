import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import EditIcon from '@material-ui/icons/Edit';
import { Grid, Paper, Button,  Typography, Badge, Switch, FormControlLabel } from '@material-ui/core';
import { loadPlanById, submitWatchChange, changeNavi, getPlanFromDate } from '../modules/PlanListSlice';
import { loadTargetsFromDate } from '../modules/TargetsSlice'; 
import { useParams } from 'react-router-dom';
import { SUB_DOMAIN } from '../modules/Constants';


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
    }),
);

const PlanDetail: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const css = useStyles();
    const params = useParams<DetailParamType>()
    const ps = useAppSelector(st => st.PlanListSlice);
    const dtl = ps.detail;

    useEffect(() => {
        dispatch(loadPlanById(params.planId))
    }, [params.planId, dispatch])

    const reserved_cnt = dtl.reserved_cnt > -1 ? dtl.reserved_cnt.toString() : '';
    const target_cnt = dtl.target_cnt > -1 ? dtl.target_cnt.toString() : '';
    const isWatch = dtl.status === '監視中'

    const handleChangeWatch = () => {
        dispatch(submitWatchChange({ planId: params.planId, isWatch: (!isWatch) }))
    }

    const handleClickOpen = async () => {
        await dispatch(getPlanFromDate({ date: dtl.ymd_range, from: "PlanDetail" }));
        await dispatch(loadTargetsFromDate({}));
        dispatch(changeNavi('add_plan'));
        history.push(`/${SUB_DOMAIN}/add_plan`);
    }

    return (
        <Paper className={css.paper}>
            <Grid direction="column" container={true} spacing={1}>
                <Grid item={true}>
                    <Typography variant="h5">プラン詳細</Typography>
                </Grid>
                <Grid item={true}>
                    <hr className={css.hrMargin}/>
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
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default PlanDetail;