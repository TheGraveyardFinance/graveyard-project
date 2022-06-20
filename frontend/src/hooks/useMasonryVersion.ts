import { useCallback, useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useStakedBalanceOnMasonry from './useStakedBalanceOnMasonry';

const useMasonryVersion = () => {
  const [masonryVersion, setMasonryVersion] = useState('latest');
  const graveyardFinance = useGraveyardFinance();
  const stakedBalance = useStakedBalanceOnMasonry();

  const updateState = useCallback(async () => {
    setMasonryVersion(await graveyardFinance.fetchMasonryVersionOfUser());
  }, [graveyardFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (graveyardFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [graveyardFinance?.isUnlocked, stakedBalance]);

  return masonryVersion;
};

export default useMasonryVersion;
