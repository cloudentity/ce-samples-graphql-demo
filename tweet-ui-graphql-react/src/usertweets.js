import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import {GetLatestTweets} from './tweetsFeed.js';
import {PostTweet} from './postTweet.js';
import {Copyright} from './copyright.js';
import Navbar from './navbar.js';

export function UserTweets() {
    const [open, setOpen] = React.useState(true);

    return (
<div>
<div className="App">
      <Navbar />
    </div>
          <Box component="main" sx={{ backgroundColor: '1', flexGrow: 1, height: '100vh', overflow: 'auto', }}> 
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Chart */}
              <Grid item xs={6} md={4} lg={3}>
                <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 240,}}>
                <PostTweet />  
                </Paper>
              </Grid>
              {/* Latest tweets */}
              <Grid item xs={12} md={8} lg={9}>
              <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 600,}}>
                  <GetLatestTweets />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                </Paper>
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>

        </div>
    );

}