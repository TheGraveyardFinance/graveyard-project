import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';
import { ContractName } from '../graveyard-finance';
import config from '../config';

const useNodePrice = (poolName: ContractName, poolId: Number, sectionInUI: Number) => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();

  const fetchAmount = useCallback(async () => {
    const balance = sectionInUI === 3 ? await graveyardFinance.getNodePrice(poolName, poolId) : BigNumber.from(0);
    setAmount(balance);
  }, [poolName, poolId, sectionInUI, graveyardFinance]);

  useEffect(() => {
    if (sectionInUI === 3) {
      fetchAmount().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchAmount, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [poolName, setAmount, graveyardFinance, fetchAmount]);

  return amount;
};

export default useNodePrice;
