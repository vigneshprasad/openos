import {
    CREATE_REPORT,
    DATABASE_QUERY,
    FINANCIAL_DATA,
    GET_HELP,
    ASK_ANALYST,
} from './commandConstants'

import {
    FINANCIAL_REPORT,
    MIS_B2C,
    USER_ACQUISITION,
    USER_ACTIVATION,
    ACTIVE_USERS,
    USER_RETENTION,
    MARKETING_SPEND,
} from './reportConstants'

export const commands = [
    {
        command: `${CREATE_REPORT}: ${FINANCIAL_REPORT}`,
        description: 'Get your financial data',
    },
    {
        command: `${CREATE_REPORT}: ${MIS_B2C}`,
        description: 'Get MIS for a B2C company',
    },
    {
        command: `${CREATE_REPORT}: ${USER_ACQUISITION}`,
        description: 'Get user acquisition data',
    },
    {
        command: `${CREATE_REPORT}: ${USER_ACTIVATION}`,
        description: 'Get user activation data',
    },
    {
        command: `${CREATE_REPORT}: ${ACTIVE_USERS}`,
        description: 'Get active users data',
    },
    {
        command: `${CREATE_REPORT}: ${USER_RETENTION}`,
        description: 'Get user retention data',
    },
    {
        command: `${CREATE_REPORT}: ${MARKETING_SPEND}`,
        description: 'Get marketing spend data',
    },
    {
        command: `${DATABASE_QUERY}`,
        description: 'Query the database',
    },
    {
        command: `${FINANCIAL_DATA}`,
        description: 'Get financial data from Razorpay',
    },
    {
        command: `${GET_HELP}`,
        description: 'Get help from OpenOS team',
    },
    {
        command: `${ASK_ANALYST}`,
        description: 'Ask our analyst a question',
    },
]

