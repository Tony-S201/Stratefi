'use client';

// Style
import '@rainbow-me/rainbowkit/styles.css';

// Wagmi and react query config
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

// RainbowKit config
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

// Chains
import { hardhat, arbitrum } from 'wagmi/chains';

const config = getDefaultConfig({
    appName: 'Stratefi',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID, // todo: create a dotenv file and get id from wallet connect
    chains: [arbitrum, hardhat],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const RainbowKitAndWagmiProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme({
              accentColor:"#000000",
              borderRadius: "small",
            })}>
            { children }
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitAndWagmiProvider