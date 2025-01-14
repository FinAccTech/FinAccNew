export const menuTree =[
    {
        Caption:"Loans/ Pledges",
        Icon:"fa-solid fa-landmark",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Loans", Iconn: "", RouterLink:"loans/2"   },
            {   Caption: "Receipts", Iconn: "", RouterLink:"receipts/2" },
            {   Caption: "Redemptions", Iconn: "", RouterLink:"redemptions"   },
            // {   Caption: "Transfers", Iconn: "", RouterLink:""   },
            {   Caption: "Auctions", Iconn: "", RouterLink:"auctions"   },
            {   Caption: "ReLoan", Iconn: "", RouterLink:"reloans"   },
            
            {   Caption: "```````````````````", Iconn: "", RouterLink:""},

            {   Caption: "Opening Loans", Iconn: "", RouterLink:"loans/1"   },
            {   Caption: "Opening Receipts", Iconn: "", RouterLink:"receipts/1"   },            
        ]
    },

    {
        Caption:"Masters",
        Icon:"fa-solid fa-box",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Item Groups", Iconn: "", RouterLink:"itemgroups" },
            {   Caption: "Items", Iconn: "", RouterLink:"items" },
            {   Caption: "Customers", Iconn: "", RouterLink:"parties/1" },
            {   Caption: "Suppliers", Iconn: "", RouterLink:"parties/2" },
            {   Caption: "Purity", Iconn: "", RouterLink:"purities" },
            {   Caption: "Areas", Iconn: "", RouterLink:"areas" },
            {   Caption: "Schemes", Iconn: "", RouterLink:"schemes" },
            {   Caption: "Locations", Iconn: "", RouterLink:"locations" },
        ]
    },

    {
        Caption:"Repledge",
        Icon:"fa-solid fa-repeat",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Repledges", Iconn: "", RouterLink:"repledges/2"   },
            {   Caption: "RP Payments", Iconn: "", RouterLink:"rppayments/2"   },
            {   Caption: "Rp Closures", Iconn: "", RouterLink:"rpclosures"   },     
            
            {   Caption: "```````````````````", Iconn: "", RouterLink:""},

            {   Caption: "Opening Repledges", Iconn: "", RouterLink:"repledges/1"   },
            {   Caption: "Opening RpPayments", Iconn: "", RouterLink:"rppayments/1"   },            

            {   Caption: "```````````````````", Iconn: "", RouterLink:""},
            {   Caption: "Supplier History", Iconn: "", RouterLink:"supplierhistory"   },            

        ]
    },

    {
        Caption:"Reports",
        Icon:"fa-solid fa-chart-simple",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Day History", Iconn: "", RouterLink:"dayhistory"   },
            {   Caption: "Loan Summary", Iconn: "", RouterLink:"loansummary" },
            {   Caption: "Customer History", Iconn: "", RouterLink:"customerhistory" },
            {   Caption: "Loan History", Iconn: "", RouterLink:"loanhistory"   },
            {   Caption: "Auction History", Iconn: "", RouterLink:"auctionhistory"   },
            {   Caption: "Pending Report", Iconn: "", RouterLink:"pendingreport"   },
            {   Caption: "Age Analysis", Iconn: "", RouterLink:"ageanalysis"   },
            {   Caption: "Market Value Analysis", Iconn: "", RouterLink:"marketvalueanalysis"   },
            {   Caption: "Int Statement Custom", Iconn: "", RouterLink:"intstatementcustom"   },
            
        ]
    },

    {
        Caption:"Accounts",        
        Icon:"fa fa-book",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Ledger Groups", Iconn: "", RouterLink:"ledgergroups" },
            {   Caption: "Ledgers", Iconn: "", RouterLink:"ledgers" },
            {   Caption: "Vouchers", Iconn: "", RouterLink:"vouchers" },
            {   Caption: "```````````````````", Iconn: "", RouterLink:""},
            {   Caption: "Day Book", Iconn: "", RouterLink:"daybook" },
            {   Caption: "Group Summary", Iconn: "", RouterLink:"groupsummary" },
            {   Caption: "Trial Balance", Iconn: "", RouterLink:"trialbalance" },
            {   Caption: "Profit and Loss", Iconn: "", RouterLink:"profitandloss" },
            {   Caption: "Balance Sheet", Iconn: "", RouterLink:"balancesheet" },
        ]
    },

    {
        Caption:"Settings",
        Icon:"fa fa-cogs",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Voucher Series", Iconn: "", RouterLink:"voucherseries"   },
            {   Caption: "App Setup", Iconn: "", RouterLink:"appsetup"   },
            {   Caption: "Users", Iconn: "", RouterLink:"users"   },
            {   Caption: "Print Setup", Iconn: "", RouterLink:"printsetup"   },
            {   Caption: "Alert Setup", Iconn: "", RouterLink:"alertsetup"   },
            {   Caption: "Reposting Vouchers", Iconn: "", RouterLink:"voucherposting"   },
            // {   Caption: "General Setup", Iconn: "", RouterLink:""   },
            // {   Caption: "Accounts Setup", Iconn: "", RouterLink:""   },
            // {   Caption: "Users and Security", Iconn: "", RouterLink:""   },
            // {   Caption: "SMS Setup", Iconn: "", RouterLink:""   },            
        ]
    }
]