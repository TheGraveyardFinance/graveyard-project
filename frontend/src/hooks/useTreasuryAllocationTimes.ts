import { useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import { AllocationTime } from '../tomb-finance/types';
import useRefresh from './useRefresh';


const useTreasuryAllocationTimes = () => {
  const { slowRefresh } = useRefresh();
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const graveyardFinance = useGraveyardFinance();
  useEffect(() => {
    if (graveyardFinance) {
      graveyardFinance.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [graveyardFinance, slowRefresh]);
  return time;
};

export default useTreasuryAllocationTimes;
