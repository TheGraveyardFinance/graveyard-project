import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { Bank } from '../graveyard-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useZap = (bank: Bank) => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleZap = useCallback(
    (zappingToken: string, tokenName: string, amount: string) => {
      handleTransactionReceipt(
        graveyardFinance.zapIn(zappingToken, tokenName, amount),
        `Zap ${amount} in ${bank.depositTokenName}.`,
      );
    },
    [bank, graveyardFinance, handleTransactionReceipt],
  );
  return { onZap: handleZap };
};

export default useZap;
