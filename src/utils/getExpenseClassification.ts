import { COMPLETIONS_MODEL } from "~/constants/openAi";
import { openai } from "~/server/services/openai";

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


export const getExpenseClassification = async (query: string) : Promise<Category> => {
    let prompt = "Classify the following expenditure based on the description shown in bank statement?.\nExample:\n";
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
        temperature: 1,
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



 

