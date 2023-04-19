import { APIClient } from 'customerio-node'

export const client = new APIClient(
    process.env.CUSTOMER_IO_API_KEY as string
);