import React, {useMemo} from 'react';
import {Button, Card, CardContent, Grid, Paper, Typography} from '@material-ui/core';
import TokenSymbol from '../TokenSymbol';
import {getDisplayBalance} from '../../utils/formatBalance';
import useStatsForPool from '../../hooks/useStatsForPool';
import useEarnings from '../../hooks/useEarnings';
import usegraveStats from '../../hooks/useGraveStats';
import {Bank} from '../../graveyard-finance';
import {useGetMultiplierForNode} from '../../utils/constants';
import {Link} from 'react-router-dom';
import { useWallet } from '@librafinance-xyz/use-wallet';
import useNodes from '../../hooks/useNodes';
import {PoolStats} from '../../graveyard-finance/types';

interface NodeCardContentProps {
  bank: Bank;
  statsOnPool: PoolStats;
}

const NodeCardContent: React.FC<NodeCardContentProps> = ({bank, statsOnPool}) => {
  const {account} = useWallet();
  const nodes = useNodes(bank?.contract, bank?.sectionInUI, account);
  const nodeCount = nodes[0];
  const ticketRewards = useGetMultiplierForNode(bank.earnTokenName);
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  const graveStats = usegraveStats();

  let tokenStats: any = 0;
  if (bank.earnTokenName === 'GRAVE') {
    tokenStats = graveStats;
  } 

  const tokenPriceInDollars = useMemo(
    () => (tokenStats ? Number(tokenStats.priceInDollars).toFixed(2) : null),
    [tokenStats],
  );
  const tokenPriceInDollarsLP = useMemo(
    () => (tokenStats ? Number(tokenStats.priceOfOne).toFixed(2) : null),
    [tokenStats],
  );
  const earnedInToken = Number(getDisplayBalance(earnings));
  const earnedInDollars = (Number(tokenPriceInDollars) * earnedInToken).toFixed(2);
  const earnedInDollarsLP = (Number(tokenPriceInDollarsLP) * Number(getDisplayBalance(earnings))).toFixed(2);

  return (
    <Grid container direction="column" spacing={1}>
      {Number(nodeCount) > 0 && (
        <>
          <Grid item style={{marginTop: 15}}>
            <h5 style={{padding: 0, margin: 0}}>Your stats</h5>
          </Grid>
          <Grid item>
            <Grid container justify-content="space-between">
              <Grid item>
                <span className="card-info-text">Your Nodes / Airdrop Tickets</span>
              </Grid>
              <Grid item>
                <b className={'card-info-value'}>
                  {' '}
                  {nodeCount ? `${Number(nodeCount)} / ${Number(nodeCount) * ticketRewards}` : null}
                </b>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
      {Number(nodeCount) === 0 && (
        <>
          <Grid item>
            <Grid container justify-content="space-between">
              <Grid item>
                <span className="card-info-text">Airdrop Tickets</span>
              </Grid>
              <Grid item>
                <b className={'card-info-value'}>{ticketRewards} per Node</b>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      {Number(nodeCount) > 0 && (
        <>
          <Grid item>
            <Grid container justify-content="space-between">
              <Grid item>
                <span className="card-info-text">Earned</span>
              </Grid>
              <Grid item>
                <b className={'card-info-value'}>{`${earnedInToken} ${bank.earnTokenName}`}</b>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justify-content="space-between">
              <Grid item>
                <span className="card-info-text">Earned $</span>
              </Grid>
              {/* <Grid item>
                <b className={'card-info-value'}>{`≈$${
                  bank.earnTokenName === 'GRAPE-MIM-SW' || bank.earnTokenName === 'GRAPE-WLRS-LP'
                    ? Number(earnedInDollarsLP).toLocaleString('en-US')
                    : Number(earnedInDollars).toLocaleString('en-US')
                }`}</b>
              </Grid> */}
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default NodeCardContent;
