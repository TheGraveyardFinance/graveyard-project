import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

import Label from '../Label';
import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import useGraveyardFinance from '../../hooks/useGraveyardFinance';
import TokenSymbol from '../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const graveyardFinance = useGraveyardFinance();

  const xgraveBalance = useTokenBalance(graveyardFinance.GRAVE);
  const displayXgraveBalance = useMemo(() => getDisplayBalance(xgraveBalance), [xgraveBalance]);

  const xshareBalance = useTokenBalance(graveyardFinance.XSHARE);
  const displayXshareBalance = useMemo(() => getDisplayBalance(xshareBalance), [xshareBalance]);

  const xbondBalance = useTokenBalance(graveyardFinance.XBOND);
  const displayXbondBalance = useMemo(() => getDisplayBalance(xbondBalance), [xbondBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="GRAVE" />
          <StyledBalance>
            <StyledValue>{displayXgraveBalance}</StyledValue>
            <Label text="GRAVE Available" variant="primary" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="XSHARE" />
          <StyledBalance>
            <StyledValue>{displayXshareBalance}</StyledValue>
            <Label text="XSHARE Available" variant="primary" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="XBOND" />
          <StyledBalance>
            <StyledValue>{displayXbondBalance}</StyledValue>
            <Label text="XBOND Available" variant="primary" />
          </StyledBalance>
        </StyledBalanceWrapper>
      </Balances>
    </Modal>
  );
};

const StyledValue = styled.div`
  //color: ${(props) => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

export default AccountModal;
