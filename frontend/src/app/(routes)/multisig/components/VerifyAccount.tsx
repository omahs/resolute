import TopNav from '@/components/TopNav';
import { useAppDispatch } from '@/custom-hooks/StateHooks';
import useGetChainInfo from '@/custom-hooks/useGetChainInfo';
import { verifyAccount } from '@/store/features/multisig/multisigSlice';
import { COSMOS_CHAIN_ID } from '@/utils/constants';
import Image from 'next/image';
import React from 'react';

interface VerifyAccountProps {
  chainID: string;
}

const VerifyAccount: React.FC<VerifyAccountProps> = (props) => {
  const { chainID } = props;
  const dispatch = useAppDispatch();
  const { getChainInfo } = useGetChainInfo();
  const { cosmosAddress } = getChainInfo(chainID);
  const handleVerifyAccountEvent = () => {
    dispatch(verifyAccount({ chainID: COSMOS_CHAIN_ID, address: cosmosAddress }));
  };
  return (
    <div className="verify-account relative">
      <div className="w-fit absolute top-6 right-6">
        <TopNav />
      </div>
      <Image
        src="/verify-illustration.png"
        height={290}
        width={400}
        alt="Verify Ownership"
      />
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
