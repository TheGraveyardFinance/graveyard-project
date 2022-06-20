import { useCallback } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvideXgraveFtmLP = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideXgraveFtmLP = useCallback(
    (cousdAmount: string, xgraveAmount: string) => {
      const xgraveAmountBn = parseUnits(xgraveAmount);
      handleTransactionReceipt(
        graveyardFinance.provideXgraveFtmLP(cousdAmount, xgraveAmountBn),
        `Provide Xgrave-FTM LP ${xgraveAmount} ${cousdAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [graveyardFinance, handleTransactionReceipt],
  );
  return { onProvideXgraveFtmLP: handleProvideXgraveFtmLP };
};

export default useProvideXgraveFtmLP;
