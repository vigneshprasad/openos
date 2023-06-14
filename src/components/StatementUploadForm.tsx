import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog';
import { CrossCircledIcon } from '@radix-ui/react-icons';
// import { type Transaction } from "@prisma/client";
import Image from "next/image";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

export const StatementUploadForm: React.FC = () => {    
    const [name, setName] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileSelected, setFileSelected] = useState<File | undefined>();
    const [presignedUrl, setPresignedUrl] = useState("");
    // const [transactionData, setTransactionData] = useState<Transaction[]>([]);
    const [open, setOpen] = useState(false);

    const {data} = api.bankStatement.getByUserId.useQuery();
    const { track } = useAnalytics();

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])
    
    const bankStatement = api.bankStatement.create.useMutation({
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
                type: "Bank Statement",
                name: name,
            });
            void await bankStatement.mutateAsync({
                name: name,
                url: url,
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
                        <text className="text-md text-[#fff]">Add Bank Statement</text>
                        <Dialog.Close asChild>
                            <CrossCircledIcon color="#C4C4C4" className="cursor-pointer" />
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        <input 
                            type="file" 
                            className="block w-full text-sm text-[#C4C4C4] file:mr-6 
                            file:py-2 file:px-2 file:rounded-full file:border-0 file:text-sm file:bg-[#373737]
                            file:text-[#fff] hover:file:bg-[#202020] file:cursor-pointer"
                            onChange={handleFileUpload}
                        />
                        <div className="pt-2 flex justify-center">
                            {loading ?
                                <button type="submit" disabled className="Button secondary">Loading...</button>
                                :
                                <button type="submit" className="Button primary">Connect</button>
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