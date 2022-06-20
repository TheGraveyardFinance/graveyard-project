import { useCallback } from 'react';
import useTombFinance from './useTombFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideTombFtmLP = () => {
  const tombFinance = useTombFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideTombFtmLP = useCallback(
    (cousdAmount: string, tombAmount: string) => {
      const tombAmountBn = parseUnits(tombAmount);
      handleTransactionReceipt(
        tombFinance.provideTombFtmLP(cousdAmount, tombAmountBn),
        `Provide Tomb-FTM LP ${tombAmount} ${cousdAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [tombFinance, handleTransactionReceipt],
  );
  return { onProvideTombFtmLP: handleProvideTombFtmLP };
};

export default useProvideTombFtmLP;
