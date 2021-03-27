import React from 'react';
import { Grid, Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';


export const AlertDialog: React.FC<any> = (props) => {  
    return (
    <Dialog open={props.open} onClose={props.handleOkClick} disableBackdropClick={true}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
            <Grid container={true}>
                <Grid item={true}>
                    {props.message}
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.handleOkClick} color="primary">OK</Button>
        </DialogActions>
    </Dialog>
    )
}


export const ConfirmDialog: React.FC<any> = (props) => {  
    return (
    <Dialog open={props.open} disableBackdropClick={true}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
            <Grid container={true}>
                <Grid item={true}>
                    {props.message}
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Grid container={true} direction={props.btnDirection} spacing={2} alignItems="center">
                <Grid item={true}>
                    <Button onClick={props.handleClick1} color="primary">{props.txtBtn1}</Button>
                </Grid>
                <Grid item={true}>
                    <Button onClick={props.handleClick2} color="primary">{props.txtBtn2}</Button>
                </Grid>
            </Grid>
        </DialogActions>
    </Dialog>
    )
}
