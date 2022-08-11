import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { Bank } from '../graveyard-finance';

const useCompound = (bank: Bank) => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(
        graveyardFinance.compound(bank.contract, bank.poolId, bank.sectionInUI),
      `Compound Node rewards`,
    );
  }, [bank, graveyardFinance, handleTransactionReceipt]);

  return { onCompound: handleReward };
};

export default useCompound;
