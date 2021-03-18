import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Card, CardContent, Chip, Typography } from '@material-ui/core';
import { PlanType } from '../modules/PlanListSlice';
import { formatYmd } from '../utils';
import ContactlessIcon from '@material-ui/icons/Contactless';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import IconButton from '@material-ui/core/IconButton';
import { useHistory } from 'react-router-dom';
import { SUB_DOMAIN } from '../modules/Constants';

export class Plan {
    dat: PlanType

    constructor(dat: PlanType) {
        this.dat = dat;
    }
    id(): string {
        return this.dat.id;
    }
    ymd(): string {
        return this.dat.ymd_range.split('-').map(d => formatYmd(d)).reduce(
            (ac, cur) => ac == cur ? cur : `${ac}～${cur}`
        )
    }

}

const createCss = makeStyles(() => ({
    root: {
        marginBottom: '10px'
    },
    leftTitle: {
        backgroundColor: '#74c46b',
        width: '140px',
        height: '100%',
        position: 'relative'
    },
    contentGrid: {
        margin: '7px',
        position: 'relative'
    },
    textLineGrid: {
        position: 'relative',
        marginTop: '5px',
        marginBottom: '7px',
        marginLeft: '1px'
    },
    contentCard: {
        paddingTop: '8px',
        paddingBottom: '14px',
        paddingLeft:'12px'
    },
    rightButton: {
        width: '40px',
        height: '100%',
        position: 'relative',
        marginRight: '20px'
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
    countText: {
        marginLeft: '80px',
        display: 'inline-block',
        position: 'absolute',
        top: '50%',
        transform: 'translate(0, -50%)'
    },
    stadiumSpan: {
        fontSize: "120%",
        fontWeight: "bold"
    }
}))

const PlanRow: React.FC<any> = (props) => {
    const plan = props.data;
    const css = createCss();
    const { push } = useHistory();
    return (
        <Card key={`plan_${props.row}_card`} className={css.root}>
            <Grid container={true}>
                <Grid item={true}>
                    <CardContent className={css.leftTitle}>
                        <Typography variant="subtitle2" className={css.vcenter}>{plan.ymd()}</Typography>
                    </CardContent>
                </Grid>
                <Grid item={true} xs={true}>
                    <CardContent className={css.contentCard}>
                        <Grid container={true} direction="column" alignItems="stretch" spacing={1}>
                            <Grid item={true} className={css.contentGrid}>
                                <div>
                                    球場:  <span className={css.stadiumSpan}>{plan.dat.area_csv}</span>
                                </div>
                            </Grid>
                            <Grid item={true} container={true} direction="row" justify="flex-start" spacing={2} className={css.textLineGrid}>
                                <Grid item={true} className={css.vcenter}>
                                    <Chip size="small" avatar={<ContactlessIcon />} color="primary" label={plan.dat.status} />  
                                </Grid>
                                <Grid item={true} className={css.countText}>
                                    予約済み: {plan.dat.reserved_cnt}  /  対象: {plan.dat.target_cnt}
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Grid>
                <Grid item={true}>
                    <CardContent className={css.rightButton}>
                        <IconButton onClick={() => push(`/${SUB_DOMAIN}/edit_plan/${plan.id()}`)} className={css.vcenter}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    )
}

export default PlanRow;