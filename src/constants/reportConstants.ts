export const MIS_B2C = 'mis b2c';
export const MIS_SUBSCRIPTION = 'mis subscription';
export const MIS_TRANSACTION = 'mis transaction revenue';
export const FINANCIAL_REPORT = 'financial report';

export const USER_ACQUISITION = 'user acquisition';
export const USER_ACTIVATION = 'user activation';
export const ACTIVE_USERS = 'active users';
export const USER_RETENTION = 'user retention';
export const MARKETING_SPEND = 'marketing spend';

export const SAVED_TEMPLATES = [
    {
        key: "b2cmis",
        title: "B2C-MIS",
        description: "MIS: User activation, user acquisition, retention & other metrics",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=0",
        status: true, 
        command: "create-report: mis b2c",
        tags: ["SQL", "Marketing", "Financial"]
    },
    {
        key: "financialstatement",
        title: "Financial Statement",
        description: "Classification of expenses & revenue transactions",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=1046385822",
        status: true, 
        command: "create-report: financial report",
        tags: ["Financial"]
    },
    {
        key: "useracquisition",
        title: "User Acquisition",
        description: "Track your user acquisition by source over time",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=182950901",
        status: true, 
        command: "create-report: user acquisition", 
        tags: ["SQL", "Marketing", "Financial"]
    },
    {
        key: "useractivation",
        title: "User Activation",
        description: "Track your user journey & conversion ratios",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=523591320",
        status: true,
        command: "create-report: user activation", 
        tags: ["SQL", "Marketing"]
    },
    {
        key: "userretention",
        title: "User Retention",
        description: "Track how users retain in your app from Day 1 to Day 30",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=43868196",
        status: true, 
        command: "create-report: user retention", 
        tags: ["SQL", "Marketing"]
    },
    {
        key: "activeusers",
        title: "Active Users",
        description: "Track how many users are actively engaging with your product",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=598181125",
        status: true, 
        command: "", 
        tags: ["SQL"]
    },
    {
        key: "useracquisitioncost",
        title: "Cost of user acquistion",
        description: "Track your marketing spend across channels over time",
        preview: "https://docs.google.com/spreadsheets/d/1ilNhaVxpwt-xhdrkxVC_1xAUcwrbs7YZM1JLZiIGJ9c/edit#gid=2017282389",
        status: true, 
        command: "create-report: user acquisition", 
        tags: ["Marketing", "Financial"]
    }
]
