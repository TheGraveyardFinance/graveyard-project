import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useGraveyardFinance from './useGraveyardFinance';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    if (graveyardFinance) {
      const { Treasury } = graveyardFinance.contracts;
      graveyardFinance.GRAVE.balanceOf(Treasury.address).then(setAmount);
    }
  }, [graveyardFinance]);
  return amount;
};

export default useTreasuryAmount;
