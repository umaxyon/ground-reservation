import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AddTarget from './AddTarget';


const useStyles = makeStyles((theme: Theme) => 
    createStyles({
        paper: {
            padding: theme.spacing(2),
            margin: 'auto'
        }
    }),
);


const AddPlan: React.FC<any> = (props) => {
    const css = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClickClose = () => {
        setOpen(false);
    }

    return (
        <Paper className={css.paper}>
            <Grid direction="column" container={true}>
                <Grid item={true}>
                    <Typography variant="h5">プランの作成</Typography>
                </Grid>
                <Grid item={true}>
                    <hr />
                </Grid>
                <Grid item={true}>
                    <Button variant="contained" color="secondary" startIcon={<GroupAddIcon />} onClick={handleClickOpen}>ターゲットの追加</Button>
                    <AddTarget open={open} handleClose={handleClickClose}/>
                </Grid>
            </Grid>
        </Paper>
    );
}
export default AddPlan;
