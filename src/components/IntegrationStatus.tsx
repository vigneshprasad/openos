import { useEffect, useState } from "react";
import { api } from "~/utils/api";

export const IntegrationStatus: React.FC = () => {

    const [databaseResource, setDatabaseResource] = useState(false);
    const [razorpayResource, setRazorpayResource] = useState(false);
    const [stripeResource, setStripeResource] = useState(false);
    const [bankStatementResource, setBankStatementResource] = useState(false);
    const [mixpanelresource, setMixpanelresource] = useState(false);

    const integrations = api.user.integrationList.useQuery();
    
    useEffect(() => {
        if (integrations) {
            setDatabaseResource(integrations.data?.database ? true : false);
            setRazorpayResource(integrations.data?.razorpay ? true : false);
            setBankStatementResource(integrations.data?.bankStatement ? true : false);
            setStripeResource(integrations.data?.stripe ? true : false);
            setMixpanelresource(integrations.data?.mixpanel ? true : false);
        }
    }, [integrations])

    return (
        <div className="flex gap-2 items-center ml-3">
            <h3>Integration Status</h3>
            {databaseResource && <div className="bg-success-badge px-3 py-1 rounded-full">Database</div>}
            {razorpayResource && <div className="bg-success-badge px-3 py-1 rounded-full">RazorPay</div>}
            {stripeResource && <div className="bg-success-badge px-3 py-1 rounded-full">Stripe</div>}
            {bankStatementResource && <div className="bg-success-badge px-3 py-1 rounded-full">Bank Statement</div>}
            {mixpanelresource && <div className="bg-success-badge px-3 py-1 rounded-full">Mixpanel</div>}
        </div>
    );
}
