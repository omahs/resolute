import React from 'react';
import { useAppSelector } from './StateHooks';
import { RootState } from '@/store/store';
import { Validator, ValidatorProfileInfo } from '@/types/staking';
import { getValidatorRank } from '@/utils/util';
import useGetChainInfo from './useGetChainInfo';
import { parseBalance } from '@/utils/denom';

const useGetValidatorInfo = () => {
  const stakingData = useAppSelector(
    (state: RootState) => state.staking.chains
  );
  const nameToChainIDs = useAppSelector(
    (state: RootState) => state.wallet.nameToChainIDs
  );
  const chainIDs = Object.keys(nameToChainIDs).map(
    (chainName) => nameToChainIDs[chainName]
  );
  const tokensPriceInfo = useAppSelector(
    (state) => state.common.allTokensInfoState.info
  );
  const { getDenomInfo } = useGetChainInfo();

  const getValidatorInfo = ({
    chainID,
    moniker,
  }: {
    chainID: string;
    moniker: string;
  }) => {
    if (
      stakingData?.[chainID]?.validators.active &&
      Object.values(stakingData?.[chainID]?.validators.active).length > 0
    ) {
      const validator = Object.values(
        stakingData?.[chainID]?.validators.active
      ).find((v) => {
        return (
          v.description.moniker.trim().toLowerCase() ===
          moniker.trim().toLowerCase()
        );
      });

      if (validator) {
        return validator;
      }
    }

    if (
      stakingData?.[chainID]?.validators.inactive &&
      Object.values(stakingData?.[chainID]?.validators.inactive).length > 0
    ) {
      const validator = Object.values(
        stakingData?.[chainID]?.validators.inactive
      ).find((v) => v.description.moniker === moniker);

      if (validator) {
        return validator;
      }

      return null;
    }
  };

  const getChainwiseValidatorInfo = ({ moniker }: { moniker: string }) => {
    const chainWiseValidatorData: Record<string, ValidatorProfileInfo> = {};
    chainIDs.forEach((chainID) => {
      const validatorInfo = getValidatorInfo({ chainID, moniker });

      if (validatorInfo) {
        const { decimals, minimalDenom } = getDenomInfo(chainID);
        const activeSorted = stakingData?.[chainID]?.validators.activeSorted;
        const inactiveSorted =
          stakingData?.[chainID]?.validators.inactiveSorted;
        const operatorAddress = validatorInfo?.operator_address || '';
        const rank = getValidatorRank(operatorAddress, [
          ...activeSorted,
          ...inactiveSorted,
        ]);
        const description = validatorInfo?.description?.details;
        const website = validatorInfo?.description?.website;
        const identity = validatorInfo?.description?.identity;
        const commission =
          Number(validatorInfo?.commission?.commission_rates?.rate) * 100;
        const delegatorShares = validatorInfo?.delegator_shares;
        const totalStaked = parseBalance(
          [
            {
              amount: delegatorShares,
              denom: minimalDenom,
            },
          ],
          decimals,
          minimalDenom
        );
        const usdPriceInfo: TokenInfo | undefined =
          tokensPriceInfo?.[minimalDenom]?.info;
        const totalStakedInUSD = usdPriceInfo
          ? totalStaked * usdPriceInfo.usd
          : '-';

        chainWiseValidatorData[chainID] = {
          commission,
          description,
          identity,
          moniker,
          rank,
          totalStakedInUSD,
          website,
          chainID,
        };
      }
    });
    return {
      chainWiseValidatorData,
    };
  };

  return { getChainwiseValidatorInfo };
};

export default useGetValidatorInfo;
