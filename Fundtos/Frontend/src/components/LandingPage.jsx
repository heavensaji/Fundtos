import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet2, Shield, Users, TrendingUp, Gift } from 'lucide-react';
import logo from '../assets/logo.png'

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: "Secure Transactions",
      description: "Built on Aptos blockchain ensuring maximum security and transparency for all donations"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Community Driven",
      description: "Connect with projects and causes that matter to you and your community"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: "Real-time Progress",
      description: "Track campaign progress and see your impact in real-time"
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "Seed Funding",
      description: "Special campaigns for startups and innovative projects with transparent fee structure"
    }
  ];

  const campaigns = [
    {
      title: "Tech Innovation Hub",
      category: "Seed Funding",
      raised: "120,000",
      goal: "200,000",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Community Garden",
      category: "Regular",
      raised: "45,000",
      goal: "50,000",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Education for All",
      category: "Regular",
      raised: "80,000",
      goal: "100,000",
      image: "/api/placeholder/400/250"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
                Empowering Dreams Through Blockchain
              </h1>
              <p className="text-base sm:text-lg mb-8 text-purple-100">
                Join our revolutionary fundraising platform powered by Aptos blockchain. 
                Support causes, fund innovations, and make a difference with complete transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/donors')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
                >
                  Start Donating
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/owner')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Create Campaign
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
              <img 
                src={logo}
                alt="Platform Preview" 
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="flex flex-col gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
      Featured Campaigns
    </h2>
    <div className="flex flex-wrap gap-6 items-center justify-center">
      {campaigns.map((campaign, index) => (
        <div 
          key={index} 
          className="w-full sm:w-1/2 lg:w-1/4  bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="relative">
           
            <span className="absolute top-4 right-4 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {campaign.category}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-xl pt-5 font-semibold mb-4">{campaign.title}</h3>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(parseInt(campaign.raised.replace(',', '')) / 
                    parseInt(campaign.goal.replace(',', ''))) * 100}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Raised: {campaign.raised} APT</span>
                <span>Goal: {campaign.goal} APT</span>
              </div>
              <button 
                onClick={() => navigate(`/campaign/${index}`)}
                className="w-full text-center bg-purple-600 text-white  rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Campaign
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>




      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of others who are already supporting amazing causes and innovative projects through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/connect-wallet')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
            >
              <Wallet2 className="w-5 h-5" />
              Connect Wallet
            </button>
            <button 
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Explore Campaigns
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-gray-300 py-12">
       <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <p className="text-sm">
                A revolutionary blockchain-based fundraising platform empowering dreams and innovations.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Campaign</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Explore</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medium</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2025 Blockchain Fundraising Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;