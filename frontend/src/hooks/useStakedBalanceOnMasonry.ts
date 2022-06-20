import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';
import useRefresh from './useRefresh';

const useStakedBalanceOnMasonry = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();
  const isUnlocked = graveyardFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await graveyardFinance.getStakedSharesOnMasonry());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, graveyardFinance]);
  return balance;
};

export default useStakedBalanceOnMasonry;
