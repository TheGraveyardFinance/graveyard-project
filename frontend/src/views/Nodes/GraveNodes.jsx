import { Grid } from '@material-ui/core';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Page from '../../components/Page';
import GraveNode from '../GraveNode';
import GraveCard from './GraveCard';
import { createGlobalStyle } from 'styled-components';

const BackgroundImage = createGlobalStyle`
  body {
    background-size: cover !important;
    background: radial-gradient(circle at 52.1% -29.6%, rgb(144, 17, 105) 0%, rgb(51, 0, 131) 100.2%);
    ;
  }
`;

const GraveNodes = () => {
  const { path } = useRouteMatch();
  return (
    <Page>
      <BackgroundImage />
      <Switch>
        <Route exact path={path}>
          <h1 style={{ fontSize: '80px', textAlign: 'center' }}>NODES</h1>
          <Grid container spacing={3} style={{ marginTop: '20px' }}>
            <GraveCard />
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
