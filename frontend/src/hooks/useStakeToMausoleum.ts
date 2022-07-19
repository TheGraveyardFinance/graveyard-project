import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToMausoleum = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(graveyardFinance.stakeShareToMausoleum(amount), `Stake ${amount} XSHARES to the Mausoleum `);
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToMausoleum;
