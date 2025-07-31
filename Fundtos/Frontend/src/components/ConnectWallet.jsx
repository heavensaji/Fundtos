import React from 'react'
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import styled from "styled-components";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

function ConnectWallet() {
 
  return (
    <div className='connectwallet'>
      <WalletSelector/>
    </div>
  )
}

export default ConnectWallet