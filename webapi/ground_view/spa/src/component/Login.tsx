import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { FormControl, InputLabel, Input, FormHelperText, InputAdornment, Button, IconButton } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { 
    IAuthState,
    changeAuthText,
    toggleShowPassword,
    requestLogin
} from '../modules/AuthSlice';
import { SUB_DOMAIN } from '../modules/Constants';

const useStyles = makeStyles((theme: Theme) => 
    createStyles({
        root: {
            ...theme.mixins.gutters(),
            paddingTop: theme.spacing() * 2,
            paddingBottom: theme.spacing() * 2,
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
        },
        formControl: {
            maxWidth: 300,
        },
        textField: {
        },
        button: {
            marginTop: theme.spacing() * 4,
            maxWidth: 160,
        },
    }),
);

const Login: React.FC<any> = (props) => {
    const dispatch = useAppDispatch();
    const css = useStyles();

    const input = useAppSelector(st => st.AuthSlice.input);
    const isLoggedIn = useAppSelector(st => st.AuthSlice.isLoggedIn);
    const error = useAppSelector(st => st.AuthSlice.error);
    const hasError = !!error;

    const handleClickLogin = () => {
        dispatch(requestLogin({}));
    }

    const handleChangeWith = (key: 'username' | 'pswd') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const param: {[key: string]: string} = {}
        param[key] = e.target.value;
        dispatch(changeAuthText(param));
    }

    const handleClickShowPassword = () => {
        dispatch(toggleShowPassword({}));
    }

    return ((isLoggedIn) ? <Redirect to={`/${SUB_DOMAIN}/`} /> : 
            <div className={css.root}>
            <h1>ログイン</h1>
            <div className={css.form}>
                <FormControl className={css.formControl} error={hasError} required={true}>
                    <InputLabel htmlFor="userid">ユーザID</InputLabel>
                    <Input
                        id="userid"
                        className={css.textField}
                        value={input.username}
                        onChange={handleChangeWith("username")}
                        aria-describedby="component-error-text"
                    />
                    <FormHelperText id="component-error-text">{error}</FormHelperText>
                </FormControl>
                <FormControl className={css.formControl} error={hasError} required={true}>
                    <InputLabel htmlFor="password">パスワード</InputLabel>
                    <Input
                        id="password"
                        className={css.textField}
                        value={input.pswd}
                        type={input.showPassword ? "text" : "password"}
                        onChange={handleChangeWith("pswd")}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Toggle password visibility"
                                    onClick={handleClickShowPassword}
                                >
                                    {input.showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <Button variant="contained" color="primary" className={css.button} onClick={handleClickLogin}>ログイン</Button>
            </div>
        </div>
    )
}

export default Login;
