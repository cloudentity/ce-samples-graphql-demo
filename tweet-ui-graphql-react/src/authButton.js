import {Button, Stack} from '@mui/material';
import {makeStyles} from '@mui/styles'
import Tooltip from "@material-ui/core/Tooltip";

import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';

const useStyles = makeStyles({
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    mainSection: {
      flexGrow: 1
    }
  });

export const AuthButton = ({auth}) => {

  const classes = useStyles();

  const handleAuth = () => {
    const scopes = 'all';
    console.log(authConfig);
    const cloudentity = new CloudentityAuth({...authConfig, ...scopes});
    cloudentity.authorize();
  };

  const buttonOnClick = () => {
    handleAuth();
  }

  return (
    <div className={classes.root} >
      <Stack className={classes.mainSection} direction="column" justifyContent="center" alignItems="center">
        <p>If you want to see more than this, we need to identity and authorize you further.
        <h3>Let's get you in there!</h3>
        </p>
        <Tooltip title="This will intiate OAuth authorization request with Cloudentity ACP" placement="top">
          <Button className="AuthenticateButton" variant="contained" onClick={() => buttonOnClick()}>Authorize</Button>
        </Tooltip>
      </Stack>
    </div>
  );


}  
