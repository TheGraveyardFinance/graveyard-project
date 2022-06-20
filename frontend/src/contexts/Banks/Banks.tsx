import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';
import { Bank } from '../../graveyard-finance';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const graveyardFinance = useGraveyardFinance();
  const isUnlocked = graveyardFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!graveyardFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await graveyardFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          graveyardFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: graveyardFinance.externalTokens[bankInfo.depositTokenName],
        earnToken: bankInfo.earnTokenName === 'TOMB' ? graveyardFinance.TOMB : graveyardFinance.TSHARE,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [graveyardFinance, setBanks]);

  useEffect(() => {
    if (graveyardFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, graveyardFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
