import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog'
import { CrossCircledIcon } from '@radix-ui/react-icons';
import Image from "next/image";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

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
                        <text className="text-md text-[#fff]">Connect to {type}</text>
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
                                <span>Host</span>
                                <input
                                    className="Input" 
                                    type="text"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Port</span>
                                <input
                                    className="Input"
                                    type="number"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Database Name</span>
                                <input
                                    className="Input"
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
                                    className="Input"
                                    type="text"
                                    value={dbUsername}
                                    onChange={(e) => setDbUsername(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Password</span>
                                <input
                                    className="Input"
                                    type="password"
                                    value={dbPassword}
                                    onChange={(e) => setDbPassword(e.target.value)}
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
                            {success && <p className="text-green-500">Success</p>}
                            {error && <p className="text-red-500">{errorMessage}</p>}
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};