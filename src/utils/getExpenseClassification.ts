import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";
import natural from 'natural';

type Transaction = {
    date: Date
    description: string
    amount: number
    balance?: number
    purpose?: string
    fee?: number
    tax?: number
}

type Category = 
    "Subscriptions" |
    "Hosting & Infrastructure" |
    "Rent & Utilities" |
    "Marketing & Advertising" |
    "Legal & Professional Services" |
    "Insurance" |
    "Travel & Team Expenses" |
    "Hardware & Equipment" |
    "Employee Benefits" |
    "Training & Development" |
    "Supply Chain Services" |
    "Customer Support" |
    "Salary & Wages" |
    "Taxes" |
    "Professional fees" |
    "Payment Gateway" |
    "Other"

type CategoryMap = {
    transaction: Transaction,
    category: Category
}

export const getExpenseClassification = async (query: string) : Promise<Category> => {
    let prompt = "Classify the following expenditure based on the description shown in bank statement?.\nExamples:\n";
    prompt += `Communication: Twilio, Slack, Zoom\nClassification: Subscriptions\n\n`
    prompt += `Project Management: Trello, Asana, Basecamp\nClassification: Subscriptions\n\n`
    prompt += `CRM: SalesForce, HubSpot, Zoho, Notion\nClassification: Subscriptions\n\n`
    prompt += `Marketing Tools: Hootsuite, Buffer\nClassification: Subscriptions\n\n`
    prompt += `Notification Tools: OneSignal, Customer.io, MailChimp\nClassification: Subscriptions\n\n`
    prompt += `Development: GitHub, GitLab, Atlassian\nClassification: Subscriptions\n\n`
    prompt += `Design: Adobe Creative Cloud, Sketch, Figma, InVision\nClassification: Subscriptions\n\n`
    prompt += `Productivity: Microsoft Office 365, Google Workspace\nClassification: Subscriptions\n\n`
    prompt += `Web Analytics: Google Analytics, Mixpanel, Amplitude\nClassification: Subscriptions\n\n`

    prompt += `Hosting: AWS, Google Cloud Platform, Microsoft Azure\nClassification: Hosting & Infrastructure\n\n`
    prompt += `Domain Registration: NameCheap, GoDaddy, Google Domains\nClassification: Hosting & Infrastructure\n\n`
    prompt += `CDN: Cloudflare, Fastly Akamai\nClassification: Hosting & Infrastructure\n\n`
    
    prompt += `Office Space: WeWork, Regus, Co-Works\nClassification: Rent & Utilities\n\n`
    prompt += `Utilities: Local utility companies for water, electricity and gas\nClassification: Rent & Utilities\n\n`

    prompt += `Online Advertising: Google Ads, Facebook Ads, Twitter Ads\nClassification: Marketing & Advertising\n\n`
    prompt += `Referral Payments"\nClassification: Marketing & Advertising\n\n`

    prompt += `Lawyers: Local law firms, legal service platforms\nClassification: Legal & Professional Services\n\n`
    prompt += `Accountants: Local accounting firms\nClassification: Legal & Professional Services\n\n`
    
    prompt += `Business Insurance Providers: Hiscox, Chubb, The HartFord, PLUM\nClassification: Insurance\n\n`

    prompt += `Flights: Airline companies, Booking platforms\nClassification: Travel & Team Expenses\n\n`
    prompt += `Accommodation: Hotel Chains\nClassification: Travel & Team Expenses\n\n`
    prompt += `Ground Transportation: Uber, Lyft, Car Rental\nClassification: Travel & Team Expenses\n\n`
    prompt += `Meals and Entertainment: Restaurants, cafes, event tickets\nClassification: Travel & Team Expenses\n\n`
    prompt += `Networking and Events: Meetup, EventBrite, Local Chambers of Commerce, Trade shows\nClassification: Travel & Team Expenses\n\n`

    prompt += `Computer & Devices: Apple, Dell, HP\nClassification: Hardware & Equipment\n\n`
    prompt += `Office Furniture: IKEA, Furlenco, Amazon, Flipkart\nClassification: Hardware & Equipment\n\n`
    
    
    prompt += `Health Insurance: UnitedHealthCare, Blue Cross Blue Shield, Cigna, PLUM\nClassification: Employee Benefits\n\n`
    prompt += `Benefits: Provident Fund (PF), Employee State Insurance (ESI) \nClassification: Employee Benefits\n\n`


    prompt += `Online Learning Platforms: Coursera, Udemy, LinkedIn Learning\nClassification: Training & Development\n\n`
    prompt += `Workshops & Conferences: Workshops, Webinars\nClassification: Training & Development\n\n`

    prompt += `UPS FedEx, DHL\nClassification: Supply Chain Services\n\n`

    prompt += `ZenDesk, HelpDesk, FreshDesk, Help Scout\nClassification: Customer Support\n\n`
    prompt += `Live Chat: Intercom, Drift\nClassification: Customer Support\n\n`

    prompt += `Employee salary, wages, employee names\nClassification: Salary and Wages\n\n`
    
    prompt += `TDS, GST, Professional Tax, Advance Tax, TCS Collection - Income Tax Department\nClassification: Taxes\n\n`
    
    prompt += `Professional Services, Consulting, Freelancer\nClassification: Professional Fees\n\n`
    
    prompt += `Razorpay, Stripe, Chargebee\nClassification: Payment Gateway\n\n`
    
    prompt += query + "\nClassification: ";
    const completion = await openai.createCompletion({
        model: COMPLETIONS_MODEL,
        prompt: prompt,
        stop: "\n",
        temperature: 0.6,
        max_tokens: 150
    });
    if(completion?.data?.choices.length > 0) {
        const text = completion?.data?.choices[0]?.text?.trim();
        if(text) {
            const category = text as Category;
            return category
        }
    } 

    return "Other";
}

export const getExpenseClassification2 = (transactions: Transaction[]) : CategoryMap[] => {

    const classifier = new natural.BayesClassifier()
    
    classifier.addDocument('Razorpay, Stripe, Chargebee', 'Payment Gateway');
    classifier.addDocument("Twilio", "Subscription");
    classifier.addDocument("Slack", "Subscription");
    classifier.addDocument("Zoom", "Subscription");
    classifier.addDocument("Trello", "Subscription");
    classifier.addDocument("Asana", "Subscription");
    classifier.addDocument("Basecamp", "Subscription");
    classifier.addDocument("SalesForce", "Subscription");
    classifier.addDocument("HubSpot", "Subscription");
    classifier.addDocument("Zoho", "Subscription");
    classifier.addDocument("Notion", "Subscription");
    classifier.addDocument("Hootsuite", "Subscription");
    classifier.addDocument("Buffer", "Subscription");
    classifier.addDocument("OneSignal", "Subscription");
    classifier.addDocument("Customer.io", "Subscription");
    classifier.addDocument("MailChimp", "Subscription");
    classifier.addDocument("GitHub", "Subscription");
    classifier.addDocument("GitLab", "Subscription");
    classifier.addDocument("Atlassian", "Subscription");
    classifier.addDocument("Adobe Creative Cloud", "Subscription");
    classifier.addDocument("Sketch", "Subscription");
    classifier.addDocument("Figma", "Subscription");
    classifier.addDocument("InVision", "Subscription");
    classifier.addDocument("Microsoft Office 365", "Subscription");
    classifier.addDocument("Google Workspace", "Subscription");
    classifier.addDocument("Google Analytics", "Subscription");
    classifier.addDocument("Mixpanel", "Subscription");
    classifier.addDocument("Amplitude", "Subscription");
    classifier.addDocument("ZenDesk", "Subscription");
    classifier.addDocument("HelpDesk", "Subscription");
    classifier.addDocument("FreshDesk", "Subscription");
    classifier.addDocument("Help Scout", "Subscription");
    classifier.addDocument("Intercom", "Subscription");
    classifier.addDocument("Drift", "Subscription");
    classifier.addDocument("Freshworks", "Subscription");
    classifier.addDocument("FRESHWORKS INC", "Subscription");
    classifier.addDocument("AWS", "Hosting & Infrastructure");
    classifier.addDocument("Google Cloud Platform", "Hosting & Infrastructure");
    classifier.addDocument("Microsoft Azure", "Hosting & Infrastructure");
    classifier.addDocument("NameCheap", "Hosting & Infrastructure");
    classifier.addDocument("GoDaddy", "Hosting & Infrastructure");
    classifier.addDocument("Google Domains", "Hosting & Infrastructure");
    classifier.addDocument("Cloudflare", "Hosting & Infrastructure");
    classifier.addDocument("Fastly Akamai", "Hosting & Infrastructure");
    classifier.addDocument("Google Playstore", "Hosting & Infrastructure");
    classifier.addDocument("Apple App store", "Hosting & Infrastructure");
    classifier.addDocument("WeWork", "Rent");
    classifier.addDocument("Regus", "Rent");
    classifier.addDocument("Co-Works", "Rent");
    classifier.addDocument("Local utility companies for water", "Utilities");
    classifier.addDocument("Electricity or gas providers", "Utilities");
    classifier.addDocument("Internet or broadband providers", "Utilities");
    classifier.addDocument("Phone bill", "Utilities");
    classifier.addDocument("Internet bill", "Utilities");
    classifier.addDocument("Airtel", "Utilities");
    classifier.addDocument("ACT", "Utilities");
    classifier.addDocument("Hatway", "Utilities");
    classifier.addDocument("Vodaphone", "Utilities");
    classifier.addDocument("Google Ads", "Marketing & Advertising");
    classifier.addDocument("Facebook Ads", "Marketing & Advertising");
    classifier.addDocument("Anything contains word Facebook", "Marketing & Advertising");
    classifier.addDocument("Twitter Ads", "Marketing & Advertising");
    classifier.addDocument("Linkedin", "Marketing & Advertising");
    classifier.addDocument("Referral Payments", "Marketing & Advertising");
    classifier.addDocument("PAYUFACEBOOK", "Marketing & Advertising");
    classifier.addDocument("LINKEDIN", "Marketing & Advertising");
    classifier.addDocument("Legal or Law Services", "Professional Services");
    classifier.addDocument("Accounting services", "Professional Services");
    classifier.addDocument("Freelance Services", "Professional Services");
    classifier.addDocument("Consulting", "Professional Services");
    classifier.addDocument("Freelance engineers", "Professional Services");
    classifier.addDocument("Freelance designers", "Professional Services");
    classifier.addDocument("Contracts", "Professional Services");
    classifier.addDocument("Third party transactions (TPT)", "Professional Services");
    classifier.addDocument("Flights", "Travel & Team Expenses");
    classifier.addDocument("Airline companies", "Travel & Team Expenses");
    classifier.addDocument("Booking platforms", "Travel & Team Expenses");
    classifier.addDocument("Uber", "Travel & Team Expenses");
    classifier.addDocument("Ola", "Travel & Team Expenses");
    classifier.addDocument("Hotel Expenses", "Travel & Team Expenses");
    classifier.addDocument("Lyft", "Travel & Team Expenses");
    classifier.addDocument("Car Rental", "Travel & Team Expenses");
    classifier.addDocument("Meals and Entertainment", "Travel & Team Expenses");
    classifier.addDocument("Event tickets", "Travel & Team Expenses");
    classifier.addDocument("Meetup", "Travel & Team Expenses");
    classifier.addDocument("EventBrite", "Travel & Team Expenses");
    classifier.addDocument("Trade shows", "Travel & Team Expenses");
    classifier.addDocument("Dunzo", "Travel & Team Expenses");
    classifier.addDocument("Computer & Devices", "Hardware & Equipment");
    classifier.addDocument("Apple", "Hardware & Equipment");
    classifier.addDocument("Dell", "Hardware & Equipment");
    classifier.addDocument("HP", "Hardware & Equipment");
    classifier.addDocument("Amazon orders", "Hardware & Equipment");
    classifier.addDocument("Flipkart orders", "Hardware & Equipment");
    classifier.addDocument("IKEA", "Hardware & Equipment");
    classifier.addDocument("Hiscox", "Employee Benefits");
    classifier.addDocument("Chubb", "Employee Benefits");
    classifier.addDocument("The Hartford", "Employee Benefits");
    classifier.addDocument("PLUM", "Employee Benefits");
    classifier.addDocument("Health Insurance", "Employee Benefits");
    classifier.addDocument("UnitedHealthCare", "Employee Benefits");
    classifier.addDocument("Blue Cross Blue Shield", "Employee Benefits");
    classifier.addDocument("Cigna", "Employee Benefits");
    classifier.addDocument("Provident Fund (PF)", "Employee Benefits");
    classifier.addDocument("Employee State Insurance (ESI)", "Employee Benefits");
    classifier.addDocument("Coursera", "Training & Development");
    classifier.addDocument("Udemy", "Training & Development");
    classifier.addDocument("Workshops", "Training & Development");
    classifier.addDocument("Webinars", "Training & Development");
    classifier.addDocument("Employee salary", "Salary and Wages");
    classifier.addDocument("Wages", "Salary and Wages");
    classifier.addDocument("Remuneration", "Salary and Wages");
    classifier.addDocument("Stipend", "Salary and Wages");
    classifier.addDocument("Reimbursement", "Reimbursement");
    classifier.addDocument("Petty cash", "Reimbursement");
    classifier.addDocument("TDS", "Taxes");
    classifier.addDocument("GST", "Taxes");
    classifier.addDocument("Professional Tax", "Taxes");
    classifier.addDocument("Advance Tax", "Taxes");
    classifier.addDocument("TCS Collection - Income Tax Department", "Taxes");
    classifier.addDocument("Markup charged by bank", "Taxes");
    classifier.addDocument("TXN", "Taxes");
    classifier.addDocument("Any fee paid to government eg SBIEPYMAHARASHTRASAL", "Taxes");
    classifier.addDocument("Transaction fee charged by gateways like Razorpay", "Payment Gateway");
    classifier.addDocument("Stripe", "Payment Gateway");
    classifier.addDocument("Chargebee", "Payment Gateway");
    classifier.addDocument("Paypal", "Payment Gateway");
    classifier.addDocument("Paytm", "Payment Gateway");
    classifier.addDocument("Autopay CC", "Credit Card");
    classifier.addDocument("Credit Card", "Credit Card");
    classifier.addDocument("Swiggy", "Food & Beverages");
    classifier.addDocument("Zomato", "Food & Beverages");
    
    classifier.train()

    const categoryMap:CategoryMap[] = []
    for(const transaction of transactions) {
        categoryMap.push({
            transaction,
            category: classifier.classify(transaction.description) as Category
        })
    }

    return categoryMap
    
}