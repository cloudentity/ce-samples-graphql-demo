import {Button, Stack} from '@mui/material';
import {makeStyles} from '@mui/styles'
import CloudentityAuth from '@cloudentity/auth';
import authConfig from './authConfig.js';


import Tooltip from "@material-ui/core/Tooltip";

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

export const LoginButton = ({auth}) => {

    const classes = useStyles();

  const handleAuth = () => {
    const scopes = 'all';
    console.log("asdfsafdds##########");
    console.log(authConfig);
    const cloudentity = new CloudentityAuth({...authConfig, ...scopes});
    cloudentity.authorize();
  };

  const buttonOnClick = () => {
    handleAuth();
  }

  return (
    <div className={classes.root} >
      <Stack
        className={classes.mainSection}
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <h3>Let's get you in there!</h3>
        <Tooltip title="This will intiate OAuth authorization request with Cloudentity ACP" placement="top">
          <Button className="AuthenticateButton" variant="contained" onClick={() => buttonOnClick()}>Authenticate</Button>
        </Tooltip>
      </Stack>
    </div>
  );


}  
