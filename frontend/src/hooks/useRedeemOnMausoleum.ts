import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnMausoleum = (description?: string) => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem XSHARES from Mausoleum ';
    handleTransactionReceipt(graveyardFinance.exitFromMausoleum(), alertDesc);
  }, [graveyardFinance, description, handleTransactionReceipt]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnMausoleum;
