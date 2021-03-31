import React, { useEffect, FocusEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Button, Chip, TextField, Badge, Switch, FormControlLabel } from '@material-ui/core';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import {
    getSettings,
    noticeEdit,
    changeAccountText,
    changePasswordText,
    saveSettings,
    changeWeek,
    changeWeekEnabled,
    changeOpenTargetWeek,
    openAddTargetForWeek } from '../modules/SettingsSlice';
import { closeAndClearTarget, changeMode } from '../modules/TargetsSlice';
import ScrollDiv from './ScrollDiv';
import MultiSelect from './MultiSelect';
import AddTarget from './AddTarget';
import { WEEK, WEEK_KEYS } from '../modules/Constants';


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
        vcenterParent: {
            position: 'relative',
            height: '100%'
        },
        vcenter: {
            display: 'inline-block',
            position: 'absolute',
            top: '50%',
            transform: 'translate(0, -50%)'
        },
        mainGridContainer: {
            paddingLeft: '10px'
        }
    })
)

const Settings: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const css = useStyles();

    const ss = useAppSelector(st => st.SettingsSlice);
    const isEdit = useAppSelector(st => st.SettingsSlice.isEdit);

    useEffect(() => {
        dispatch(getSettings({}));
    }, [dispatch])

    let strAvailable = '';
    let chipColor: "default" | "primary" | "secondary" | undefined;
    switch (ss.available) {
        case 1: strAvailable = '稼働中'; chipColor = 'primary'; break;
        case 2: strAvailable = 'メンテ中'; chipColor = 'secondary'; break;
        default: strAvailable = '停止中'; chipColor = 'default'; break;
    }

    const isEditDisabled = (ss.available === 1) ? !isEdit : true;

    const handleClickSave = () => {
        dispatch(saveSettings({}))
    }

    const handleBlar = (e: FocusEvent<HTMLInputElement>) => {
        const param: { isEdit: boolean, [key: string]: any } = { isEdit: true };
        param[e.target.name] = e.target.value;
        dispatch(noticeEdit(param));
    }

    const handleChangeAccount = (e: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(changeAccountText(e.target.value))
    }

    const handleChangePassword = (e: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(changePasswordText(e.target.value))
    }

    const handleChangeWeeks = (e: React.ChangeEvent<{ value: unknown }>) => {
        dispatch(changeWeek(e.target.value));
    }

    const handleChangeWeekEnable = (week: string) => (e: React.ChangeEvent<{ checked: boolean }>) => {
        dispatch(changeWeekEnabled({ enable: e.target.checked, week }));
    }

    const handleClickEditTarget = (week: string) => () => {
        dispatch(openAddTargetForWeek(week));
    }

    const handleClickClose = () => {
        dispatch(closeAndClearTarget({}));
        dispatch(changeOpenTargetWeek(""));
    }

    const weekGrids = ss.weeks.map(w => {
        const week: string = w || "";
        const k = WEEK_KEYS.get(week);
        const isChecked = ss.weekData[week].enable;

        return (
            <Grid key={`week_g_${week}`} item={true} container={true} direction="row" spacing={3} className={css.vcenterParent} style={{ height: "80px" }}>
                <Grid item={true}  className={css.vcenter} style={{ left: "15px" }}>
                    <Typography key={`week_title_${k}`} variant="subtitle1" display="block"><b>{week}曜日</b></Typography>
                </Grid>
                <Grid item={true} className={css.vcenter} style={{ left: "80px" }}>
                    <FormControlLabel label="有効" control={<Switch color="primary" checked={isChecked} onChange={handleChangeWeekEnable(week)} />} />
                </Grid>
                <Grid item={true}  className={css.vcenter} style={{ left: "180px" }}>
                    <Button variant="contained" color="primary" startIcon={<GroupAddIcon />} onClick={handleClickEditTarget(week)}>
                        ターゲット指定
                    </Button>
                </Grid>
            </Grid>
        )
    });


    return (
        <Paper className={css.paper}>
            <AddTarget open={ss.openTaregeWeek != ""} handleClose={handleClickClose}/>
            <Grid direction="column" container={true} spacing={1}>
                <Grid item={true}>
                    <Typography variant="h5">設定</Typography>
                </Grid>
                <Grid item={true}>
                    <hr className={css.hrMargin}/>
                </Grid>
                <Grid item={true} style={{ height: '60px'}}>
                    <b>システム稼働状況</b> : <Chip size="small" color={chipColor} label={strAvailable} />
                </Grid>
                <Grid item={true}>
                    <Button variant="contained" color="secondary" startIcon={<NoteAddIcon />} disabled={isEditDisabled} onClick={handleClickSave}>
                        保存
                    </Button>
                </Grid>
                <Grid item={true}>
                    <ScrollDiv diffHeight={230} width="100%" padding='20px 2px 5px 2px'>
                        <Grid container={true} direction="column" className={css.mainGridContainer}>
                            <Grid item={true} container={true} alignItems="center" spacing={2}>
                                <Grid item={true}>
                                    <b>予約用アカウント</b>
                                </Grid>
                                <Grid item={true} container={true} direction="row" spacing={3}>
                                    <Grid item={true}>
                                        <TextField　label="アカウント" name="account" value={ss.account} onChange={handleChangeAccount} onBlur={handleBlar} />
                                    </Grid>
                                    <Grid item={true}>
                                        <TextField　label="パスワード" name="pswd" type="password" value={ss.pswd} onChange={handleChangePassword} onBlur={handleBlar} />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item={true} container={true} className={css.vcenterParent} style={{ height: '100px'}}>
                                <Grid item={true} className={css.vcenter}>
                                    <b>週次プラン生成</b>
                                </Grid>
                                <Grid item={true} className={css.vcenter} style={{ left: "120px" }}>
                                    <MultiSelect id="weeks" value={ss.weeks} valueList={WEEK} width="270px" label="曜日"
                                            handleChange={handleChangeWeeks} />
                                </Grid>
                            </Grid>
                            {weekGrids}
                        </Grid>
                    </ScrollDiv>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default Settings;