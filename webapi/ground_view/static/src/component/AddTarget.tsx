import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';


const AddTarget: React.FC<any> = (props) => {

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogTitle>ターゲットの追加</DialogTitle>
            <DialogActions>
                <Button variant="outlined" onClick={props.handleClose}>キャンセル</Button>
            </DialogActions>
            <DialogContent>
                aaa
            </DialogContent>
        </Dialog>
    )
}
export default AddTarget;