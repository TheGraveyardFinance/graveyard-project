import {Grid, Typography, Button} from '@material-ui/core';
import {Link} from 'react-router-dom';

import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import Page from '../../components/Page';
import GraveNode from '../GraveNode';
import useBank from '../../hooks/useBank';
import {createGlobalStyle} from 'styled-components';
import NodesInfoCard from '../../components/NodesInfoCard';
import HomeImage from '../../assets/img/home.png';

const BackgroundImage = createGlobalStyle`
  body {
    background-size: cover !important;
    background: url(${HomeImage}) no-repeat !important;
    ;
  }
`;

const GraveNodes = () => {
  const {path} = useRouteMatch();

  const GraveNodeBank = useBank('GraveNode');

  return (
    <Page>
      <BackgroundImage />
      <Switch>
        <Route exact path={path}>
          <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
            Nodes
          </Typography>
          <Typography color="textPrimary" align="center" variant="h6" gutterBottom style={{marginBottom: '20px'}}>
            Buy Nodes and lock supply to earn daily returns
            <br />
            Earn monthly airdrops by buying Nodes and NFTs
          </Typography>
          <Grid container>
            <Button
              component={Link}
              to={`/leaderboard`}
              className="shinyButton"
              style={{marginLeft: 'auto', marginRight: 'auto', textAlign: 'center'}}
            >
              Go to Leaderboard
            </Button>
          </Grid>

          <Grid container spacing={3} style={{marginTop: '30px'}}>
            <NodesInfoCard bank={GraveNodeBank} />
          </Grid>
        </Route>
        <Route path={`${path}/:bankId`}>
          <GraveNode />
        </Route>
      </Switch>
    </Page>
  );
};

export default GraveNodes;
