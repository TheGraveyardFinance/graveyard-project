import React, { useMemo, useState, useEffect } from 'react';
import { useWallet } from '@librafinance-xyz/use-wallet';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Bank from '../Bank';
import { makeStyles } from '@material-ui/core/styles';
import Web3 from "web3"
import HomeImage from '../../assets/img/home.png';

import { Box, Card, CardContent, Button, Typography, Grid } from '@material-ui/core';

import { Alert } from '@material-ui/lab';

import UnlockWallet from '../../components/UnlockWallet';
import Page from '../../components/Page';
import CemeteryCard from './CemeteryCard';
import { createGlobalStyle } from 'styled-components';
import useCashPriceInEstimatedTWAP from '../../hooks/useCashPriceInEstimatedTWAP';

import useBanks from '../../hooks/useBanks';
import useRebateTreasury from "../../hooks/useRebateTreasury"
import useGraveStats from '../../hooks/useGraveStats';

const web3 = new Web3()
const BN = n => new web3.utils.BN(n)

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
}

* {
    border-radius: 0 !important;
}
`;

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%'
  },
}));

const Cemetery = () => {
  const classes = useStyles();
  const [banks] = useBanks();
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const cashStat = useCashPriceInEstimatedTWAP();
  const graveStats = useGraveStats();
  const scalingFactor = useMemo(() => (cashStat ? Number(cashStat.priceInDollars).toFixed(4) : null), [cashStat]);
  const activeBanks = banks.filter((bank) => !bank.finished);

  console.log(cashStat)

  const gravePriceInUSDC = useMemo(() => (graveStats ? Number(graveStats.tokenInUsdc).toFixed(4) : null), [graveStats]);

  const rebateStats = useRebateTreasury()
  console.log(rebateStats)
  const [claimableGRAVE, setClaimableGRAVE] = useState(0);
  const [ vested, setVested ] = useState(0)

  useEffect(() => {
    updateVesting()
    const interval = setInterval(updateVesting, 5000) 
    return () => clearInterval(interval)
  }, [])

  async function updateVesting() {
    if (!window.ethereum) return
    const address = (await window.ethereum.request({ method: "eth_accounts" }))[0]
    if (!address) return

    const claimable = await rebateStats.RebateTreasury.methods.claimableGrave(address).call()
    const vesting = await rebateStats.RebateTreasury.methods.vesting(address).call()
    setClaimableGRAVE(+web3.utils.fromWei(claimable))
    setVested(+web3.utils.fromWei(BN(vesting.amount).sub(BN(vesting.claimed))))
}

  async function claimGrave() {
    console.log("claiming the grave")
    if (!window.ethereum) return
    const address = (await window.ethereum.request({ method: "eth_accounts" }))[0]
    if (!address) return
    window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: address,
        to: rebateStats.RebateTreasury._address,
        data: rebateStats.RebateTreasury.methods.claimRewards().encodeABI()
      }]
    })
  }

  return (
    <Switch>
      <Page>
        <Route exact path={path}>
          <BackgroundImage />
          {!!account ? (
            <>
              <Typography color="textPrimary" align="center" variant="h3" gutterBottom style={{ marginBottom: '40px' }}>
                3DAO - Treasury * Still under Mantance 70% done *
              </Typography>
              <Box mt={2}>
                <Grid container justify="center" spacing={3}>
                  <Grid item xs={12} md={3} lg={3} className={classes.gridItem}>
                    <Card className={classes.gridItem}>
                      <CardContent align="center">
                        <Typography variant="h5">
                          GRAVE Price <small>(TWAP)</small>
                        </Typography>
                        <Typography variant="h6">{gravePriceInUSDC ? gravePriceInUSDC : '-.----'} USDC</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3} lg={3} className={classes.gridItem}>
                    <Card className={classes.gridItem}>
                      <CardContent align="center">
                        <Typography variant="h5">
                          Bond Premium
                        </Typography>
                        <Typography variant="h6">{rebateStats.bondPremium.toFixed(3)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 0).length === 0}>
                  <Typography color="textPrimary" variant="h4" gutterBottom style={{ marginTop: '35px', marginBottom: '30px' }}>
                    Bondable Assets
                  </Typography>
                <Alert variant="filled" severity="warning" style={{ marginBottom: '30px '}}>
                    This page is under active maintenance - We have set the bond Rate to 0 This means you can send money but will get nothing in return.!!!
                </Alert>
                  <Grid container spacing={3}>
                    {activeBanks
                      .filter((bank) => bank.sectionInUI === 3)
                      .map((bank) => (
                        <React.Fragment key={bank.name}>
                          <CemeteryCard bank={bank} />
                        </React.Fragment>
                      ))}
                  </Grid>
              </div>
              <Box mt={2}>
                <Grid container justify="center" spacing={3}>
                  <Grid item xs={12} md={3} lg={3} className={classes.gridItem}>
                    <Card style={{ height: "auto" }}>
                      <CardContent align="center">
                        <Typography variant="h5">
                          GRAVE Vesting
                        </Typography>
                        <Typography variant="h6">{vested.toFixed(4)} Total Vested</Typography>
                        <Typography variant="h6">{claimableGRAVE.toFixed(4)} Claimable</Typography>
                        <Button color="primary" size="small" variant="contained" onClick={claimGrave} style={{ marginTop: "8px" }}>
                          CLAIM
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </>
          ) : (
            <UnlockWallet />
          )}
        </Route>
      </Page>
    </Switch>
  );
};

export default Cemetery;
