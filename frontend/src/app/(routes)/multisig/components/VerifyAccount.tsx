import { useAppDispatch } from '@/custom-hooks/StateHooks';
import useGetChainInfo from '@/custom-hooks/useGetChainInfo';
import { verifyAccount } from '@/store/features/multisig/multisigSlice';
import { COSMOS_CHAIN_ID } from '@/utils/constants';
import React from 'react';

interface VerifyAccountProps {
  chainID: string;
}

const VerifyAccount: React.FC<VerifyAccountProps> = (props) => {
  const { chainID } = props;
  const { getChainInfo } = useGetChainInfo();
  const { cosmosAddress } = getChainInfo(chainID);
  const dispatch = useAppDispatch();
  const handleVerifyAccountEvent = () => {
    dispatch(
      verifyAccount({ chainID: COSMOS_CHAIN_ID, address: cosmosAddress })
    );
  };
  return (
    <div className="verify-account">
      <div className="text-[20px]">
        Please verify your account ownership to proceed.
      </div>
      <button
        className="verify-btn"
        onClick={() => {
          handleVerifyAccountEvent();
        }}
      >
        Verify Ownership
      </button>
    </div>
  );
};

export default VerifyAccount;
