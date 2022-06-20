import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideTombFtmLP = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideTombFtmLP = useCallback(
    (cousdAmount: string, tombAmount: string) => {
      const tombAmountBn = parseUnits(tombAmount);
      handleTransactionReceipt(
        graveyardFinance.provideTombFtmLP(cousdAmount, tombAmountBn),
        `Provide Tomb-FTM LP ${tombAmount} ${cousdAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onProvideTombFtmLP: handleProvideTombFtmLP };
};

export default useProvideTombFtmLP;
