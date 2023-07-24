import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import Image from "next/image";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";
import { PrimaryButton } from "./PrimaryButton";

export const GoogleAnalyticsForm: React.FC = () => {    
    const [name, setName] = useState<string>("");
    const [viewId, setViewId] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileSelected, setFileSelected] = useState<File | undefined>();
    const [presignedUrl, setPresignedUrl] = useState("");
    const [open, setOpen] = useState(false);

    const {data} = api.googleAnalyticsRouter.getByUserId.useQuery();
    const { track } = useAnalytics();

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])
    
    const googleAnalyticsMutation = api.googleAnalyticsRouter.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.resource_added, {
                ...data
            })
            setSuccess(true);
            setError(false);
            setLoading(false);
            setOpen(false)
        },
        onError: () => {
            setSuccess(false);
            setError(true);
            setLoading(false);
        },
    });

    const presignedUrlMutation = api.aws.getPresignedUrl.useMutation({
        onSuccess: (result) => {
            setPresignedUrl(result)
        },
        onError: () => {
            setError(true);
            setLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);
        if(!name) {
            setError(true);
            setLoading(false);
            return;
        }
        await presignedUrlMutation.mutateAsync({
            name: name,
        });
        if(!fileSelected || !presignedUrl) {
            setError(true);
            setLoading(false);
            return;
        }
        const result = await fetch(presignedUrl, {
            method: 'PUT',
            body: fileSelected,
        })
        const url = result.url.split('?')[0];
        if(result.status === 200 && url) {
            track(AnalyticsEvents.resource_form_submitted, {
                type: "Google Analytics",
                name: name,
            });
            void await googleAnalyticsMutation.mutateAsync({
                name: name,
                credentialsUrl: url,
                viewId: viewId,
            });
            // setTransactionData(transactions);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const fileList = e.target?.files;
        if(!fileList) return;
        setFileSelected(fileList[0]);
    }

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
                    <div className="pb-8 flex flex-row justify-between items-center">
                        <text className="text-md text-[#242533]">Add Bank Statement</text>
                        <Dialog.Close asChild>
                            <CrossCircledIcon color="#C4C4C4" className="cursor-pointer" />
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Name of Resource</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">View ID</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="text"
                                    value={viewId}
                                    onChange={(e) => setViewId(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Credentials JSON</span>
                                <input 
                                    type="file" 
                                    className="block w-full text-[#242533] file:mr-6 
                                    file:py-2 file:px-2 text-xs file:border-0 file:rounded-md file:bg-primary/10
                                    file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                                    onChange={handleFileUpload}
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
                    </form>
                    
                    <div className="flex justify-content-end mt-8">
                        {error && <p className="text-red-500">Error. Please try again</p>}
                    </div>
                    {/* {transactionData.length > 0 && <div className="h-72 overflow-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            {transactionData.map((transaction) => {
                                return (
                                    <tr key={transaction.id}>
                                        <td>{transaction.description}</td>
                                        <td>{transaction.amount.toString()}</td>
                                        <td>{transaction.date.toDateString()}</td>
                                        <td>{transaction.category}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </div>} */}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};