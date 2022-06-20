import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import TombFinance from '../../graveyard-finance';
import config from '../../config';

export interface TombFinanceContext {
  graveyardFinance?: TombFinance;
}

export const Context = createContext<TombFinanceContext>({ graveyardFinance: null });

export const TombFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [graveyardFinance, setTombFinance] = useState<TombFinance>();

  useEffect(() => {
    if (!graveyardFinance) {
      const tomb = new TombFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        tomb.unlockWallet(ethereum, account);
      }
      setTombFinance(tomb);
    } else if (account) {
      graveyardFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, graveyardFinance]);

  return <Context.Provider value={{ graveyardFinance }}>{children}</Context.Provider>;
};
