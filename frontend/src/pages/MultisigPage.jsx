import React from 'react'
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import PageMultisig from './multisig/PageMultisig';

export default function StakingPage() {
    const networks = useSelector((state) => state.wallet.networks);
    const chainIDs = Object.keys(networks);

    return (
        <div>
            <PageMultisig />
        </div>
    )
}
