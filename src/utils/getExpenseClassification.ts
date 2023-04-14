import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";
import natural from 'natural';
import { EXPENSE_CLASSIFIER } from "~/constants/commandConstants";

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
    let prompt = "Prompt: I am going to give you transactions from a bank statement. Along side that I am giving you a list of 15 categories. Based on these categories, I want you to classify the transactions into the 15 categories. Along side the categories I am giving you a list of example for a type of transaction that would fall into the category.\n\n";
    prompt += "Classifications:\n"
    prompt += "1. Classification: Subscriptions\n"
    prompt += "Examples: Twilio, Slack, Zoom, Trello, Asana, Basecamp, SalesForce, HubSpot, Zoho, Notion, Hootsuite, Buffer, OneSignal, Customer.io, MailChimp, GitHub, GitLab, Atlassian, Adobe Creative Cloud, Sketch, Figma, InVision, Microsoft Office 365, Google Workspace, Google Analytics, Mixpanel, Amplitude, ZenDesk, HelpDesk, FreshDesk, Help Scout, Intercom, Drift, Freshworks, FRESHWORKS INC\n"
    prompt += "2.Classification: Hosting & Infrastructure\n"
    prompt += "Examples: AWS, Google Cloud Platform, Microsoft Azure, NameCheap, GoDaddy, Google Domains, Cloudflare, Fastly Akamai, Google Playstore, Apple App store, GOOGL\n"
    prompt += "3.Classification: Rent\n"
    prompt += "Examples: WeWork, Regus, Co-Works\n"
    prompt += "4. Classification: Utilities\n"
    prompt += "Examples: Local utility companies for water, electricity. gas, Internet or broadband providers, phone bill, internet bill, Airtel, ACT, Hathway, Vodafone\n"
    prompt += "5. Classification: Marketing & Advertising\n"
    prompt += "Examples: Google Ads, Facebook Ads, Anything contains word Facebook, Twitter Ads, Linkedin, Referral Payments, PAYUFACEBOOK, LINKEDIN\n"
    prompt += "6. Professional Services\n"
    prompt += "Examples: Legal or Law Services, Accounting services, Freelance Services, Consulting, Freelance engineers, Freelance designers, Contracts, third party transactions (TPT)\n"
    prompt += "7. Classification: Travel & Team Expenses\n"
    prompt += "Examples: Flights, Airline companies, Booking platforms, Uber, Ola, Hotel Expenses, Lyft, Car Rental, Meals and Entertainment, event tickets, Meetup, EventBrite, Trade shows, Dunzo,\n"
    prompt += "8.Classification: Hardware & Equipment\n"
    prompt += "Examples: Computer & Devices, Apple, Dell, HP, Amazon orders, Flipkart orders, IKEA\n"
    prompt += "9. Classification: Employee Benefits\n"
    prompt += "Examples: Hiscox, Chubb, The HartFord, PLUM, Health Insurance, UnitedHealthCare, Blue Cross Blue Shield, Cigna, PLUM, Provident Fund (PF), Employee State Insurance (ESI)\n"
    prompt += "10.Classification: Training & Development\n"
    prompt += "Examples: Coursera, Udemy, Workshops, Webinars\n"
    prompt += "11.Classification: Salary and Wages\n"
    prompt += "Examples: Employee salary, wages, remuneration, stipend, reimbursement, petty cash\n"
    prompt += "12.Classification: Taxes\n"
    prompt += "Examples: TDS, GST, Professional Tax, Advance Tax, TCS Collection - Income Tax Department, Markup charged by bank, TXN, Any fee paid to government eg SBIEPYMAHARASHTRASAL\n"
    prompt += "13. Classification: Payment Gateway\n"
    prompt += "Examples: Transaction fee charged by gateways like Razorpay, Stripe, Chargebee, Paypal, Paytm\n"
    prompt += "14. Classification: Credit Card\n"
    prompt += "Examples: Autopay CC, Credit Card, CC\n"
    prompt += "15. Classification: Food & Beverages\n"
    prompt += "Examples: Swiggy, Zomato, Zepto, Uber Eats, Restaurants, Cafes\n"
    
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

export const getExpenseClassificationTest = async () => {
    let prompt = "Prompt: I am going to give you transactions from a bank statement. Along side that I am giving you a list of 15 categories. Based on these categories, I want you to classify the transactions into the 15 categories. Along side the categories I am giving you a list of example for a type of transaction that would fall into the category.\n\n";
    prompt += "Classifications:\n"
    prompt += "1. Classification: Subscriptions\n"
    prompt += "Examples: Twilio, Slack, Zoom,Trello, Asana, Basecamp,SalesForce, HubSpot, Zoho, Notion,Hootsuite, Buffer,OneSignal, Customer.io, MailChimp,GitHub, GitLab, Atlassian,Adobe Creative Cloud, Sketch, Figma, InVision,Microsoft Office 365, Google Workspace,Google Analytics, Mixpanel, Amplitude,ZenDesk, HelpDesk, FreshDesk, Help Scout,Intercom, Drift, Freshworks, FRESHWORKS INC\n"
    prompt += "2.Classification: Hosting & Infrastructure\n"
    prompt += "Examples: AWS, Google Cloud Platform, Microsoft Azure,NameCheap, GoDaddy, Google Domains,Cloudflare, Fastly Akamai, Google Playstore, Apple App store,GOOGL\n"
    prompt += "3.Classification: Rent\n"
    prompt += "Examples: WeWork, Regus, Co-Works\n"
    prompt += "4. Classification: Utilities\n"
    prompt += "Examples: Local utility companies for water, electricity. gas, Internet or broadband providers, phone bill, internet bill, Airtel, ACT, Hatway, Vodafone\n"
    prompt += "5. Classification: Marketing & Advertising\n"
    prompt += "Examples: Google Ads, Facebook Ads, Anything contains word Facebook, Twitter Ads, Linkedin,Referral Payments, PAYUFACEBOOK, LINKEDIN\n"
    prompt += "6. Professional Services\n"
    prompt += "Examples: Legal or Law Services, Announting services, Freelance Services,Consulting, Freelance engineers, Freelance designers, Contracts, third party transactions (TPT)\n"
    prompt += "7. Classification: Travel & Team Expenses\n"
    prompt += "Examples: Flights, Airline companies, Booking platforms, Uber, Ola, Hotel Expenses,Lyft, Car Rental, Meals and Entertainment,event tickets,Meetup, EventBrite, Trade shows, Dunzo,\n"
    prompt += "8.Classification: Hardware & Equipment\n"
    prompt += "Examples: Computer & Devices, Apple, Dell, HP, Amazon orders, Flipkard orders, IKEA\n"
    prompt += "9. Classification: Employee Benefits\n"
    prompt += "Examples: Hiscox, Chubb, The HartFord, PLUM, Health Insurance, UnitedHealthCare, Blue Cross Blue Shield, Cigna, PLUM,Provident Fund (PF), Employee State Insurance (ESI)\n"
    prompt += "10.Classification: Training & Development Examples: Coursera, Udemy,Workshops, Webinars\n"
    prompt += "11.Classification: Salary and Wages\n"
    prompt += "Examples: Employee salary, wages, remuneration, stipend,reimbursement,petty cash\n"
    prompt += "12.Classification: Taxes\n"
    prompt += "Examples: TDS, GST, Professional Tax, Advance Tax, TCS Collection - Income Tax Department, Markup charged by bank, TXN, Any fee paid to government eg SBIEPYMAHARASHTRASAL\n"
    prompt += "13. Classification: Payment Gateway\n"
    prompt += "Examples: Transaction fee charged by gateways like Razorpay, Stripe, Chargebee, Paypal, Paytm\n"
    prompt += "14. Classification: Credit Card\n"
    prompt += "Examples: Autopay CC, Credit Card, CC\n"
    prompt += "15. Classification: Food & Beverages\n"
    prompt += "Examples: Swiggy, Zomato, Zepto, Uber Eats,Restaurants, Cafes\n"

    console.log(prompt);

    const inputs = [
        "POS 416021XXXXXX8504 GOOGLE *TEMPORAR",
        "POS 416021XXXXXX8504 GOOGLE *TEMPORAR",
        "KQSXI44OANZ2FOO3CA/PAYUFACEBOOK",
        "POS 416021XXXXXX8504 TWILIO INC",
        "NEFT CR-SCBL0036001-SCB NODAL ACCOUNT --WURKNET PRIVATE LIMITED-SSG17413Q0624069",
        "KQSXI4EKBN4KBP6UCU/PAYUFACEBOOK",
        "POS 416021XXXXXX8504 TWILIO INC",
        "1025806274917279/TOMGOOGLEINDIA",
        "ME DC SI 416021XXXXXX8504 GOOGLE CLOUD",
        "POS 416021XXXXXX8504 TWILIO INC",
        "50200057895641-TPT-SOFTWARE DEV-VIZKR",
        "50200051557236-TPT-PROF FEES-R K DESAI AND CO",
        "KQSXI4MKAF72DPWSCA/PAYUFACEBOOK",
        "POS 416021******8504 RVSL DT - 28/03/22",
        "POS 416021XXXXXX8504 TWILIO INC",
        "NEFT DR-UBIN0816965-P YASHWANTH SAI-NETBANK, MUM-N097221908311107-SALARY MAR22",
        "KQSXI7UPAR6KHP6WCA/PAYUFACEBOOK",
        "NEFT CR-SCBL0036001-SCB NODAL ACCOUNT --WURKNET PRIVATE LIMITED-SSG17413Q0631237",
        "0801762199412/SBIEPYMAHARASHTRASAL",
        "3781945764022/SBIEPYMAHARASHTRASAL",
        "POS 416021XXXXXX8504 TWILIO INC",
        "JHAGQBASS2YGQ0/RAZPSWIGGY",
        "KQSXI74LAF6KFNG2CY/PAYUFACEBOOK",
        "POS 416021XXXXXX8504 FRESHWORKS INC",
        "POS 416021XXXXXX8504 TWILIO INC",
        "IB BILLPAY DR-HDFCRM-555153XXXXXX1471",
        "NEFT CR-SCBL0036001-SCB NODAL ACCOUNT --WURKNET PRIVATE LIMITED-SSG17413Q0636371",
        "KQSH25UFAZ525PG2CQ/PAYUFACEBOOK",
        "POS 416021XXXXXX8504 TWILIO INC",
        "NEFT CR-SCBL0036001-SCB NODAL ACCOUNT --WURKNET PRIVATE LIMITED-SSG17413Q0638979",
        "NEFT DR-KKBK0000286-TARUN SINGH-NETBANK, MUM-N103221917097201-SALARY MAR22",
        "NEFT DR-KKBK0000286-TARUN SINGH-NETBANK, MUM-N103221917107813-SALARY APR22",
        "NEFT DR-SBIN0015474-VAIBHAV SITARAM CHAVAN-NETBANK, MUM-N103221917108904-CONTENT CREATION",
        "5201361044128/SBIEPYMAHARASHTRASAL",
        "KQSH254IAF52BOOTD4/PAYUFACEBOOK",
        "ME DC SI 416021XXXXXX8504 FACEBOOK",
        "POS 416021XXXXXX8504 TWILIO INC",
        "CRV POS-416021******8504-    -GOOGLE CLO",
        "CRV POS-416021******8504-    -FRESHWORKS",
        "POS 416021XXXXXX8504 PAYU-PAYUINDIA.A",
        "POS 416021XXXXXX8504 TWILIO INC",
        "IMPS-210520523433-AC VALIDATION GPAY-K-IDFB-XXXXXXX6979-BANKACCOUNTVERIFICATIONTRANSACTIONBANKACCOUNTVALID",
        "KQSH25EPA5Z2HNGUCA/PAYUFACEBOOK",
        "CC 000555153XXXXXX1471 AUTOPAY SI-TAD",
        "POS 416021XXXXXX8504 ACTBANGALORE",
        "CRV POS-416021******8504-    -FACEBOOK",
    ]

    const classification = []

    for(const input of inputs) {
        const newPrompt = prompt + input + "\nClassification: ";
        const completion = await openai.createCompletion({
            model: COMPLETIONS_MODEL,
            prompt: newPrompt,
            stop: "\n",
            temperature: 0.6,
            max_tokens: 150
        });
        if(completion?.data?.choices.length > 0) {
            const text = completion?.data?.choices[0]?.text?.trim();
            if(text) {
                const category = text as Category;
                classification.push({
                    input,
                    category
                })
                console.log(input, "###", category)
            }
        } 
    }
    return {
        type: EXPENSE_CLASSIFIER,
        data: [
            classification,
            undefined
        ]
    }
}
