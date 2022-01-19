import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
//import ModalDialog from './ModalDialog';

import {
    useNavigate
  } from 'react-router-dom';
import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';

const useStyles = makeStyles(theme => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const cloudentity = new CloudentityAuth(authConfig);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleLogout = () => {
    function clearAuth() {
        cloudentity.revokeAuth()
          .then(() => {
            navigate('/');
          })
          .catch(() => {
            navigate('/');
          });
      }

      clearAuth();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Tweety!
        </Typography>
        <Button color="inherit" onClick={handleOpen}>
          Profile
        </Button>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;