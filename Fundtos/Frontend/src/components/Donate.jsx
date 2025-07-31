import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from 'aptos';
import ConnectWallet from './connectWallet';
import LoadingSpinner from './LodingSpinner';
import ProgressBar from './ProgressBar';
import TransactionStatus from './TransactionStatus';

export default function Donate() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const MODULE_ADDRESS = "0xf52a437aeb67ea4b91f1221ce7a65cac382de5e2956f1be2344a88d4ccdad5b6";
  const MODULE_NAME = "Fundraising";
  
  const [campaigns, setCampaigns] = useState({ active: [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donationAmounts, setDonationAmounts] = useState({}); 
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [processingCampaignId, setProcessingCampaignId] = useState(null);

  const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_campaign_details`,
        type_arguments: [],
        arguments: [],
      };
  
      const response = await client.view(payload);
      const campaignsData = response[0];

      if (Array.isArray(campaignsData)) {
        const regularCampaigns = campaignsData
          .filter(data => data.campaign_type === '0')
          .map((data) => ({
            title: data.title,
            description: data.description,
            link: data.link,
            goal: parseInt(data.goal, 10),
            balance: parseInt(data.balance, 10),
            is_active: data.is_active,
            campaign_owner: data.owner,
            campaign_id: parseInt(data.id),
          }));

        const active = regularCampaigns.filter(campaign => campaign.is_active);
        const closed = regularCampaigns.filter(campaign => !campaign.is_active);
        
        setCampaigns({ active, closed });
      } else {
        throw new Error("Unexpected response format from blockchain");
      }
    } catch (err) {
      setError("Failed to fetch campaigns");
      console.error("Error fetching campaigns: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationChange = (campaignId, e) => {
    const value = e.target.value;
    setDonationAmounts(prev => ({
      ...prev,
      [campaignId]: value
    }));
  };
  
  const handleDonation = async (campaignOwner, campaignId) => {
    if (!connected || !account) {
      alert("Please connect your wallet first");
      return;
    }
    
    const donationAmount = parseFloat(donationAmounts[campaignId]);
    
    if (!campaignOwner || campaignId === undefined || isNaN(donationAmount) || donationAmount <= 0) {
      alert("Invalid donation parameters");
      return;
    }

    setProcessingCampaignId(campaignId);
    setTransactionStatus('processing');
  
    const transaction = {
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::donate`,
        functionArguments: [
          campaignOwner,
          campaignId,
          donationAmount
        ]
      }
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      
      if (response) {
        await client.waitForTransaction(response.hash);
        setTransactionStatus('success');
        await fetchCampaigns();
        setDonationAmounts(prev => ({
          ...prev,
          [campaignId]: ''
        }));
        setTimeout(() => {
          setTransactionStatus(null);
          setProcessingCampaignId(null);
        }, 3000);
      } else {
        setTransactionStatus('error');
      }
    } catch (error) {
      console.error("Error details:", error);
      setTransactionStatus('error');
      alert(`Donation failed: ${error.message}`);
    }
  };

  const CampaignCard = ({ campaign }) => (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{campaign.title}</h3>
          <span className={`text-sm px-3 py-1 rounded-full ${
            campaign.is_active 
              ? "bg-purple-100 text-purple-700" 
              : "bg-gray-100 text-gray-700"
          }`}>
            {campaign.is_active ? "Active" : "Closed"}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{campaign.description}</p>
        {campaign.link && (
          <a 
            href={campaign.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 mb-4 inline-block"
          >
            Campaign Details ↗
          </a>
        )}
        <ProgressBar goal={campaign.goal} balance={campaign.balance} />
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <span>Goal: {campaign.goal} APT</span>
          <span>Raised: {campaign.balance} APT</span>
        </div>
        {campaign.is_active && (
          <div className="mt-4">
            <input
              type="number"
              min="0"
              placeholder="Enter donation amount"
              className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={donationAmounts[campaign.campaign_id] || ''}
              onChange={(e) => handleDonationChange(campaign.campaign_id, e)}
              disabled={processingCampaignId === campaign.campaign_id}
            />
            {processingCampaignId === campaign.campaign_id && (
              <TransactionStatus status={transactionStatus} />
            )}
            <button
              onClick={() => handleDonation(campaign.campaign_owner, campaign.campaign_id)}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                !donationAmounts[campaign.campaign_id] || Number(donationAmounts[campaign.campaign_id]) <= 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
              }`}
              disabled={!donationAmounts[campaign.campaign_id] || parseFloat(donationAmounts[campaign.campaign_id]) <= 0 || processingCampaignId === campaign.campaign_id}
            >
              {processingCampaignId === campaign.campaign_id ? 'Processing...' : 'Donate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto mt-12">
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-purple-900">
            Ongoing Campaigns
          </h2>
          <div className="flex flex-wrap gap-6">
            {campaigns.active.map((campaign, index) => (
              <div 
                key={index} 
                className="w-full sm:w-1/2 lg:w-1/3"
              >
                <CampaignCard campaign={campaign} />
              </div>
            ))}
            {campaigns.active.length === 0 && (
              <p className="text-gray-600 w-full text-center">
                No active campaigns at the moment.
              </p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Closed Campaigns</h2>
          <div className="flex flex-col gap-6">
            {campaigns.closed.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))}
            {campaigns.closed.length === 0 && (
              <p className="text-gray-600">No closed campaigns.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}