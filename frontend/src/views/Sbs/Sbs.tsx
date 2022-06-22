import React, { /*useCallback, useEffect, */useMemo, useState } from 'react';
import Page from '../../components/Page';
import PitImage from '../../assets/img/pit.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import { Box,/* Paper, Typography,*/ Button, Grid } from '@material-ui/core';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';
import { getDisplayBalance/*, getBalance*/ } from '../../utils/formatBalance';
import { BigNumber/*, ethers*/ } from 'ethers';
import useSwapXBondToXShare from '../../hooks/XShareSwapper/useSwapXBondToXShare';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import useXShareSwapperStats from '../../hooks/XShareSwapper/useXShareSwapperStats';
import TokenInput from '../../components/TokenInput';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import TokenSymbol from '../../components/TokenSymbol';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${PitImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const Sbs: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const graveyardFinance = useGraveyardFinance();
  const [xbondAmount, setTbondAmount] = useState('');
  const [xshareAmount, setXshareAmount] = useState('');

  const [approveStatus, approve] = useApprove(graveyardFinance.XBOND, graveyardFinance.contracts.XShareSwapper.address);
  const { onSwapXShare } = useSwapXBondToXShare();
  const xshareSwapperStat = useXShareSwapperStats(account);

  const xshareBalance = useMemo(() => (xshareSwapperStat ? Number(xshareSwapperStat.xshareBalance) : 0), [xshareSwapperStat]);
  const bondBalance = useMemo(() => (xshareSwapperStat ? Number(xshareSwapperStat.xbondBalance) : 0), [xshareSwapperStat]);

  const handleXBondChange = async (e: any) => {
    if (e.currentTarget.value === '') {
      setTbondAmount('');
      setXshareAmount('');
      return
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setTbondAmount(e.currentTarget.value);
    const updateXShareAmount = await graveyardFinance.estimateAmountOfXshare(e.currentTarget.value);
    setXshareAmount(updateXShareAmount);  
  };

  const handleXBondSelectMax = async () => {
    setTbondAmount(String(bondBalance));
    const updateXShareAmount = await graveyardFinance.estimateAmountOfXshare(String(bondBalance));
    setXshareAmount(updateXShareAmount); 
  };

  const handleXShareSelectMax = async () => {
    setXshareAmount(String(xshareBalance));
    const rateXSharePerXgrave = (await graveyardFinance.getXShareSwapperStat(account)).rateXSharePerXgrave;
    const updateXBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateXSharePerXgrave))).mul(Number(xshareBalance) * 1e6);
    setTbondAmount(getDisplayBalance(updateXBondAmount, 18, 6));
  };

  const handleXShareChange = async (e: any) => {
    const inputData = e.currentTarget.value;
    if (inputData === '') {
      setXshareAmount('');
      setTbondAmount('');
      return
    }
    if (!isNumeric(inputData)) return;
    setXshareAmount(inputData);
    const rateXSharePerXgrave = (await graveyardFinance.getXShareSwapperStat(account)).rateXSharePerXgrave;
    const updateXBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateXSharePerXgrave))).mul(Number(inputData) * 1e6);
    setTbondAmount(getDisplayBalance(updateXBondAmount, 18, 6));
  }

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="XBond -> XShare Swap" subtitle="Swap XBond to XShare" />
            </Route>
            <Box mt={5}>
              <Grid container justify="center" spacing={6}>
                <StyledBoardroom>
                  <StyledCardsWrapper>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>XBonds</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={graveyardFinance.XBOND.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleXBondSelectMax}
                                onChange={handleXBondChange}
                                value={xbondAmount}
                                max={bondBalance}
                                symbol="XBond"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${bondBalance} XBOND Available in Wallet`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
                    </StyledCardWrapper>
                    <Spacer size="lg"/>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>XShare</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={graveyardFinance.XSHARE.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleXShareSelectMax}
                                onChange={handleXShareChange}
                                value={xshareAmount}
                                max={xshareBalance}
                                symbol="XShare"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${xshareBalance} XSHARE Available in Swapper`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
              
                    </StyledCardWrapper>
                  </StyledCardsWrapper>
                </StyledBoardroom>
              </Grid>
            </Box>

            <Box mt={5}>
              <Grid container justify="center">
                <Grid item xs={8}>
                  <Card>
                    <CardContent>
                      <StyledApproveWrapper>
                      {approveStatus !== ApprovalState.APPROVED ? (
                        <Button
                          disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                          color="primary"
                          variant="contained"
                          onClick={approve}
                          size="medium"
                        >
                          Approve XBOND
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSwapXShare(xbondAmount.toString())}
                          size="medium"
                        >
                          Swap
                        </Button>
                      )}
                      </StyledApproveWrapper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledApproveWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;
const StyledCardTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  font-weight: 700;
  height: 64px;
  justify-content: center;
  margin-top: ${(props) => -props.theme.spacing[3]}px;
`;

const StyledCardIcon = styled.div`
  background-color: ${(props) => props.theme.color.grey[900]};
  width: 72px;
  height: 72px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledExchanger = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
`;

const StyledToken = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledDesc = styled.span``;

export default Sbs;
