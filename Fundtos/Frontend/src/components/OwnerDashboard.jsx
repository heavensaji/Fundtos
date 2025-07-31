



import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from 'aptos';

const OwnerDashboard = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const MODULE_ADDRESS = "0xf52a437aeb67ea4b91f1221ce7a65cac382de5e2956f1be2344a88d4ccdad5b6";
  const MODULE_NAME = "Fundraising";
  
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState('active'); 
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [goal, setGoal] = useState("");
  const [campaignType, setCampaignType] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState({});
  
  const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

  useEffect(() => {
    if (connected && account) {
      fetchOwnerCampaigns();
    }
  }, [connected, account]);

  const fetchOwnerCampaigns = async () => {
    try {
      setLoading(true);
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_campaigns`,
        type_arguments: [],
        arguments: [account.address],
      };

      const response = await client.view(payload);
      const campaignsData = response[0];
      
      if (Array.isArray(campaignsData)) {
        const campaignsMapped = campaignsData.map((data) => ({
          id: parseInt(data.id),
          title: data.title,
          description: data.description,
          link: data.link,
          goal: parseInt(data.goal),
          balance: parseInt(data.balance),
          is_active: data.is_active,
          campaign_type: parseInt(data.campaign_type),
        }));
        setMyCampaigns(campaignsMapped);
      }
    } catch (err) {
      setError("Failed to fetch campaigns");
      console.error("Error fetching campaigns: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!connected || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_campaign`,
          functionArguments: [title, description, link, parseInt(goal), parseInt(campaignType)]
        }
      };

      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      
      setTitle("");
      setDescription("");
      setLink("");
      setGoal("");
      setCampaignType(0);
      await fetchOwnerCampaigns();
      
      alert("Campaign created successfully!");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert(`Failed to create campaign: ${error.message}`);
    }
  };

  const handleWithdraw = async (campaignId, amount) => {
    if (!connected || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::withdraw_funds`,
          functionArguments: [campaignId, parseInt(amount)]
        }
      };

      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      
      setWithdrawAmount({...withdrawAmount, [campaignId]: ""});
      await fetchOwnerCampaigns();
      
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert(`Failed to withdraw: ${error.message}`);
    }
  };

  const handleCloseCampaign = async (campaignId) => {
    if (!connected || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const transaction = {
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::close_campaign`,
          functionArguments: [campaignId]
        }
      };

      const response = await signAndSubmitTransaction(transaction);
      await client.waitForTransaction(response.hash);
      
      await fetchOwnerCampaigns();
      alert("Campaign closed successfully!");
    } catch (error) {
      console.error("Error closing campaign:", error);
      alert(`Failed to close campaign: ${error.message}`);
    }
  };

  const CampaignCard = ({ campaign }) => (
    <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-bold text-lg mb-2">{campaign.title}</h4>
      <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
      {campaign.link && (
        <a 
          href={campaign.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mb-4 block"
        >
          Campaign Link
        </a>
      )}
      <div className="space-y-2 text-sm">
        <p className="flex justify-between">
          <span className="font-medium">Type:</span>
          <span>{campaign.campaign_type === 0 ? "Regular Donation" : "Seed Funding"}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Goal:</span>
          <span>{campaign.goal} APT</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Balance:</span>
          <span>{campaign.balance} APT</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Status:</span>
          <span className={campaign.is_active ? "text-green-600" : "text-red-600"}>
            {campaign.is_active ? "Active" : "Closed"}
          </span>
        </p>
      </div>
      
      {campaign.is_active && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount[campaign.id] || ""}
              onChange={(e) => setWithdrawAmount({
                ...withdrawAmount,
                [campaign.id]: e.target.value
              })}
              className="flex-1 p-2 border rounded-md"
              min="0"
              step="0.1"
            />
            <button
              onClick={() => handleWithdraw(campaign.id, withdrawAmount[campaign.id])}
              className="w-full sm:w-auto bg-green-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              disabled={!withdrawAmount[campaign.id] || withdrawAmount[campaign.id] <= 0}
            >
              Withdraw
            </button>
          </div>
          <button
            onClick={() => handleCloseCampaign(campaign.id)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Close Campaign
          </button>
        </div>
      )}
    </div>
  );

  if (!connected) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold mb-4">Campaign Owner Dashboard</h2>
        <p>Please connect your wallet to manage your campaigns</p>
      </div>
    );
  }

  const activeCampaigns = myCampaigns.filter(campaign => campaign.is_active);
  const closedCampaigns = myCampaigns.filter(campaign => !campaign.is_active);

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Campaign Owner Dashboard</h2>
      
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-bold mb-4">Create New Campaign</h3>
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Link</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fundraising Goal (APT)</label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={0}>Regular Donation Campaign</option>
                <option value={1}>Seed Funding Campaign (2% platform fee)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
                          className="w-full bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Create Campaign
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b">
          <button
            onClick={() => setActiveView('active')}
            className={`px-3 py-2 text-center bg-white font-medium text-base sm:text-lg ${
              activeView === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Campaigns ({activeCampaigns.length})
          </button>
          <button
            onClick={() => setActiveView('closed')}
            className={`px-3 py-2 text-center bg-white font-medium text-base sm:text-lg ${
              activeView === 'closed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Closed Campaigns ({closedCampaigns.length})
          </button>
        </div>

        {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-md">{error}</div>}
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : activeView === 'active' ? (
          activeCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active campaigns</div>
          ) : (
            <div className="flex flex-wrap -mx-3">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="w-full md:w-1/2 px-3 mb-6">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          )
        ) : (
          closedCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No closed campaigns</div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-6">
              {closedCampaigns.map((campaign) => (
                <div key={campaign.id} className="w-full lg:w-[calc(50%-12px)]">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;