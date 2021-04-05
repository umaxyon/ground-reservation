import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Card, CardContent, Chip, Typography } from '@material-ui/core';
import { PlanType, ReserveData } from '../modules/PlanListSlice';
import { formatYmd } from '../utils';
import ContactlessIcon from '@material-ui/icons/Contactless';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { useHistory } from 'react-router-dom';
import { SUB_DOMAIN, TimeResolver, STADIUMS_DEFAULT_SELECT } from '../modules/Constants';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import ja from 'date-fns/locale/ja';
import { createStyles, Theme } from '@material-ui/core/styles';
import { teal, indigo } from '@material-ui/core/colors';

export class Plan {
    dat: PlanType;
    pDate: Date;

    constructor(dat: PlanType) {
        this.dat = dat;
        this.pDate = parse(this.dat.ymd_range, 'yyyyMMdd', new Date());
    }
    id(): string {
        return this.dat.id;
    }
    ymd(): string {
        return this.dat.ymd_range.split('-').map(d => formatYmd(d)).reduce(
            (ac, cur) => ac == cur ? cur : `${ac}～${cur}`
        )
    }
    ymdFull(): string {
        if (!this.dat.ymd_range) {
            return "";
        }
        return format(this.pDate, 'yyyy年MM月dd日(eee)', {locale: ja})
    }
    month(): number {
        return Number.parseInt(format(this.pDate, 'MM', {locale: ja}));
    }

    reservedData(): ReserveData[] {
        const ret: ReserveData[] = []
        this.dat.reserve_data.forEach(r => {
            const stadium = r.stadium || STADIUMS_DEFAULT_SELECT[r.area][0];
            const timeptn = new TimeResolver(stadium).get(this.month())
            const timebox = timeptn[Number.parseInt(r.timebox)]
            ret.push({...r, timebox});
        });
        return ret;
    }
}

const createCss = makeStyles((theme: Theme) => createStyles({
    root: {
        marginBottom: '10px'
    },
    leftTitle: {
        backgroundColor: '#74c46b',
        width: '165px',
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
        marginLeft: '190px',
        display: 'inline-block',
        position: 'absolute',
        top: '50%',
        transform: 'translate(0, -50%)'
    },
    stadiumSpan: {
        fontSize: "120%",
        fontWeight: "bold"
    },
    colorPrimary: {
        backgroundColor: teal[500],
        color: theme.palette.getContrastText(teal[500])
    }
}))


function AuthorBadge(props: Partial<{ author: string }>) {
    const css = createCss();
    return (props.author === 'sys') ?
        <Chip size="small" className={css.colorPrimary} avatar={<ArrowDropDownCircleIcon className={css.colorPrimary} />} color="primary" label="自動作成" />  :
        <Chip size="small" avatar={<AccountCircleIcon />} color="secondary" label="手動作成" /> 
}

function StatusChip(props: Partial<{ status: string }>) {
    return (props.status === '監視中') ?
    <Chip size="small" avatar={<ContactlessIcon />} color="primary" label={props.status} />  :
    <Chip size="small" avatar={<RemoveCircleOutlineIcon />} label={props.status} /> 
}


const PlanRow: React.FC<any> = (props) => {
    const plan = props.data;
    const css = createCss();
    const { push } = useHistory();

    return (
        <Card key={`plan_${props.row}_card`} className={css.root}>
            <Grid container={true}>
                <Grid item={true}>
                    <CardContent className={css.leftTitle}>
                        <Typography variant="subtitle2" className={css.vcenter}><b>{plan.ymdFull()}</b></Typography>
                    </CardContent>
                </Grid>
                <Grid item={true} xs={true}>
                    <CardContent className={css.contentCard}>
                        <Grid container={true} direction="column" alignItems="stretch" spacing={1}>
                            <Grid item={true} className={css.contentGrid}>
                                <div>
                                    エリア:  <span className={css.stadiumSpan}>{plan.dat.area_csv}</span>
                                </div>
                            </Grid>
                            <Grid item={true} container={true} direction="row" justify="flex-start" spacing={2} className={css.textLineGrid}>
                                <Grid item={true} className={css.vcenter}>
                                    {<StatusChip status={plan.dat.status} />}
                                </Grid>
                                <Grid item={true} className={css.vcenter} style={{marginLeft: '90px'}}>
                                    <AuthorBadge author={plan.dat.author} />
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
                        <IconButton onClick={() => push(`/${SUB_DOMAIN}/plan_detail/${plan.id()}`)} className={css.vcenter}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    )
}

export default PlanRow;