import React, { useMemo, useState } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import HomeImage from '../../assets/img/home.png';
import useLpStats from '../../hooks/useLpStats';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import useXgraveStats from '../../hooks/useXgraveStats';
import TokenInput from '../../components/TokenInput';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';
import { useWallet } from 'use-wallet';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useApproveTaxOffice from '../../hooks/useApproveTaxOffice';
import { ApprovalState } from '../../hooks/useApprove';
import useProvideXgraveFtmLP from '../../hooks/useProvideXgraveFtmLP';
import { Alert } from '@material-ui/lab';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const ProvideLiquidity = () => {
  const [xgraveAmount, setXgraveAmount] = useState(0);
  const [usdcAmount, setFtmAmount] = useState(0);
  const [lpTokensAmount, setLpTokensAmount] = useState(0);
  const { balance } = useWallet();
  const xgraveStats = useXgraveStats();
  const graveyardFinance = useGraveyardFinance();
  const [approveTaxOfficeStatus, approveTaxOffice] = useApproveTaxOffice();
  const xgraveBalance = useTokenBalance(graveyardFinance.GRAVE);
  const ftmBalance = (balance / 1e18).toFixed(4);
  const { onProvideXgraveFtmLP } = useProvideXgraveFtmLP();
  const xgraveCousdLpStats = useLpStats('GRAVE-USDC-LP');

  const xgraveLPStats = useMemo(() => (xgraveCousdLpStats ? xgraveCousdLpStats : null), [xgraveCousdLpStats]);
  const xgravePriceInUSDC = useMemo(() => (xgraveStats ? Number(xgraveStats.tokenInFtm).toFixed(2) : null), [xgraveStats]);
  const usdcPriceInGRAVE = useMemo(() => (xgraveStats ? Number(1 / xgraveStats.tokenInFtm).toFixed(2) : null), [xgraveStats]);
  // const classes = useStyles();

  const handleXgraveChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setXgraveAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setXgraveAmount(e.currentTarget.value);
    const quoteFromSpooky = await graveyardFinance.quoteFromSpooky(e.currentTarget.value, 'GRAVE');
    setFtmAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / xgraveLPStats.usdcAmount);
  };

  const handleFtmChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setFtmAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setFtmAmount(e.currentTarget.value);
    const quoteFromSpooky = await graveyardFinance.quoteFromSpooky(e.currentTarget.value, 'FTM');
    setXgraveAmount(quoteFromSpooky);

    setLpTokensAmount(quoteFromSpooky / xgraveLPStats.tokenAmount);
  };
  const handleXgraveSelectMax = async () => {
    const quoteFromSpooky = await graveyardFinance.quoteFromSpooky(getDisplayBalance(xgraveBalance), 'GRAVE');
    setXgraveAmount(getDisplayBalance(xgraveBalance));
    setFtmAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / xgraveLPStats.usdcAmount);
  };
  const handleFtmSelectMax = async () => {
    const quoteFromSpooky = await graveyardFinance.quoteFromSpooky(ftmBalance, 'FTM');
    setFtmAmount(ftmBalance);
    setXgraveAmount(quoteFromSpooky);
    setLpTokensAmount(ftmBalance / xgraveLPStats.usdcAmount);
  };
  return (
    <Page>
      <BackgroundImage />
      <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
        Provide Liquidity
      </Typography>

      <Grid container justify="center">
        <Box style={{ width: '600px' }}>
          <Alert variant="filled" severity="warning" style={{ marginBottom: '10px' }}>
            <b>This and <a href="https://spookyswap.finance/"  rel="noopener noreferrer" target="_blank">Spookyswap</a> are the only ways to provide Liquidity on GRAVE-FTM pair without paying tax.</b>
          </Alert>
          <Grid item xs={12} sm={12}>
            <Paper>
              <Box mt={4}>
                <Grid item xs={12} sm={12} style={{ borderRadius: 15 }}>
                  <Box p={4}>
                    <Grid container>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleXgraveSelectMax}
                          onChange={handleXgraveChange}
                          value={xgraveAmount}
                          max={getDisplayBalance(xgraveBalance)}
                          symbol={'GRAVE'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleFtmSelectMax}
                          onChange={handleFtmChange}
                          value={usdcAmount}
                          max={ftmBalance}
                          symbol={'FTM'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <p>1 GRAVE = {xgravePriceInUSDC} FTM</p>
                        <p>1 FTM = {usdcPriceInGRAVE} GRAVE</p>
                        <p>LP tokens ≈ {lpTokensAmount.toFixed(2)}</p>
                      </Grid>
                      <Grid xs={12} justifyContent="center" style={{ textAlign: 'center' }}>
                        {approveTaxOfficeStatus === ApprovalState.APPROVED ? (
                          <Button
                            variant="contained"
                            onClick={() => onProvideXgraveFtmLP(usdcAmount.toString(), xgraveAmount.toString())}
                            color="primary"
                            style={{ margin: '0 10px', color: '#fff' }}
                          >
                            Supply
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => approveTaxOffice()}
                            color="secondary"
                            style={{ margin: '0 10px' }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </Grid>
    </Page>
  );
};

export default ProvideLiquidity;
