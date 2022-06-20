import React, { useMemo } from 'react';
import Page from '../../components/Page';
import HomeImage from '../../assets/img/home.png';
import CashImage from '../../assets/img/xGRAVE.svg';
import Image from 'material-ui-image';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import { createGlobalStyle } from 'styled-components';
import CountUp from 'react-countup';
import CardIcon from '../../components/CardIcon';
import TokenSymbol from '../../components/TokenSymbol';
import useXgraveStats from '../../hooks/useXgraveStats';
import useLpStats from '../../hooks/useLpStats';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import usexShareStats from '../../hooks/usexShareStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import useCousdPrice from '../../hooks/useCousdPrice';
import { xgrave as xgraveTesting, xShare as xShareTesting } from '../../graveyard-finance/deployments/deployments.testing.json';
import { xgrave as xgraveProd, xShare as xShareProd } from '../../graveyard-finance/deployments/deployments.mainnet.json';

import useTotalTreasuryBalance from '../../hooks/useTotalTreasuryBalance.js';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';

const BackgroundImage = createGlobalStyle`
  body {
    background-color: var(--black);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='32' viewBox='0 0 16 32'%3E%3Cg fill='%231D1E1F' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M0 24h4v2H0v-2zm0 4h6v2H0v-2zm0-8h2v2H0v-2zM0 0h4v2H0V0zm0 4h2v2H0V4zm16 20h-6v2h6v-2zm0 4H8v2h8v-2zm0-8h-4v2h4v-2zm0-20h-6v2h6V0zm0 4h-4v2h4V4zm-2 12h2v2h-2v-2zm0-8h2v2h-2V8zM2 8h10v2H2V8zm0 8h10v2H2v-2zm-2-4h14v2H0v-2zm4-8h6v2H4V4zm0 16h6v2H4v-2zM6 0h2v2H6V0zm0 24h2v2H6v-2z'/%3E%3C/g%3E%3C/svg%3E");
}

* {
    border-radius: 0 !important;
}
`;

const useStyles = makeStyles((theme) => ({
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
}));

const Home = () => {
  const classes = useStyles();
  const TVL = useTotalValueLocked();
  const xgraveCousdLpStats = useLpStats('XGRAVE-COUSD-LP');
  const xShareCousdLpStats = useLpStats('XSHARE-COUSD-LP');
  const xgraveStats = useXgraveStats();
  const xShareStats = usexShareStats();
  const xBondStats = useBondStats();
  const graveyardFinance = useGraveyardFinance();
  const { price: cousdPrice, marketCap: cousdMarketCap, priceChange: cousdPriceChange } = useCousdPrice();
  const { balance: rebatesTVL } = useTotalTreasuryBalance();
  const totalTVL = TVL + rebatesTVL;

  let xgrave;
  let xShare;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    xgrave = xgraveTesting;
    xShare = xShareTesting;
  } else {
    xgrave = xgraveProd;
    xShare = xShareProd;
  }

  const buyXgraveAddress = 'https://spookyswap.finance/swap?outputCurrency=' + xgrave.address;
  const buyXShareAddress = 'https://spookyswap.finance/swap?outputCurrency=' + xShare.address;

  const xgraveLPStats = useMemo(() => (xgraveCousdLpStats ? xgraveCousdLpStats : null), [xgraveCousdLpStats]);
  const xshareLPStats = useMemo(() => (xShareCousdLpStats ? xShareCousdLpStats : null), [xShareCousdLpStats]);
  const xgravePriceInDollars = useMemo(
    () => (xgraveStats ? Number(xgraveStats.priceInDollars).toFixed(2) : null),
    [xgraveStats],
  );
  const xgravePriceInCoUSD = useMemo(() => (xgraveStats ? Number(xgraveStats.tokenInFtm).toFixed(4) : null), [xgraveStats]);
  const xgraveCirculatingSupply = useMemo(() => (xgraveStats ? String(xgraveStats.circulatingSupply) : null), [xgraveStats]);
  const xgraveTotalSupply = useMemo(() => (xgraveStats ? String(xgraveStats.totalSupply) : null), [xgraveStats]);

  const xSharePriceInDollars = useMemo(
    () => (xShareStats ? Number(xShareStats.priceInDollars).toFixed(2) : null),
    [xShareStats],
  );
  const xSharePriceInFTM = useMemo(
    () => (xShareStats ? Number(xShareStats.tokenInFtm).toFixed(4) : null),
    [xShareStats],
  );
  const xShareCirculatingSupply = useMemo(
    () => (xShareStats ? String(xShareStats.circulatingSupply) : null),
    [xShareStats],
  );
  const xShareTotalSupply = useMemo(() => (xShareStats ? String(xShareStats.totalSupply) : null), [xShareStats]);

  const xBondPriceInDollars = useMemo(
    () => (xBondStats ? Number(xBondStats.priceInDollars).toFixed(2) : null),
    [xBondStats],
  );
  const xBondPriceInCoUSD = useMemo(() => (xBondStats ? Number(xBondStats.tokenInFtm).toFixed(4) : null), [xBondStats]);
  const xBondCirculatingSupply = useMemo(
    () => (xBondStats ? String(xBondStats.circulatingSupply) : null),
    [xBondStats],
  );
  const xBondTotalSupply = useMemo(() => (xBondStats ? String(xBondStats.totalSupply) : null), [xBondStats]);

  const xgraveLpZap = useZap({ depositTokenName: 'XGRAVE-COUSD-LP' });
  const xshareLpZap = useZap({ depositTokenName: 'XSHARE-COUSD-LP' });

  const StyledLink = styled.a`
    font-weight: 700;
    text-decoration: none;
    color: var(--accent-light);
  `;

  const [onPresentXgraveZap, onDissmissXgraveZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        xgraveLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissXgraveZap();
      }}
      tokenName={'XGRAVE-COUSD-LP'}
    />,
  );

  const [onPresentXshareZap, onDissmissXshareZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        xshareLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissXshareZap();
      }}
      tokenName={'XSHARE-COUSD-LP'}
    />,
  );

  return (
    <Page>
      <BackgroundImage />
      <Grid container spacing={3}>
        {/* Logo */}
        <Grid container item xs={12} sm={3} justify="center">
          {/* <Paper>xs=6 sm=3</Paper> */}
		      <Image className="ombImg-home" color="none" style={{ width: '300px', paddingTop: '0px' }} src={CashImage} />
        </Grid>
        {/* Explanation text */}
        <Grid item xs={12} sm={6}>
          <Paper style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <Box p={4}>
              <h2>Welcome to Graveyard Finance!</h2>
              <p>An algorithmic stablecoin on the Fantom Opera blockchain, pegged to the price of 1 CoUSD</p>
              <p>xGRAVE utilizes multiple bonding mechanisms at the <StyledLink href="/">3DAO</StyledLink> as well as seigniorage.</p>
              <p>Built on top of <StyledLink target="_blank" href="https://2omb.finance">2omb.finance</StyledLink>.</p>
              <p>
                Stake your xGRAVE-CoUSD LP in the <StyledLink href="/farms">Farms</StyledLink> to earn xSHARES rewards.
                Then stake your earned xSHARES in the <StyledLink href="/">Mausoleum</StyledLink> to maximize profits!
              </p>
            </Box>
          </Paper>
				</Grid>
        <Grid container justify="center">
            <Box mt={3} style={{ width: '1000px' }}>
            <Alert variant="filled" severity="warning">
                Do your own research before investing. Investing is risky and may result in monetary loss. xGRAVE is beta software and may contain bugs. By using xGRAVE, you agree that the 2omb and xGRAVE team is not responsible for any financial losses from investing in 2omb or xGRAVE.
            </Alert>
            </Box>
        </Grid>

        {/* <Grid container spacing={3}>
    <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Alert severity="warning" style={{ backgroundColor: "transparent", border: "1px solid var(--white)" }}>
              <b>
      Please visit our <StyledLink target="_blank" href="https://docs.xgrave.finance">documentation</StyledLink> before purchasing XGRAVE or XSHARE!</b>
            </Alert>
        </Grid>
        </Grid> */}

        {/* TVL */}
        <Grid item xs={12} sm={4}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center">
              <h2>Total Value Locked</h2>
              <CountUp style={{ fontSize: '25px' }} end={totalTVL} separator="," prefix="$" />
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet */}
        <Grid item xs={12} sm={8}>
          <Card style={{ height: '100%', backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <CardContent align="center">
              {/* <h2 style={{ marginBottom: '20px' }}>Wallet Balance</h2> */}
              <Button color="primary" href="/farms" variant="contained" style={{ marginRight: '10px' }}>
                Farms
              </Button>
              <Button color="primary" href="/boardroom" variant="contained" style={{ marginRight: '25px' }}>
                Stake
              </Button>
              {/* <Button color="primary" href="/masonry" variant="contained" style={{ marginRight: '10px' }}>
                Stake Now
              </Button> */}
              {/* <Button href="/cemetery" variant="contained" style={{ marginRight: '10px' }}>
                Farm Now
              </Button> */}
              <Button
                target="_blank"
                href="https://spookyswap.finance/swap?outputCurrency=0x14def7584a6c52f470ca4f4b9671056b22f4ffde"
                variant="contained"
                style={{ marginRight: '10px' }}
                className={classes.button}
              >
                Buy xGRAVE
              </Button>
              <Button variant="contained" target="_blank" href="https://spookyswap.finance/swap?outputCurrency=0x6437adac543583c4b31bf0323a0870430f5cc2e7" style={{ marginRight: '10px' }} className={classes.button}>
                Buy xSHARES
              </Button>
              <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0x83a52eff2e9d112e9b022399a9fd22a9db7d33ae" style={{ marginRight: '10px' }} className={classes.button}>
                xGRAVE Chart
              </Button>
              <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0xd352dac95a91afefb112dbbb3463ccfa5ec15b65" className={classes.button}>
                xSHARES Chart
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* XGRAVE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>CoUSD</h2>
              <Box mt={2} style={{ backgroundColor: "transparent !important" }}>
                <CardIcon style={{ backgroundColor: "transparent !important" }}>
                  <TokenSymbol symbol="CoUSD" style={{ backgroundColor: "transparent !important" }} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>${cousdPrice ? cousdPrice : '-.----'} USD</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${cousdMarketCap} <br />
                Price Change 24h: {cousdPriceChange.toFixed(2)}% <br />
                <br />
                <br />
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* XGRAVE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>xGRAVE</h2>
              {/* <Button
                onClick={() => {
                  graveyardFinance.watchAssetInMetamask('XGRAVE');
                }}
                color="secondary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px', borderColor: "var(--accent-light)" }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button> */}
              <Box mt={2} style={{ backgroundColor: "transparent !important" }}>
                <CardIcon style={{ backgroundColor: "transparent !important" }}>
                  <TokenSymbol symbol="XGRAVE" style={{ backgroundColor: "transparent !important" }} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{xgravePriceInCoUSD ? xgravePriceInCoUSD : '-.----'} CoUSD</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px', alignContent: 'flex-start' }}>
                  ${xgravePriceInDollars ? xgravePriceInDollars : '-.--'}
                </span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(xgraveCirculatingSupply * xgravePriceInDollars).toFixed(2)} <br />
                Circulating Supply: {xgraveCirculatingSupply} <br />
                Total Supply: {xgraveTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* XSHARE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>xSHARES</h2>
              {/* <Button
                onClick={() => {
                  graveyardFinance.watchAssetInMetamask('XSHARE');
                }}
                color="secondary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px', borderColor: "var(--accent-light)" }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button> */}
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XSHARE" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{xSharePriceInFTM ? xSharePriceInFTM : '-.----'} CoUSD</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${xSharePriceInDollars ? xSharePriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(xShareCirculatingSupply * xSharePriceInDollars).toFixed(2)} <br />
                Circulating Supply: {xShareCirculatingSupply} <br />
                Total Supply: {xShareTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* XBOND */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>xBOND</h2>
              {/* <Button
                onClick={() => {
                  graveyardFinance.watchAssetInMetamask('XBOND');
                }}
                color="secondary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px', borderColor: "var(--accent-light)" }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button> */}
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XBOND" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{xBondPriceInCoUSD ? xBondPriceInCoUSD : '-.----'} CoUSD</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${xBondPriceInDollars ? xBondPriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(xBondCirculatingSupply * xBondPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {xBondCirculatingSupply} <br />
                Total Supply: {xBondTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center">
              <h2>xGRAVE-CoUSD Spooky LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XGRAVE-COUSD-LP" />
                </CardIcon>
              </Box>
              {/*
              <Box mt={2}>
                <Button color="primary" disabled={true} onClick={onPresentXgraveZap} variant="contained">
                  Zap In
                </Button>
              </Box>*/}
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {xgraveLPStats?.tokenAmount ? xgraveLPStats?.tokenAmount : '-.--'} xGRAVE /{' '}
                  {xgraveLPStats?.cousdAmount ? xgraveLPStats?.cousdAmount : '-.--'} CoUSD
                </span>
              </Box>
              <Box>${xgraveLPStats?.priceOfOne ? xgraveLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${xgraveLPStats?.totalLiquidity ? xgraveLPStats.totalLiquidity : '-.--'} <br />
                Total supply: {xgraveLPStats?.totalSupply ? xgraveLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center">
              <h2>xSHARES-CoUSD Spooky LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XSHARE-COUSD-LP" />
                </CardIcon>
              </Box>
              {/*<Box mt={2}>
                <Button color="primary" onClick={onPresentXshareZap} variant="contained">
                  Zap In
                </Button>
            </Box>*/}
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {xshareLPStats?.tokenAmount ? xshareLPStats?.tokenAmount : '-.--'} xSHARE /{' '}
                  {xshareLPStats?.cousdAmount ? xshareLPStats?.cousdAmount : '-.--'} CoUSD
                </span>
              </Box>
              <Box>${xshareLPStats?.priceOfOne ? xshareLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${xshareLPStats?.totalLiquidity ? xshareLPStats.totalLiquidity : '-.--'}
                <br />
                Total supply: {xshareLPStats?.totalSupply ? xshareLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default Home;
