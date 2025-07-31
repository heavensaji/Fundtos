import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import OwnerDashboard from './components/OwnerDashboard.jsx';
import { BrowserRouter , Routes , Route } from 'react-router-dom';
import Donate from './components/Donate.jsx';
import Navbar from './components/Navbar.jsx'
import SeedFundingDonate from './components/SeedFundingDonate.jsx';

const wallets = [ new PetraWallet(),]


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
    <BrowserRouter>
    <Navbar />
       <Routes>
        <Route path='/' element={<App />} />
        <Route path='/donors' element={<Donate />} />
        <Route path='/owners' element={<OwnerDashboard />} />
        <Route path='/seed' element={<SeedFundingDonate />} />
       </Routes>
    </BrowserRouter>
    </AptosWalletAdapterProvider>
  </StrictMode>,
)
