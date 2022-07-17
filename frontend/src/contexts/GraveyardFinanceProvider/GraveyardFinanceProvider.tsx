import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import GraveyardFinance from '../../graveyard-finance';
import config from '../../config';

export interface GraveyardFinanceContext {
  graveyardFinance?: GraveyardFinance;
}

export const Context = createContext<GraveyardFinanceContext>({ graveyardFinance: null });

export const GraveyardFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [graveyardFinance, setGraveyardFinance] = useState<GraveyardFinance>();

  useEffect(() => {
    if (!graveyardFinance) {
      const grave = new GraveyardFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        grave.unlockWallet(ethereum, account);
      }
      setGraveyardFinance(grave);
    } else if (account) {
      graveyardFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, graveyardFinance]);

  return <Context.Provider value={{ graveyardFinance }}>{children}</Context.Provider>;
};
