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
import useGraveStats from '../../hooks/useGraveStats';
import useLpStats from '../../hooks/useLpStats';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import usexShareStats from '../../hooks/usexShareStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import useUsdcPrice from '../../hooks/useUsdcPrice';
import { grave as graveTesting, xShare as xShareTesting } from '../../graveyard-finance/deployments/deployments.testing.json';
import { grave as graveProd, xShare as xShareProd } from '../../graveyard-finance/deployments/deployments.mainnet.json';

import useTotalTreasuryBalance from '../../hooks/useTotalTreasuryBalance.js';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';
import Countdown from 'react-countdown';

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
  const graveUsdcLpStats = useLpStats('GRAVE-USDC-LP');
  const xShareUsdcLpStats = useLpStats('XSHARE-USDC-LP');
  const graveStats = useGraveStats();
  const xShareStats = usexShareStats();
  const xBondStats = useBondStats();
  const graveyardFinance = useGraveyardFinance();
  const { price: usdcPrice, marketCap: usdcMarketCap, priceChange: usdcPriceChange } = useUsdcPrice();
  const { balance: rebatesTVL } = useTotalTreasuryBalance();
  const totalTVL = TVL;
  // const totalTVL = TVL + rebatesTVL;

  let grave;
  let xShare;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    grave = graveProd;
    xShare = xShareProd;
  } else {
    grave = graveProd;
    xShare = xShareProd;
  }

  const buyGraveAddress = 'https://spookyswap.finance/swap?outputCurrency=' + grave.address;
  const buyXShareAddress = 'https://spookyswap.finance/swap?outputCurrency=' + xShare.address;

  const graveLPStats = useMemo(() => (graveUsdcLpStats ? graveUsdcLpStats : null), [graveUsdcLpStats]);
  const xshareLPStats = useMemo(() => (xShareUsdcLpStats ? xShareUsdcLpStats : null), [xShareUsdcLpStats]);
  const gravePriceInDollars = useMemo(
    () => (graveStats ? Number(graveStats.priceInDollars).toFixed(2) : null),
    [graveStats],
  );
  const gravePriceInUSDC = useMemo(() => (graveStats ? Number(graveStats.tokenInUsdc).toFixed(4) : null), [graveStats]);
  const graveCirculatingSupply = useMemo(() => (graveStats ? String(graveStats.circulatingSupply) : null), [graveStats]);
  const graveTotalSupply = useMemo(() => (graveStats ? String(graveStats.totalSupply) : null), [graveStats]);

  const xSharePriceInDollars = useMemo(
    () => (xShareStats ? Number(xShareStats.priceInDollars).toFixed(2) : null),
    [xShareStats],
  );
  const xSharePriceInUSDC = useMemo(
    () => (xShareStats ? Number(xShareStats.tokenInUsdc).toFixed(4) : null),
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
  const xBondPriceInUSDC = useMemo(() => (xBondStats ? Number(xBondStats.tokenInUsdc).toFixed(4) : null), [xBondStats]);
  const xBondCirculatingSupply = useMemo(
    () => (xBondStats ? String(xBondStats.circulatingSupply) : null),
    [xBondStats],
  );
  const xBondTotalSupply = useMemo(() => (xBondStats ? String(xBondStats.totalSupply) : null), [xBondStats]);

  const graveLpZap = useZap({ depositTokenName: 'GRAVE-USDC-LP' });
  const xshareLpZap = useZap({ depositTokenName: 'XSHARE-USDC-LP' });

  const StyledLink = styled.a`
    font-weight: 700;
    text-decoration: none;
    color: var(--accent-light);
  `;

  const [onPresentGraveZap, onDissmissGraveZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        graveLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissGraveZap();
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
        <Grid item xs={12} sm={9}>
          <Paper style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <Box p={4}>
              <h2>Welcome to Graveyard Finance</h2>
              <Countdown
                date={1658404800 * 1000} // Thursday, July 21, 2022 12:00:00 PM GMT
                intervalDelay={0}
                precision={3}
                renderer={(props) => (
                  <div>
                    <h3>
                      Revealing in ....
                      {props.days} days {props.hours} hours {props.minutes} mins {props.seconds} seconds
                      <br />
                      Please{' '}
                    <a target="_blank" style={{ color: '#ffffff' }} href="https://twitter.com/GraveyardFi">
                        follow us on Twitter
                      </a>{' '}
                      and{' '}
                      <a target="_blank" style={{ color: '#ffffff' }} href="https://discord.com/invite/8Nmtk8dbra">
                        join our discord community!!{' '}
                      </a>
                    </h3>
                  </div>
                )}
              />
              <p>A Yield-Farming protocol on the Fantom Opera blockchain, pegged 1:1 to USDC</p>
              <p>Combining only the most stable and effective elements of only the longest-running protocols from every major blockchain, we have developed a whale-proof, dump-proof, auto-burning protocol that we believe will not only keep peg, but stay well above it, forever.</p>
              <p>Our mission is to execute the most reliable, stable and most of all self-sustainable Yield Farming Protocol on Fantom.</p>
              <p>
                Stake your GRAVE-USDC LP in our <StyledLink href="/farms">Farms</StyledLink> to earn XSHARE rewards.
                Then stake your earned XSHARE in the <StyledLink href="/boardroom">Mausoleum</StyledLink> to earn more GRAVE.
              </p>
            </Box>
          </Paper>
				</Grid>
        <Grid container justify="center">
            <Box mt={3} style={{ width: '1000px' }}>
            <Alert variant="filled" severity="warning">
                Do your own research before investing. Investing is risky and may result in monetary loss. By using this protocol, you agree that the Graveyard DeFi team is not responsible for any financial losses from investing in GRAVE, XSHARE, XBONDS, LP's or Nodes.
            </Alert>
            </Box>
        </Grid>

        {/* <Grid container spacing={3}>
    <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Alert severity="warning" style={{ backgroundColor: "transparent", border: "1px solid var(--white)" }}>
              <b>
      Please visit our <StyledLink target="_blank" href="https://docs.grave.finance">documentation</StyledLink> before purchasing GRAVE or XSHARE!</b>
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
                href="https://spooky.fi/#/swap?outputCurrency=0x56C68a33e6F20aBC6Bcb46695f1811fE5cbF92Fe"
                variant="contained"
                style={{ marginRight: '10px' }}
                className={classes.button}
              >
                Buy GRAVE
              </Button>
              <Button variant="contained" target="_blank" href="https://spooky.fi/#/swap?outputCurrency=0x93a069E3368ADB428A9AB1AE125667B9780F388c" style={{ marginRight: '10px' }} className={classes.button}>
                Buy XSHARE
              </Button>
              {/* <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0x83a52eff2e9d112e9b022399a9fd22a9db7d33ae" style={{ marginRight: '10px' }} className={classes.button}>
                GRAVE Chart
              </Button>
              <Button variant="contained" target="_blank" href="https://dexscreener.com/fantom/0xd352dac95a91afefb112dbbb3463ccfa5ec15b65" className={classes.button}>
                XSHARE Chart
              </Button> */}
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
                <span style={{ fontSize: '30px' }}>{gravePriceInUSDC ? gravePriceInUSDC : '-.----'} USDC</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px', alignContent: 'flex-start' }}>
                  ${gravePriceInDollars ? gravePriceInDollars : '-.--'}
                </span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(graveCirculatingSupply * gravePriceInDollars).toFixed(2)} <br />
                Circulating Supply: {graveCirculatingSupply} <br />
                Total Supply: {graveTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* XSHARE */}
        <Grid item xs={12} sm={3}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>XSHARE</h2>
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
                <span style={{ fontSize: '30px' }}>{xSharePriceInUSDC ? xSharePriceInUSDC : '-.----'} USDC</span>
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
              {/* <Box mt={2}>
                <Button color="primary" disabled={false} onClick={onPresentGraveZap} variant="contained">
                  Zap In
                </Button>
              </Box> */}
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {graveLPStats?.tokenAmount ? graveLPStats?.tokenAmount : '-.--'} GRAVE /{' '}
                  {graveLPStats?.usdcAmount ? graveLPStats?.usdcAmount : '-.--'} USDC
                </span>
              </Box>
              <Box>${graveLPStats?.priceOfOne ? graveLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${graveLPStats?.totalLiquidity ? graveLPStats.totalLiquidity : '-.--'} <br />
                Total supply: {graveLPStats?.totalSupply ? graveLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ backgroundColor: "transparent", boxShadow: "none", border: "1px solid var(--white)" }}>
            <CardContent align="center">
              <h2>XSHARE-USDC Spooky LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="XSHARE-USDC-LP" />
                </CardIcon>
              </Box>
              {/* <Box mt={2}>
                <Button color="primary" onClick={onPresentXshareZap} variant="contained">
                  Zap In
                </Button>
              </Box> */}
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
