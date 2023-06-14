import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog'
import { CrossCircledIcon } from '@radix-ui/react-icons';
import Image from "next/image"; 
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

export const StripeResourceForm: React.FC = () => {

    const [name, setName] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const { data } = api.stripeResource.getByUserId.useQuery()

    const { track } = useAnalytics();

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])

    const stripeResource = api.stripeResource.create.useMutation({
        onSuccess: (data) => {
            if(data[0]) {
                track(AnalyticsEvents.resource_added, {
                    ...data[0]
                })
                setSuccess(true);
                setError(false);
                setLoading(false);
                setOpen(false)
            } else {
                setSuccess(false);
                setError(true);
                setLoading(false);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);
        track(AnalyticsEvents.resource_form_submitted, {
            type: "Stripe",
            name: name,
        });
        void stripeResource.mutateAsync({
            name: name,
            secret: secret,
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {success ? 
                    <button className="Button bg-[#262626] mt-1 h-9 flex text-[#49C179]" disabled>
                        <Image src="/svg/green_tick.svg" alt="Green Tick" width={16} height={16} />
                        Connected
                    </button> :
                    <button className="Button secondary mt-1 h-9">Connect</button>
                }
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent p-4">
                    <div className="pb-4 flex flex-row justify-between items-center">
                        <text className="text-md text-[#fff]">Connect to Razorpay</text>
                        <Dialog.Close asChild>
                            <CrossCircledIcon color="#C4C4C4" className="cursor-pointer" />
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Name of Resource</span>
                                <input
                                    className="Input" 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Key Secret</span>
                                <input
                                    className="Input"
                                    type="text"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <div className="flex justify-center">
                            {loading ?
                                <button type="submit" disabled className="Button secondary">Loading...</button>
                                :
                                <button type="submit" className="Button primary">Connect</button>
                            }
                        </div>
                        <div className="flex justify-content-end mt-8">
                            {error && <p className="text-red-500">Invalid Secret Key</p>}
                        </div>
                    </form>                    
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};