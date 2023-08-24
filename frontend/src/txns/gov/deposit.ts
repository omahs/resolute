import { MsgDeposit } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { Msg } from "../types";

const msgDeposit = "/cosmos.gov.v1beta1.MsgDeposit";

export function GovDepositMsg(
  proposalId: number,
  depositer: string,
  amount: number,
  denom: string
): Msg {
  return {
    typeUrl: msgDeposit,
    value: MsgDeposit.fromPartial({
      depositor: depositer,
      proposalId: proposalId,
      amount: [
        {
          denom: denom,
          amount: String(amount),
        },
      ],
    }),
  };
}

// const msgIBCSend = "/cosmos.bank.v1beta1.MsgSend";
const msgIBCSend = "/ibc.applications.transfer.v1.MsgTransfer";

export function IBCTransferMsg(
  sourcePort: string,
  sourceChannel: string,
  amount: number,
  denom: string,
  sender: string,
  receiver: string
): Msg {
  return {
    typeUrl: msgIBCSend,
    value: MsgTransfer.fromPartial({
      sourcePort: sourcePort,
      sourceChannel: sourceChannel,
      token: {
        denom: denom,
        amount: String(amount),
      },
      sender: sender,
      receiver: receiver,
      timeoutHeight: {
        revisionHeight: 123123,
        revisionNumber: 1,
      }
    }),
  };
}
