export const getOrderIdFromString = (query: string) : string | undefined => {

    const orderId = query.match(/order_+[a-zA-Z0-9._+-]*/g);
    if(orderId && orderId.length > 0) {
        return orderId[0];
    }
    return undefined;

}