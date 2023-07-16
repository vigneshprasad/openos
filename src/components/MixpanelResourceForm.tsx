import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog'
import { CrossCircledIcon } from '@radix-ui/react-icons';
import Image from "next/image";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";
import { PrimaryButton } from "./PrimaryButton";

export const MixpanelResourceForm: React.FC = () => {

    const [projectId, setProjectId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [region, setRegion] = useState("US")
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const { data } = api.mixpanelResource.getByUserId.useQuery()
    const { track }  = useAnalytics();

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])

    const mixpanelResource = api.mixpanelResource.create.useMutation({
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
            type: "Mixpanel",
            projectId: projectId,
            username: username,
        });
        void mixpanelResource.mutateAsync({
            projectId: projectId,
            username: username,
            secret: secret,
            region: region,
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {success ? 
                    <button className="bg-primary/10 text-[#49C179] rounded-md mt-3 py-2 px-3
                    font-normal text-xs flex gap-1.5" disabled>
                        <Image src="/svg/green_tick.svg" alt="Green Tick" width={15} height={15} />
                        Connected
                    </button> :
                    <button className="bg-primary/10 text-primary rounded-md mt-3 py-2 px-3
                    font-normal text-xs flex gap-1.5
                    hover:bg-primary/20 cursor-pointer"
                    >
                        Connect
                    </button>
                }
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent p-4">
                    <div className="pb-4 flex flex-row justify-between items-center">
                        <text className="text-md text-[#242533]">Connect to Mixpanel</text>
                        <Dialog.Close asChild>
                            <CrossCircledIcon color="#C4C4C4" className="cursor-pointer" />
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Project Id</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full" 
                                    type="text"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Username</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full" 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Password</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full" 
                                    type="text"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Region</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full" 
                                    type="text"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <div className="flex justify-center">
                            {loading ?
                                <PrimaryButton type="submit" disabled className="mt-8">Loading...</PrimaryButton>
                                :
                                <PrimaryButton type="submit" className="mt-8">Connect</PrimaryButton>
                            }
                        </div>
                        <div className="flex justify-content-end mt-8">
                            {error && <p className="text-red-500">Error Please try again</p>}
                        </div>
                    </form>                    
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};