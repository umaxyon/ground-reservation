import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Card, CardContent, Chip, Typography } from '@material-ui/core';
import { Target } from '../modules/TargetsSlice';


const createCss = makeStyles(() => ({
    root: {
        position: 'relative',
        marginBottom: '10px'
    },
    vcenter: {
        display: 'inline-block',
        position: 'absolute',
        top: '50%',
        transform: 'translate(0, -50%)'
    },
}));

const TargetRow: React.FC<any> = (props) => {
    const target: Target = props.data;
    const css = createCss();

    const stadiumList: any = [];
    Object.keys(target.stadiums).forEach((area, i) => {
        target.stadiums[area].forEach((st, j) => {
            stadiumList.push(
                <Chip key={`stChip_${i}_${j}`} label={st} />
            )
        });
    });

    return (
        <Card key={`plan_${props.row}_card`} className={css.root}>
            <Grid container={true}>
                <Grid item={true}>
                    <CardContent>
                        <Typography variant="subtitle2" className={css.vcenter}>{target.date}</Typography>
                    </CardContent>
                </Grid>
                <Grid item={true} >
                    <CardContent>
                        {stadiumList}
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    )
}

export default TargetRow;