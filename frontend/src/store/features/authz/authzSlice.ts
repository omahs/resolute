'use client';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authzService from './service';
import { TxStatus } from '../../../types/enums';
import { cloneDeep } from 'lodash';
import { getAddressByPrefix } from '@/utils/address';
import { signAndBroadcast } from '@/utils/signing';
import { GAS_FEE } from '@/utils/constants';
import { NewTransaction } from '@/utils/transaction';
import { addTransactions } from '../transactionHistory/transactionHistorySlice';
import { setTxAndHash } from '../common/commonSlice';
import { AxiosError } from 'axios';

interface ChainAuthz {
  grantsToMe: Authorization[];
  grantsByMe: Authorization[];
  getGrantsToMeLoading: {
    status: TxStatus;
    errMsg: string;
  };
  getGrantsByMeLoading: {
    status: TxStatus;
    errMsg: string;
  };

  /*
    this is mapping of address to list of authorizations (chain level)
    example : {
        "pasg1..." : ["stakeAuthorization...", "sendAuthorization..."]
    }
  */

  GrantsToMeAddressMapping: Record<string, Authorization[]>;
  GrantsByMeAddressMapping: Record<string, Authorization[]>;
  tx: {
    status: TxStatus;
    errMsg: string;
  };
}

const defaultState: ChainAuthz = {
  grantsToMe: [],
  grantsByMe: [],
  getGrantsByMeLoading: {
    status: TxStatus.INIT,
    errMsg: '',
  },
  getGrantsToMeLoading: {
    status: TxStatus.INIT,
    errMsg: '',
  },
  GrantsByMeAddressMapping: {},
  GrantsToMeAddressMapping: {},
  tx: {
    status: TxStatus.INIT,
    errMsg: '',
  },
};

interface AuthzState {
  authzModeEnabled: boolean;
  authzAddress: string;
  chains: Record<string, ChainAuthz>;
  getGrantsToMeLoading: number;
  getGrantsByMeLoading: number;
  /*
    this is mapping of address to chain id to list of authorizations (inter chain level)
    example : {
        "cosmos1..." : {
          "cosmoshub-4": ["stakeAuthorization...", "sendAuthorization..."]
        }
    }
  */
  AddressToChainAuthz: Record<string, Record<string, Authorization[]>>;
}

const initialState: AuthzState = {
  authzModeEnabled: false,
  authzAddress: '',
  chains: {},
  getGrantsByMeLoading: 0,
  getGrantsToMeLoading: 0,
  AddressToChainAuthz: {},
};

export const getGrantsToMe = createAsyncThunk(
  'authz/grantsToMe',
  async (data: GetGrantsInputs) => {
    const response = await authzService.grantsToMe(
      data.baseURL,
      data.address,
      data.pagination
    );

    return {
      data: response.data,
    };
  }
);

export const getGrantsByMe = createAsyncThunk(
  'authz/grantsByMe',
  async (data: GetGrantsInputs) => {
    const response = await authzService.grantsByMe(
      data.baseURL,
      data.address,
      data.pagination
    );
    return {
      data: response.data,
    };
  }
);

export const txCreateAuthzGrant = createAsyncThunk(
  'authz/create-grant',
  async (
    data: TxGrantAuthzInputs,
    { rejectWithValue, fulfillWithValue, dispatch }
  ) => {
    try {
      const result = await signAndBroadcast(
        data.basicChainInfo.chainID,
        data.basicChainInfo.aminoConfig,
        data.basicChainInfo.prefix,
        data.msgs,
        GAS_FEE,
        '',
        `${data.feeAmount}${data.denom}`,
        data.basicChainInfo.rest,
        data.feegranter?.length > 0 ? data.feegranter : undefined
      );
      const tx = NewTransaction(
        result,
        data.msgs,
        data.basicChainInfo.chainID,
        data.basicChainInfo.address
      );

      dispatch(
        addTransactions({
          chainID: data.basicChainInfo.chainID,
          address: data.basicChainInfo.cosmosAddress,
          transactions: [tx],
        })
      );

      dispatch(
        setTxAndHash({
          tx,
          hash: tx.transactionHash,
        })
      );

      if (result?.code === 0) {
        return fulfillWithValue({ txHash: result?.transactionHash });
      } else {
        return rejectWithValue(result?.rawLog);
      }
    } catch (error) {
      if (error instanceof AxiosError) return rejectWithValue(error.response);
    }
  }
);

export const authzSlice = createSlice({
  name: 'authz',
  initialState,
  reducers: {
    enableAuthzMode: (state, action: PayloadAction<{ address: string }>) => {
      state.authzModeEnabled = true;
      state.authzAddress = action.payload.address;
    },
    exitAuthzMode: (state) => {
      state.authzModeEnabled = false;
      state.authzAddress = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGrantsToMe.pending, (state, action) => {
        state.getGrantsToMeLoading++;
        const chainID = action.meta.arg.chainID;
        if (!state.chains[chainID])
          state.chains[chainID] = cloneDeep(defaultState);
        state.chains[chainID].getGrantsToMeLoading.status = TxStatus.PENDING;
        state.chains[chainID].grantsToMe = [];
        state.chains[chainID].GrantsToMeAddressMapping = {};
        const allAddressToAuthz = state.AddressToChainAuthz;
        const addresses = Object.keys(allAddressToAuthz);
        addresses.forEach((address) => {
          allAddressToAuthz[address][chainID] = [];
        });

        state.AddressToChainAuthz = allAddressToAuthz;
      })
      .addCase(getGrantsToMe.fulfilled, (state, action) => {
        const chainID = action.meta.arg.chainID;
        const allAddressToAuthz = state.AddressToChainAuthz;
        const addresses = Object.keys(allAddressToAuthz);
        addresses.forEach((address) => {
          allAddressToAuthz[address][chainID] = [];
        });

        state.AddressToChainAuthz = allAddressToAuthz;

        state.getGrantsToMeLoading--;

        const grants = action.payload.data.grants;
        state.chains[chainID].grantsToMe = grants;
        const addressMapping: Record<string, Authorization[]> = {};
        const allChainsAddressToGrants = state.AddressToChainAuthz;

        grants.forEach((grant) => {
          const granter = grant.granter;
          const cosmosAddress = getAddressByPrefix(granter, 'cosmos');
          if (!addressMapping[granter]) addressMapping[granter] = [];
          if (!allChainsAddressToGrants[cosmosAddress])
            allChainsAddressToGrants[cosmosAddress] = {};
          if (!allChainsAddressToGrants[cosmosAddress][chainID])
            allChainsAddressToGrants[cosmosAddress][chainID] = [];
          allChainsAddressToGrants[cosmosAddress][chainID] = [
            ...allChainsAddressToGrants[cosmosAddress][chainID],
            grant,
          ];
          addressMapping[granter] = [...addressMapping[granter], grant];
        });
        state.AddressToChainAuthz = allChainsAddressToGrants;
        state.chains[chainID].GrantsToMeAddressMapping = addressMapping;
        state.chains[chainID].getGrantsToMeLoading = {
          status: TxStatus.IDLE,
          errMsg: '',
        };
      })
      .addCase(getGrantsToMe.rejected, (state, action) => {
        state.getGrantsToMeLoading--;
        const chainID = action.meta.arg.chainID;

        state.chains[chainID].getGrantsToMeLoading = {
          status: TxStatus.REJECTED,
          errMsg:
            action.error.message ||
            'An error occurred while fetching authz grants to me',
        };
      });
    builder
      .addCase(getGrantsByMe.pending, (state, action) => {
        state.getGrantsByMeLoading++;
        const chainID = action.meta.arg.chainID;
        if (!state.chains[chainID])
          state.chains[chainID] = cloneDeep(defaultState);
        state.chains[chainID].getGrantsByMeLoading.status = TxStatus.PENDING;
        state.chains[chainID].grantsByMe = [];
        state.chains[chainID].GrantsByMeAddressMapping = {};
      })
      .addCase(getGrantsByMe.fulfilled, (state, action) => {
        state.getGrantsByMeLoading--;
        const chainID = action.meta.arg.chainID;
        const grants = action.payload.data.grants;
        state.chains[chainID].grantsByMe = grants;
        const addressMapping: Record<string, Authorization[]> = {};
        grants.forEach((grant) => {
          const granter = grant.granter;
          if (!addressMapping[granter]) addressMapping[granter] = [];
          addressMapping[granter] = [...addressMapping[granter], grant];
        });
        state.chains[chainID].GrantsByMeAddressMapping = addressMapping;
        state.chains[chainID].getGrantsByMeLoading = {
          status: TxStatus.IDLE,
          errMsg: '',
        };
      })
      .addCase(getGrantsByMe.rejected, (state, action) => {
        state.getGrantsByMeLoading--;
        const chainID = action.meta.arg.chainID;

        state.chains[chainID].getGrantsByMeLoading = {
          status: TxStatus.REJECTED,
          errMsg:
            action.error.message ||
            'An error occurred while fetching authz grants by me',
        };
      });

    builder
      .addCase(txCreateAuthzGrant.pending, (state, action) => {
        const { chainID } = action.meta.arg.basicChainInfo;
        state.chains[chainID].tx.status = TxStatus.PENDING;
      })
      .addCase(txCreateAuthzGrant.fulfilled, (state, action) => {
        const { chainID } = action.meta.arg.basicChainInfo;
        state.chains[chainID].tx.status = TxStatus.IDLE;
      })
      .addCase(txCreateAuthzGrant.rejected, (state, action) => {
        const { chainID } = action.meta.arg.basicChainInfo;
        state.chains[chainID].tx.status = TxStatus.REJECTED;
      });
  },
});

export const { enableAuthzMode, exitAuthzMode } = authzSlice.actions;

export default authzSlice.reducer;
