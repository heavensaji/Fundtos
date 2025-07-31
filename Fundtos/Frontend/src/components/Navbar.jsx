import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import ConnectWallet from './connectWallet';
import logo from '../assets/logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [donateDropdown, setDonateDropdown] = useState(false);
  const navigate = useNavigate();
  const { connected } = useWallet();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setDonateDropdown(false);
    }
  };

  const toggleDonateDropdown = () => {
    setDonateDropdown(!donateDropdown);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-8 mr-2"
                src={logo}
                alt="Logo"
              />
              <span className="text-xl font-bold text-purple-600">Fundos</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-between space-x-4">
            <NavLink to="/">Home</NavLink>
            
            <div className="relative">
              <button
                onClick={toggleDonateDropdown}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
              >
                Donate
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {donateDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <Link
                      to="/donors"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setDonateDropdown(false)}
                    >
                      Regular Donation
                    </Link>
                    <Link
                      to="/seed"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setDonateDropdown(false)}
                    >
                      Seed Funding
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/owners" className="!text-white !bg-purple-600 hover:!bg-purple-700">
              Create Campaign
            </NavLink>

            <div className="ml-4">
              <ConnectWallet />
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
            onClick={toggleMenu}
          >
            About
          </Link>
          <Link
            to="/explore"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
            onClick={toggleMenu}
          >
            Explore
          </Link>
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-base font-medium text-gray-700">
              Donate
            </div>
            <Link
              to="/donate"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 pl-6"
              onClick={toggleMenu}
            >
              Regular Donation
            </Link>
            <Link
              to="/seed-funding"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 pl-6"
              onClick={toggleMenu}
            >
              Seed Funding
            </Link>
          </div>

          <Link
            to="/create-campaign"
            className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700"
            onClick={toggleMenu}
          >
            Create Campaign
          </Link>

          <div className="px-3 py-2">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar ;