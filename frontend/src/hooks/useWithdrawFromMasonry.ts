import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useWithdrawFromMasonry = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        graveyardFinance.withdrawShareFromMasonry(amount),
        `Withdraw ${amount} xSHARES from the Mausoleum `,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdrawFromMasonry;
