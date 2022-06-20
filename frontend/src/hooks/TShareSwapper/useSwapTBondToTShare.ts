import { useCallback } from 'react';
import useGraveyardFinance from '../useGraveyardFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapTBondToTShare = () => {
  const graveyardFinance = useGraveyardFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapTShare = useCallback(
  	(tbondAmount: string) => {
	  	const tbondAmountBn = parseUnits(tbondAmount, 18);
	  	handleTransactionReceipt(
	  		graveyardFinance.swapTBondToTShare(tbondAmountBn),
	  		`Swap ${tbondAmount} TBond to TShare`
	  	);
  	},
  	[graveyardFinance, handleTransactionReceipt]
  );
  return { onSwapTShare: handleSwapTShare };
};

export default useSwapTBondToTShare;
