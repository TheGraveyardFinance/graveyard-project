import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';
import { ContractName } from '../graveyard-finance';
import config from '../config';

const useEarnings = (poolName: ContractName, earnTokenName: String, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();
  const isUnlocked = graveyardFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await graveyardFinance.earnedFromBank(poolName, earnTokenName, poolId, graveyardFinance.myAccount);
    setBalance(balance);
  }, [poolName, earnTokenName, poolId, graveyardFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, graveyardFinance, fetchBalance]);

  return balance;
};

export default useEarnings;
