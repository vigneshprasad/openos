import { useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons';

export const RazorpayResourceForm: React.FC = () => {

    const [name, setName] = useState<string>("");
    const [keyId, setKeyId] = useState<string>("");
    const [keySecret, setKeySecret] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const razorpayResource = api.razorpayResource.create.useMutation({
        onSuccess: () => {
            setSuccess(true);
            setError(false);
            setLoading(false);
        },
        onError: () => {
            setSuccess(false);
            setError(true);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);
        void razorpayResource.mutateAsync({
            name: name,
            keyId: keyId,
            keySecret: keySecret,
        });
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="Button violet"> Add Razorpay Resource </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <Dialog.Title className="DialogTitle"> 
                        Add Razorpay Resource 
                    </Dialog.Title>
                    <Dialog.Description className="DialogDescription">
                        Add a new Razorpay resource here. Click save when you are done.
                    </Dialog.Description>
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
                                <span>Key ID</span>
                                <input
                                    className="Input" 
                                    type="text"
                                    value={keyId}
                                    onChange={(e) => setKeyId(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <fieldset className="Fieldset">
                            <label className="Label">
                                <span>Key Secret</span>
                                <input
                                    className="Input"
                                    type="text"
                                    value={keySecret}
                                    onChange={(e) => setKeySecret(e.target.value)}
                                />
                            </label>
                        </fieldset>
                        <div className="flex justify-content-end mt-25">
                            {loading ?
                                <button type="submit" disabled className="Button grey">Loading...</button>
                                :
                                <button type="submit" className="Button green">Generate</button>
                            }
                        </div>
                        <div className="flex justify-content-end mt-8">
                            {success && <p className="text-green-500">Success</p>}
                            {error && <p className="text-red-500">Error</p>}
                        </div>
                    </form>                    
                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Close">
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};