import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../tomb-finance/ERC20';
import useGraveyardFinance from './useGraveyardFinance';
import config from '../config';

const useBondsPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    async function fetchBondsPurchasable() {
        try {
            setBalance(await graveyardFinance.getBondsPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchBondsPurchasable();
  }, [setBalance, graveyardFinance]);

  return balance;
};

export default useBondsPurchasable;
