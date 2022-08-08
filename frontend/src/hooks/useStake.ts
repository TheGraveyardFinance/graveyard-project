import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { Bank } from '../graveyard-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import {BigNumber} from 'ethers';

const useStake = (bank: Bank) => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
        const amountBn = bank.sectionInUI !== 3 
        ? parseUnits(amount, bank.depositToken.decimal)
        : BigNumber.from(amount);
        handleTransactionReceipt(
          graveyardFinance.stake(bank.contract, bank.poolId, bank.sectionInUI, amountBn),
          `Stake ${amount} ${bank.depositTokenName} to ${bank.contract}`,
      );
    },
    [bank, graveyardFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStake;
