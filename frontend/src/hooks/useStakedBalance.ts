import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';
import { ContractName } from '../graveyard-finance';
import config from '../config';

const useStakedBalance = (poolName: ContractName, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();
  const isUnlocked = graveyardFinance?.isUnlocked;

  console.log("@@@3.1", poolName);
  console.log("@@@3.2", poolId);
  console.log("@@@3.3", graveyardFinance.myAccount);

  const fetchBalance = useCallback(async () => {
    const balance = await graveyardFinance.stakedBalanceOnBank(poolName, poolId, graveyardFinance.myAccount);
    setBalance(balance);
  }, [poolName, poolId, graveyardFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, setBalance, graveyardFinance, fetchBalance]);
  

  return balance;
};

export default useStakedBalance;
