import React, { useEffect, useState } from 'react';
import AllMultisigs from './AllMultisigs';
import MultisigSidebar from './MultisigSidebar';
import useGetChainInfo from '@/custom-hooks/useGetChainInfo';
import { useAppDispatch, useAppSelector } from '@/custom-hooks/StateHooks';
import { RootState } from '@/store/store';
import {
  getMultisigAccounts,
  resetDeleteMultisigRes,
  resetVerifyAccountRes,
} from '@/store/features/multisig/multisigSlice';
import { setAuthToken } from '@/utils/localStorage';
import { resetError, setError } from '@/store/features/common/commonSlice';
import VerifyAccount from './VerifyAccount';
import { isVerified } from '@/utils/util';

const PageMultisig = ({ chainName }: { chainName: string }) => {
  const dispatch = useAppDispatch();
  const [verified, setVerified] = useState(false);
  const nameToChainIDs = useAppSelector(
    (state: RootState) => state.wallet.nameToChainIDs
  );
  const verifyAccountRes = useAppSelector(
    (state) => state.multisig.verifyAccountRes
  );
  const multisigAccounts = useAppSelector(
    (state: RootState) => state.multisig.multisigAccounts
  );
  const chainID = nameToChainIDs[chainName];

  const { getChainInfo } = useGetChainInfo();
  const { address, cosmosAddress } = getChainInfo(chainID);

  useEffect(() => {
    if (verifyAccountRes.status === 'idle') {
      setAuthToken({
        address: cosmosAddress,
        signature: verifyAccountRes.token,
      });
      setVerified(true);
      dispatch(resetVerifyAccountRes());
    } else if (verifyAccountRes.status === 'rejected') {
      dispatch(
        setError({
          type: 'error',
          message: verifyAccountRes.error,
        })
      );
    }
  }, [verifyAccountRes]);

  useEffect(() => {
    if (isVerified({ address: cosmosAddress })) {
      setVerified(true);
    } else {
      setVerified(false);
    }
  }, [address, chainID]);

  useEffect(() => {
    dispatch(resetError());
    dispatch(resetDeleteMultisigRes());
  }, []);

  useEffect(() => {
    if (address) dispatch(getMultisigAccounts(address));
  }, []);

  return (
    <div className="flex gap-10">
      {verified ? (
        <>
          <AllMultisigs
            address={address}
            chainName={chainName}
            chainID={chainID}
          />
          <MultisigSidebar
            chainID={chainID}
            walletAddress={address}
            accountSpecific={false}
            verified={verified}
          />
        </>
      ) : (
        <VerifyAccount chainID={chainID} />
      )}
    </div>
  );
};

export default PageMultisig;
