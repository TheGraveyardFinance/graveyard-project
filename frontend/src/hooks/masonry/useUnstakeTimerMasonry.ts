import { useEffect, useState } from 'react';
import useGraveyardFinance from './../useGraveyardFinance';
import { AllocationTime } from '../../tomb-finance/types';

const useUnstakeTimerMasonry = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const graveyardFinance = useGraveyardFinance();

  useEffect(() => {
    if (graveyardFinance) {
      graveyardFinance.getUserUnstakeTime().then(setTime);
    }
  }, [graveyardFinance]);
  return time;
};

export default useUnstakeTimerMasonry;
