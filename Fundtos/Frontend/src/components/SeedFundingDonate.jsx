
import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from 'aptos';
import { Wallet2, ArrowRight, Sparkles, Target, Clock } from 'lucide-react';
import LoadingSpinner from './LodingSpinner';
import TransactionStatus from './TransactionStatus';

const SeedFundingDonate = () => {
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
        const seedCampaigns = campaignsData
          .filter(data => data.campaign_type === '1')
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

        const active = seedCampaigns.filter(campaign => campaign.is_active);
        const closed = seedCampaigns.filter(campaign => !campaign.is_active);
        
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

    const platformFee = (donationAmount * 2) / 100;
    const totalAmount = donationAmount + platformFee;

    setProcessingCampaignId(campaignId);
    setTransactionStatus('processing');
  
    const transaction = {
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::donate`,
        functionArguments: [
          campaignOwner,
          campaignId,
          totalAmount
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min((campaign.balance / campaign.goal) * 100, 100)}%` 
            }}
          />
        </div>
        
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
              {processingCampaignId === campaign.campaign_id ? (
                'Processing...'
              ) : (
                <>
                  <Wallet2 className="w-5 h-5 inline-block mr-2" />
                  Donate Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6">
              Support Innovative Projects
            </h1>
            <p className="text-lg text-purple-100 mb-8">
              Back promising projects through our secure blockchain platform with transparent fee structure.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-lg">
                <Target className="w-5 h-5 text-purple-300" />
                <span>2% Platform Fee</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <span>Verified Projects</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 text-purple-300" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-purple-900">
            Ongoing Seed Funding Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.active.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))}
            {campaigns.active.length === 0 && (
              <p className="text-gray-600 col-span-3 text-center">
                No active seed funding campaigns at the moment.
              </p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Closed Seed Funding Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.closed.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))}
            {campaigns.closed.length === 0 && (
              <p className="text-gray-600 col-span-3 text-center">
                No closed seed funding campaigns.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedFundingDonate;