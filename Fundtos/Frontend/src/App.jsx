import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ConnectWallet from './components/connectWallet'
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Donate from './components/Donate'
import OwnerDashboard from './components/OwnerDashboard'
import SeedFundingDonate from './components/SeedFundingDonate'
import LandingPage from './components/LandingPage'
import Navbar from './components/NavBar'


function App() {
  const {connected } = useWallet()
  return (
   <>
   <Navbar />
   <LandingPage />
   {/* <ConnectWallet /> */}
   {/* {!connected ? <h1>Connect your wallet to proceed !</h1> : <SeedFundingDonate />}  */}

   </>
  )
}

export default App
