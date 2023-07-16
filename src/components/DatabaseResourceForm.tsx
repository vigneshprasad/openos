import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog'
import { CrossCircledIcon } from '@radix-ui/react-icons';
import Image from "next/image";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";
import { PrimaryButton } from "./PrimaryButton";

interface IProps {
    type: string
}

export const DatabaseResourceForm: React.FC<IProps> = ({type}) => {

    const [name, setName] = useState<string>("");
    const [host, setHost] = useState<string>("");
    const [port, setPort] = useState<string>("");
    const [dbName, setDbName] = useState<string>("");
    const [dbUsername, setDbUsername] = useState<string>("");
    const [dbPassword, setDbPassword] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const {data} = api.databaseResource.getByType.useQuery(type)

    const { track } = useAnalytics();

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])

    const createDatabaseResource = api.databaseResource.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.resource_added, {
                ...data
            });
            setSuccess(true);
            setError(false);
            setLoading(false);
            setOpen(false);
        },
        onError: (e) => {
            setSuccess(false);
            setError(true);
            setErrorMessage("Error: " + e.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);
        track(AnalyticsEvents.resource_form_submitted, {
            type: "Database",
            name: name,
            host: host,
            port: port,
            dbName: dbName,
            databaseType: type,
        })
        void createDatabaseResource.mutateAsync({
            name: name,
            host: host,
            port: Number(port),
            dbName: dbName,
            dbUsername: dbUsername,
            dbPassword: dbPassword,
            type: type,
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {success ? 
                    <button className="bg-primary/10 text-[#49C179] rounded-md mt-3 py-2 px-3
                    font-normal text-xs flex gap-1.5" disabled>
                        <Image src="/svg/green_tick.svg" alt="Green Tick" width={10} height={10} />
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
                        <text className="text-md text-[#242533]">Connect to {type}</text>
                        <Dialog.Close asChild>
                            <CrossCircledIcon color="#C4C4C4" className="cursor-pointer" />
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit}>
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
                                <span className="text-[#242533]">Host</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full" 
                                    type="text"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Port</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="number"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Database Name</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="text"
                                    value={dbName}
                                    onChange={(e) => setDbName(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Username</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="text"
                                    value={dbUsername}
                                    onChange={(e) => setDbUsername(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span className="text-[#242533]">Password</span>
                                <input
                                    className="bg-slate-50 rounded-lg p-2 pl-3 w-full"
                                    type="password"
                                    value={dbPassword}
                                    onChange={(e) => setDbPassword(e.target.value)}
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
                            {success && <p className="text-green-500">Success</p>}
                            {error && <p className="text-red-500">{errorMessage}</p>}
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};