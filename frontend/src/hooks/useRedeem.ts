import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { Bank } from '../tomb-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(graveyardFinance.exit(bank.contract, bank.poolId), `Redeem ${bank.contract}`);
  }, [bank, graveyardFinance, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
