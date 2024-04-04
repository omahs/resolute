import { msgAuthzExecTypeUrl } from '@/txns/authz/exec';
import { msgAuthzGrantTypeUrl } from '@/txns/authz/grant';
import { msgSendTypeUrl } from '@/txns/bank/send';
import { msgWithdrawRewards } from '@/txns/distribution/withDrawRewards';
import { msgFeegrantGrantTypeUrl } from '@/txns/feegrant/grant';
import { msgDepositTypeUrl } from '@/txns/gov/deposit';
import { msgVoteTypeUrl } from '@/txns/gov/vote';
import { msgTransfer } from '@/txns/ibc/transfer';
import { msgDelegate } from '@/txns/staking/delegate';
import { msgReDelegate } from '@/txns/staking/redelegate';
import { msgUnDelegate } from '@/txns/staking/undelegate';
import TextCopyField from './TextCopyField';
import { parseBalance } from '@/utils/denom';
import { formatNumber, parseDenomAmount } from '@/utils/util';

const RenderFormattedMessage = ({
  message,
  coinDenom,
  decimals,
}: {
  message: any;
  decimals: number;
  coinDenom: string;
}) => {
  const msgType = message?.['@type'];
  switch (msgType) {
    case msgDelegate:
      return (
        <DelegateMsg
          coinDenom={coinDenom}
          decimals={decimals}
          msg={message}
          isDelegate={true}
        />
      );
    case msgUnDelegate:
      return (
        <DelegateMsg
          coinDenom={coinDenom}
          decimals={decimals}
          msg={message}
          isDelegate={false}
        />
      );
    case msgReDelegate:
      return (
        <RedelegateMsg
          coinDenom={coinDenom}
          decimals={decimals}
          msg={message}
        />
      );
    case msgSendTypeUrl:
      return (
        <SendMsg coinDenom={coinDenom} decimals={decimals} msg={message} />
      );
    case msgWithdrawRewards:
      return <ClaimRewards msg={message} />;
    case msgTransfer:
      return 'IBC Send';
    case msgAuthzExecTypeUrl:
      return 'Exec Authz';
    case msgAuthzGrantTypeUrl:
      return 'Grant Authz';
    case msgFeegrantGrantTypeUrl:
      return 'Grant Allowance';
    case msgVoteTypeUrl:
      return 'Vote';
    case msgDepositTypeUrl:
      return 'Deposit';
    default:
      return msgType.split('.').slice(-1)?.[0] || msgType;
  }
};

export default RenderFormattedMessage;

const SendMsg = ({
  decimals,
  msg,
  coinDenom,
}: {
  msg: any;
  decimals: number;
  coinDenom: string;
}) => {
  const { to_address, amount } = msg;
  const parsedAmount = parseBalance(amount, decimals, amount[0].denom);

  return (
    <div className="text-[16px] flex gap-2 items-center">
      <div>Sent</div>
      <div className="message-text-gradient font-bold">
        {formatNumber(parsedAmount)} {coinDenom}
      </div>
      <div className="text-[#ffffff80]">to</div>
      <TextCopyField displayLen={20} isAddress={true} content={to_address} />
    </div>
  );
};

const DelegateMsg = ({
  decimals,
  msg,
  coinDenom,
  isDelegate,
}: {
  msg: any;
  decimals: number;
  coinDenom: string;
  isDelegate: boolean;
}) => {
  const { amount, validator_address } = msg;
  const parsedAmount = formatNumber(
    parseDenomAmount(amount?.amount || '0', decimals)
  );
  return (
    <div className="text-[16px] flex gap-2 items-center">
      <div>{isDelegate ? 'Delegated' : 'UnDelegated'}</div>
      <div className="message-text-gradient font-bold">
        {parsedAmount} {coinDenom}
      </div>
      <div className="text-[#ffffff80]">{isDelegate ? 'to' : 'from'}</div>
      <TextCopyField
        displayLen={20}
        isAddress={true}
        content={validator_address}
      />
    </div>
  );
};

const RedelegateMsg = ({
  decimals,
  msg,
  coinDenom,
}: {
  msg: any;
  decimals: number;
  coinDenom: string;
}) => {
  const { amount } = msg;
  const parsedAmount = formatNumber(
    parseDenomAmount(amount?.amount || '0', decimals)
  );
  return (
    <div className="text-[16px] flex gap-2 items-center">
      <div>Redelegated</div>
      <div className="message-text-gradient font-bold">
        {parsedAmount} {coinDenom}
      </div>
    </div>
  );
};

const ClaimRewards = ({ msg }: { msg: any }) => {
  const { validator_address } = msg;
  return (
    <div className="text-[16px] flex gap-2 items-center">
      <div>Claimed Rewards</div>
      <div className="text-[#ffffff80]">from</div>
      <TextCopyField
        displayLen={20}
        isAddress={true}
        content={validator_address}
      />
    </div>
  );
};

const GrantAuthzMsg = ({ msg }: { msg: any }) => {
  const { grantee } = msg;
  return (
    <div className="text-[16px] flex gap-2 items-center">
      <div>Granted authz</div>
      <div className="text-[#ffffff80]">to</div>
      <TextCopyField displayLen={20} isAddress={true} content={grantee} />
    </div>
  );
};
