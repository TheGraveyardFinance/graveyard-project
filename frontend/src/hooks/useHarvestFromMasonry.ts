import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useHarvestFromMasonry = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(graveyardFinance.harvestCashFromMasonry(), 'Claim GRAVE from the Mausoleum ');
  }, [graveyardFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvestFromMasonry;
