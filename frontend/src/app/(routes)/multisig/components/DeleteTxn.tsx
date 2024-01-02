import { useAppDispatch } from '@/custom-hooks/StateHooks';
import useGetChainInfo from '@/custom-hooks/useGetChainInfo';
import { deleteTxn } from '@/store/features/multisig/multisigSlice';
import { getAuthToken } from '@/utils/localStorage';
import Image from 'next/image';
import React, { useState } from 'react';
import DialogDeleteTxn from './DialogDeleteTxn';

interface DeleteTxnProps {
  txId: number;
  address: string;
  isMember: boolean;
  chainID: string;
}

const DeleteTxn: React.FC<DeleteTxnProps> = (props) => {
  const { txId, address, isMember, chainID } = props;
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const authToken = getAuthToken();
  const { getChainInfo } = useGetChainInfo();
  const { address: walletAddress } = getChainInfo(chainID);

  const deleteTx = () => {
    dispatch(
      deleteTxn({
        queryParams: {
          address: authToken?.address || '',
          signature: authToken?.signature || '',
          account_address: walletAddress || '',
        },
        data: {
          address: address,
          id: txId,
        },
      })
    );
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <button
        className="action-image justify-center items-center flex"
        disabled={!isMember}
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Image
          src="/delete-icon.svg"
          width={14}
          height={14}
          alt="Delete-Icon"
          className="cursor-pointer"
        />
      </button>
      <DialogDeleteTxn
        open={deleteDialogOpen}
        onClose={() => handleDeleteDialogClose()}
        deleteTx={deleteTx}
      />
    </>
  );
};

export default DeleteTxn;
