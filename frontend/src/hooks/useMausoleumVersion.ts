import { useCallback, useEffect, useState } from 'react';
import useGraveyardFinance from './useGraveyardFinance';
import useStakedBalanceOnMausoleum from './useStakedBalanceOnMausoleum';

const useMausoleumVersion = () => {
  const [masonryVersion, setMausoleumVersion] = useState('latest');
  const graveyardFinance = useGraveyardFinance();
  const stakedBalance = useStakedBalanceOnMausoleum();

  const updateState = useCallback(async () => {
    setMausoleumVersion(await graveyardFinance.fetchMausoleumVersionOfUser());
  }, [graveyardFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (graveyardFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [graveyardFinance?.isUnlocked, stakedBalance]);

  return masonryVersion;
};

export default useMausoleumVersion;
