import * as React from 'react';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';

import {AuthButton} from './authButton.js';
import {GetLatestTweets} from './tweetsFeed.js';
import {Copyright} from './copyright.js';

export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tweety!
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export function HomePageContent({auth}) {
    return (
      <div>
          <ButtonAppBar />
          <Box component="main" sx={{ backgroundColor: '1', flexGrow: 1, height: '100vh', overflow: 'auto', }}>
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Grid container spacing={3}>
                {/* Auth Button */}
                <Grid item xs={12} md={8} lg={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500, }}>
                  {auth === null ? (
                    <div>
                      Loading...
                    </div>
                  ) : (
                    <AuthButton />
                  )}
                </Paper>
                </Grid>
                {/* Latest tweets */}
                <Grid item xs={12} md={8} lg={6}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600, }}>
                  <GetLatestTweets auth={auth} />
                  </Paper>
                </Grid>
                {/* Empty grid */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  </Paper>
                </Grid>
                <Copyright sx={{ pt: 4 }} />
              </Grid>
            </Container>
          </Box>
        </div>
    );

}
