address DevAddress {
    module Fundraising {
        use std::signer;
        use aptos_framework::coin;
        use aptos_framework::aptos_coin::AptosCoin;
        use std::vector;
        use std::string::String;
        use aptos_framework::account;
        use aptos_framework::event::{Self, EventHandle};

        const E_CAMPAIGN_NOT_ACTIVE: u64 = 1;
        const E_NOT_OWNER: u64 = 2;
        const E_INSUFFICIENT_BALANCE: u64 = 3;
        const E_CAMPAIGN_NOT_FOUND: u64 = 4;
        const SEED_FUNDING_FEE_PERCENTAGE: u64 = 2;
        const PERCENTAGE_DENOMINATOR: u64 = 100;
        const CAMPAIGN_TYPE_REGULAR: u64 = 0;
        const CAMPAIGN_TYPE_SEED_FUNDING: u64 = 1;

        
        struct Campaign has key, store, copy, drop {
            id: u64,             
            owner: address,
            owner_address: address,  
            title: String,
            description: String,
            link: String,        // Added link field
            goal: u64,
            balance: u64,
            is_active: bool,
            campaign_type: u64,
        }

        struct Campaigns has key {
            campaigns: vector<Campaign>,
            campaign_count: u64,  
        }
        struct PlatformFees has key {
            treasury: address,
            total_fees_collected: u64,
        }
        struct GlobalRegistry has key {
            campaign_creators: vector<address>,
        }

        struct CampaignEvents has key {
            campaign_created_events: EventHandle<CampaignCreatedEvent>,
            donation_events: EventHandle<DonationEvent>,
            withdrawal_events: EventHandle<WithdrawalEvent>,
        }

        struct CampaignCreatedEvent has drop, store {
            owner: address,
            campaign_id: u64,    
            title: String,
            goal: u64,
            campaign_type: u64,
        }

        struct DonationEvent has drop, store {
            donor: address,
            campaign_owner: address,
            campaign_id: u64,
            amount: u64,
        }

        struct WithdrawalEvent has drop, store {
            owner: address,
            campaign_id: u64,
            amount: u64,
        }

        fun find_campaign_by_id(campaigns: &vector<Campaign>, campaign_id: u64): (bool, u64) {
            let i = 0;
            let len = vector::length(campaigns);
            
            while (i < len) {
                let campaign = vector::borrow(campaigns, i);
                if (campaign.id == campaign_id) {
                    return (true, i)
                };
                i = i + 1;
            };
            
            (false, 0)
        }

        public entry fun initialize_campaigns(account: &signer) acquires GlobalRegistry {
            let addr = signer::address_of(account);
            assert!(!exists<Campaigns>(addr), 0);
            
            // Require GlobalRegistry to exist before initializing campaigns
            assert!(exists<GlobalRegistry>(@DevAddress), 0);
            let registry = borrow_global_mut<GlobalRegistry>(@DevAddress);
            vector::push_back(&mut registry.campaign_creators, addr);
            
            move_to(account, Campaigns {
                campaigns: vector::empty<Campaign>(),
                campaign_count: 0
            });

            move_to(account, CampaignEvents {
                campaign_created_events: account::new_event_handle<CampaignCreatedEvent>(account),
                donation_events: account::new_event_handle<DonationEvent>(account),
                withdrawal_events: account::new_event_handle<WithdrawalEvent>(account),
            });
        }

      public entry fun initialize_global_registry(admin: &signer) {
            let admin_addr = signer::address_of(admin);
            assert!(admin_addr == @DevAddress, E_NOT_OWNER);
            assert!(!exists<GlobalRegistry>(@DevAddress), 0);
            
            move_to(admin, GlobalRegistry {
                campaign_creators: vector::empty<address>(),
            });
        }

        public entry fun initialize_platform_fees(admin: &signer) {
            let admin_addr = signer::address_of(admin);
            assert!(admin_addr == @DevAddress, E_NOT_OWNER);
            
            if (!exists<PlatformFees>(admin_addr)) {
                move_to(admin, PlatformFees {
                    treasury: admin_addr,
                    total_fees_collected: 0,
                });
            };
        }


      public entry fun create_campaign(
            account: &signer,
            title: String,
            description: String,
            link: String,        // Added link parameter
            goal: u64,
            campaign_type: u64 
        ) acquires Campaigns, CampaignEvents {
            let addr = signer::address_of(account);
            let campaigns_ref = borrow_global_mut<Campaigns>(addr);
            
            let campaign_id = campaigns_ref.campaign_count + 1;
            campaigns_ref.campaign_count = campaign_id;

            let new_campaign = Campaign {
                id: campaign_id,
                owner: addr,
                owner_address: addr,
                title: title,
                description,
                link,           // Added link field
                goal,
                balance: 0,
                is_active: true,
                campaign_type,
            };

            vector::push_back(&mut campaigns_ref.campaigns, new_campaign);

            let events_ref = borrow_global_mut<CampaignEvents>(addr);
            event::emit_event(
                &mut events_ref.campaign_created_events,
                CampaignCreatedEvent {
                    owner: addr,
                    campaign_id,
                    title,
                    goal,
                    campaign_type,
                }
            );
        }

       public entry fun donate(
            donor: &signer,
            campaign_owner: address,
            campaign_id: u64,
            amount: u64
        ) acquires Campaigns, CampaignEvents, PlatformFees {
            let campaigns_ref = borrow_global_mut<Campaigns>(campaign_owner);
            
            let (found, campaign_index) = find_campaign_by_id(&campaigns_ref.campaigns, campaign_id);
            assert!(found, E_CAMPAIGN_NOT_FOUND);

            let campaign_ref = vector::borrow_mut(&mut campaigns_ref.campaigns, campaign_index);
            assert!(campaign_ref.is_active, E_CAMPAIGN_NOT_ACTIVE);

            let donor_addr = signer::address_of(donor);
            
            if (campaign_ref.campaign_type == CAMPAIGN_TYPE_SEED_FUNDING) {
                let fee_amount = (amount * SEED_FUNDING_FEE_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
                let donation_amount = amount - fee_amount;
                
                coin::transfer<AptosCoin>(donor, campaign_owner, donation_amount);
                campaign_ref.balance = campaign_ref.balance + donation_amount;
                
                if (fee_amount > 0) {
                    let platform_fees = borrow_global_mut<PlatformFees>(@DevAddress);
                    coin::transfer<AptosCoin>(donor, platform_fees.treasury, fee_amount);
                    platform_fees.total_fees_collected = platform_fees.total_fees_collected + fee_amount;
                };
            } else {
                coin::transfer<AptosCoin>(donor, campaign_owner, amount);
                campaign_ref.balance = campaign_ref.balance + amount;
            };

            let events_ref = borrow_global_mut<CampaignEvents>(campaign_owner);
            event::emit_event(
                &mut events_ref.donation_events,
                DonationEvent {
                    donor: donor_addr,
                    campaign_owner,
                    campaign_id,
                    amount,
                }
            );
        }

        public entry fun withdraw_funds(
            account: &signer,
            campaign_id: u64,
            amount: u64
        ) acquires Campaigns, CampaignEvents {
            let addr = signer::address_of(account);
            let campaigns_ref = borrow_global_mut<Campaigns>(addr);
            
            let (found, campaign_index) = find_campaign_by_id(&campaigns_ref.campaigns, campaign_id);
            assert!(found, E_CAMPAIGN_NOT_FOUND);

            let campaign_ref = vector::borrow_mut(&mut campaigns_ref.campaigns, campaign_index);
            assert!(campaign_ref.owner == addr, E_NOT_OWNER);
            assert!(campaign_ref.balance >= amount, E_INSUFFICIENT_BALANCE);
            assert!(campaign_ref.is_active, E_CAMPAIGN_NOT_ACTIVE);

            campaign_ref.balance = campaign_ref.balance - amount;
            coin::transfer<AptosCoin>(account, addr, amount);

            let events_ref = borrow_global_mut<CampaignEvents>(addr);
            event::emit_event(
                &mut events_ref.withdrawal_events,
                WithdrawalEvent {
                    owner: addr,
                    campaign_id,
                    amount,
                }
            );
        }

       public entry fun close_campaign(
    account: &signer,
    campaign_id: u64
) acquires Campaigns, CampaignEvents {
    let addr = signer::address_of(account);
    let campaigns_ref = borrow_global_mut<Campaigns>(addr);
    
    let (found, campaign_index) = find_campaign_by_id(&campaigns_ref.campaigns, campaign_id);
    assert!(found, E_CAMPAIGN_NOT_FOUND);

    let campaign_ref = vector::borrow_mut(&mut campaigns_ref.campaigns, campaign_index);
    assert!(campaign_ref.owner == addr, E_NOT_OWNER);
    
    // Transfer remaining balance to campaign owner before closing
    if (campaign_ref.balance > 0) {
        let remaining_balance = campaign_ref.balance;
        campaign_ref.balance = 0;
        coin::transfer<AptosCoin>(account, addr, remaining_balance);
        
        // Emit withdrawal event for the remaining balance
        let events_ref = borrow_global_mut<CampaignEvents>(addr);
        event::emit_event(
            &mut events_ref.withdrawal_events,
            WithdrawalEvent {
                owner: addr,
                campaign_id,
                amount: remaining_balance,
            }
        );
    };
    
    campaign_ref.is_active = false;
}

       
        #[view]
        public fun get_campaigns(owner: address): vector<Campaign> acquires Campaigns {
            let campaigns_ref = borrow_global<Campaigns>(owner);
            campaigns_ref.campaigns
        }

        #[view]
        public fun get_active_campaigns(owner: address): vector<Campaign> acquires Campaigns {
            let campaigns_ref = borrow_global<Campaigns>(owner);
            let active_campaigns = vector::empty<Campaign>();
            let i = 0;
            let len = vector::length(&campaigns_ref.campaigns);
            
            while (i < len) {
                let campaign = vector::borrow(&campaigns_ref.campaigns, i);
                if (campaign.is_active) {
                    vector::push_back(&mut active_campaigns, *campaign);
                };
                i = i + 1;
            };
            
            active_campaigns
        }

        #[view]
        public fun get_platform_fees_info(): (address, u64) acquires PlatformFees {
            let platform_fees = borrow_global<PlatformFees>(@DevAddress);
            (platform_fees.treasury, platform_fees.total_fees_collected)
        }

        #[view]
        public fun get_campaign_details(
            owner: address,
            campaign_id: u64
        ): (u64, address, String, String, String, u64, u64, bool, u64) acquires Campaigns {
            let campaigns_ref = borrow_global<Campaigns>(owner);
            let (found, campaign_index) = find_campaign_by_id(&campaigns_ref.campaigns, campaign_id);
            assert!(found, E_CAMPAIGN_NOT_FOUND);

            let campaign = vector::borrow(&campaigns_ref.campaigns, campaign_index);
            (
                campaign.id,
                campaign.owner_address,
                campaign.title,
                campaign.description,
                campaign.link,    // Added link to return tuple
                campaign.goal,
                campaign.balance,
                campaign.is_active,
                campaign.campaign_type
            )
        }

        #[view]
        public fun get_all_campaign_details(): vector<Campaign> acquires Campaigns, GlobalRegistry {
            let all_campaigns = vector::empty<Campaign>();
            
            assert!(exists<GlobalRegistry>(@DevAddress), E_CAMPAIGN_NOT_FOUND);
            
            let registry = borrow_global<GlobalRegistry>(@DevAddress);
            let i = 0;
            let creator_count = vector::length(&registry.campaign_creators);
            
            while (i < creator_count) {
                let creator_addr = *vector::borrow(&registry.campaign_creators, i);
                
                if (exists<Campaigns>(creator_addr)) {
                    let creator_campaigns = borrow_global<Campaigns>(creator_addr);
                    let j = 0;
                    let campaign_count = vector::length(&creator_campaigns.campaigns);
                    
                    while (j < campaign_count) {
                        let campaign = vector::borrow(&creator_campaigns.campaigns, j);
                        vector::push_back(&mut all_campaigns, *campaign);
                        j = j + 1;
                    };
                };
                
                i = i + 1;
            };
            
            all_campaigns
        }
    }
}