import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Select, ListItemText, Checkbox, MenuItem, InputLabel, Chip } from '@material-ui/core';

const createCss = (width: string) => makeStyles(() => ({
    chip: {
        margin: 1,
        fontSize: '0.45em'
    },
    valSelect: {
        width: (width || '255px')
    },
    label: {
        fontSize: '0.85em'
    }
}))


const MultiSelect: React.FC<any> = (props) => {
    const { id, handleChange, valueList, value, width, label } = props;
    const css = createCss(width)();

    return (
        <>
            <InputLabel id={`${id}-checkbox-label`} className={css.label}>{label}</InputLabel>
            <Select
                id={id} labelId={`${id}-checkbox-label`} onChange={handleChange} className={css.valSelect}
                value={value} multiple={true}
                renderValue={(selected) => (
                    <div>
                        {(selected as string[]).map((v) => (
                            <Chip variant="outlined" size="small" key={`cp_${v}`} label={v} className={css.chip} />
                        ))}
                    </div>
                )}>
                {valueList.map((v: any) => (
                    <MenuItem key={`pt_${v}`} value={v}>
                        <Checkbox checked={value.indexOf(v) > -1} />
                        <ListItemText primary={v} />
                    </MenuItem>
                ))}
            </Select>

        </>
    )
}

export default MultiSelect;
