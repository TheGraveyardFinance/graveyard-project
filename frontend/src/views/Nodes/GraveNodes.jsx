import { Grid } from '@material-ui/core';
import HomeImage from '../../assets/img/home.png';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Page from '../../components/Page';
import GraveNode from '../GraveNode';
import GraveCard from './GraveCard';
import { createGlobalStyle } from 'styled-components';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
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
          <h1 style={{ fontSize: '80px', textAlign: 'center', color: '#ffffff' }}>NODES</h1>
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
