import React, { useMemo } from 'react';
import Page from '../../components/Page';
import HomeImage from '../../assets/img/home.png';
import CashImage from '../../assets/img/GRAVE.svg';
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
import useUsdcPrice from '../../hooks/useUsdcPrice';
import { xgrave as xgraveTesting, xShare as xShareTesting } from '../../graveyard-finance/deployments/deployments.testing.json';
import { xgrave as xgraveProd, xShare as xShareProd } from '../../graveyard-finance/deployments/deployments.mainnet.json';

import useTotalTreasuryBalance from '../../hooks/useTotalTreasuryBalance.js';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';

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
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
}));

const Home = () => {
  const classes = useStyles();
  const TVL = useTotalValueLocked();
  const xgraveCousdLpStats = useLpStats('GRAVE-USDC-LP');
  const xShareCousdLpStats = useLpStats('XSHARE-USDC-LP');
  const xgraveStats = useXgraveStats();
  const xShareStats = usexShareStats();
  const xBondStats = useBondStats();
  const graveyardFinance = useGraveyardFinance();
  const { price: usdcPrice, marketCap: usdcMarketCap, priceChange: usdcPriceChange } = useUsdcPrice();
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
  const xgravePriceInUSDC = useMemo(() => (xgraveStats ? Number(xgraveStats.tokenInFtm).toFixed(4) : null), [xgraveStats]);
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
  const xBondPriceInUSDC = useMemo(() => (xBondStats ? Number(xBondStats.tokenInFtm).toFixed(4) : null), [xBondStats]);
  const xBondCirculatingSupply = useMemo(
    () => (xBondStats ? String(xBondStats.circulatingSupply) : null),
    [xBondStats],
  );
  const xBondTotalSupply = useMemo(() => (xBondStats ? String(xBondStats.totalSupply) : null), [xBondStats]);

  const xgraveLpZap = useZap({ depositTokenName: 'GRAVE-USDC-LP' });
  const xshareLpZap = useZap({ depositTokenName: 'XSHARE-USDC-LP' });

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
      tokenName={'GRAVE-USDC-LP'}
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
      tokenName={'XSHARE-USDC-LP'}
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
              <h2>Welcome to Graveyard DeFi</h2>
              <p>A Yield-Farming protocol on the Fantom Opera blockchain, pegged 1:1 to USDC</p>
              <p>Combining only the most stable and effective elements of only the longest-running protocols from every major blockchain, we have developed a whale-proof, dump-proof, auto-burning protocol that we believe will not only keep peg, but stay well above it, forever.</p>
              <p>Our mission is to execute the most reliable, stable and most of all self-sustainable Yield Farming Protocol on Fantom.</p>
              <p>
                Stake your GRAVE-USDC LP in our <StyledLink href="/farms">Farms</StyledLink> to earn XSHARE rewards.
                Then stake your earned xSHARE in the <StyledLink href="/">Mausoleum</StyledLink> to earn more GRAVE.
              </p>
            </Box>
          </Paper>
				</Grid>
        <Grid container justify="center">
            <Box mt={3} style={{ width: '1000px' }}>
            <Alert variant="filled" severity="warning">
                Do your own research before investing. Investing is risky and may result in monetary loss. By using this protocol, you agree that the Graveyard Finance team is not responsible for any financial losses from investing in GRAVE, xGRAVE, xBONDS, LP's or Nodes.
            </Alert>
            </Box>
        </Grid>

        {/* <Grid container spacing={3}>
    <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Alert severity="warning" style={{ backgroundColor: "transparent", border: "1px solid var(--white)" }}>
              <b>
      Please visit our <StyledLink target="_blank" href="https://docs.xgrave.finance">documentation</StyledLink> before purchasing GRAVE or xSHARE!</b>
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
                Buy GRAVE
              </Button>
              <Button variant="contained" target="_blank" href="https://spookyswap.finance/swap?outputCurrency=0x6437adac543583c4b31bf0323a0870430f5cc2e7" style={{ marginRight: '10px' }} className={classes.button}>
                Buy xSHARES
              </Button>
              <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0x83a52eff2e9d112e9b022399a9fd22a9db7d33ae" style={{ marginRight: '10px' }} className={classes.button}>
                GRAVE Chart
              </Button>
              <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0xd352dac95a91afefb112dbbb3463ccfa5ec15b65" className={classes.button}>
                xSHARES Chart
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* GRAVE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>USDC</h2>
              <Box mt={2} style={{ backgroundColor: "transparent !important" }}>
                <CardIcon style={{ backgroundColor: "transparent !important" }}>
                  <TokenSymbol symbol="USDC" style={{ backgroundColor: "transparent !important" }} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>${usdcPrice ? usdcPrice : '-.----'} USD</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${usdcMarketCap} <br />
                Price Change 24h: {usdcPriceChange.toFixed(2)}% <br />
                <br />
                <br />
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* GRAVE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>GRAVE</h2>
              {/* <Button
                onClick={() => {
                  graveyardFinance.watchAssetInMetamask('GRAVE');
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
                  <TokenSymbol symbol="GRAVE" style={{ backgroundColor: "transparent !important" }} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{xgravePriceInUSDC ? xgravePriceInUSDC : '-.----'} USDC</span>
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

        {/* xSHARE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>XSHARES</h2>
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
                <span style={{ fontSize: '30px' }}>{xSharePriceInFTM ? xSharePriceInFTM : '-.----'} USDC</span>
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
              <h2>XBOND</h2>
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
                <span style={{ fontSize: '30px' }}>{xBondPriceInUSDC ? xBondPriceInUSDC : '-.----'} USDC</span>
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
              <h2>GRAVE-USDC Spooky LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="GRAVE-USDC-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" disabled={true} onClick={onPresentXgraveZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {xgraveLPStats?.tokenAmount ? xgraveLPStats?.tokenAmount : '-.--'} GRAVE /{' '}
                  {xgraveLPStats?.usdcAmount ? xgraveLPStats?.usdcAmount : '-.--'} USDC
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
              <h2>XSHARES-USDC Spooky LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XSHARE-USDC-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" onClick={onPresentXshareZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {xshareLPStats?.tokenAmount ? xshareLPStats?.tokenAmount : '-.--'} XSHARE /{' '}
                  {xshareLPStats?.usdcAmount ? xshareLPStats?.usdcAmount : '-.--'} USDC
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
