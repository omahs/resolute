'use client';
import { Dialog, DialogContent } from '@mui/material';
import React, { useState } from 'react';
import Image from 'next/image';

const Transactionsuccesspopup = ({ tx }: { tx: Transaction }) => {
  const feeAmount = tx.fee && tx.fee.length > 0 ? tx.fee[0].amount : '0';
  const feeDenom = tx.fee && tx.fee.length > 0 ? tx.fee[0].denom : '';
  const [isOpen, setIsOpen] = useState(true);
  const handleClose = () => {
    setIsOpen(false);
  };
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      className="blur-effect"
      PaperProps={{ sx: { borderRadius: '16px', backgroundColor: '#20172F' } }}
    >
      <DialogContent sx={{ padding: 0 }}>
        <div className="transaction-box flex-col">
          <div className="space-y-4">
            <div className="cross" onClick={handleClose}>
              <Image
                src="./close-icon.svg"
                width={24}
                height={24}
                alt="Close"
              />
            </div>
            <div className="px-10 py-0">
              <div className="sapce-y-10">
                <div className="text-white text-xl font-bold">
                  Transaction Successful
                </div>

                <div className="transaction-inner-grid mt-10 mb-10">
                  <div className="flex gap-x-4">
                    <div className="popup-text flex w-[140px] font-light">
                      Transaction Hash
                    </div>
                    <div className="flex space-x-2">
                      <div className="popup-text font-medium">
                        {tx.transactionHash}
                      </div>
                      <Image
                        src="./copy.svg"
                        width={24}
                        height={24}
                        alt="Copy-icon"
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div className="popup-text font-light flex w-[140px]">
                      Fees
                    </div>
                    <div className="popup-text font-medium">
                      {feeAmount} {feeDenom}
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div className="popup-text font-light flex w-[140px]">
                      Gas used / wanted
                    </div>
                    <div className="popup-text font-medium">
                      {tx.gasUsed} / {tx.gasWanted}
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div className="popup-text font-light flex w-[140px]">
                      Memo
                    </div>
                    <div className="popup-text font-medium w-[621px]">
                      {tx.memo}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <button className="button">
                    <p className="">View Transaction</p>
                  </button>
                  <div className="text-white flex items-center justify-center text-base font-medium underline cursor-pointer">
                    Share Transaction
                  </div>
                </div>
                <div className="cross"></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Transactionsuccesspopup;