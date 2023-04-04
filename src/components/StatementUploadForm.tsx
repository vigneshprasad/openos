import { useState } from "react";
import { api } from "~/utils/api";
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

export const StatementUploadForm: React.FC = () => {    
    const [name, setName] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileSelected, setFileSelected] = useState<File | undefined>();
    const [presignedUrl, setPresignedUrl] = useState("");
    
    const bankStatement = api.aws.create.useMutation({
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
        console.log("HMMMM");
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
            void bankStatement.mutateAsync({
                name: name,
                url: url,
            });
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const fileList = e.target?.files;
        if(!fileList) return;
        setFileSelected(fileList[0]);
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="Button violet"> Upload Bank Statement</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <Dialog.Title className="DialogTitle"> 
                        Upload Bank Statement 
                    </Dialog.Title>
                    <Dialog.Description className="DialogDescription">
                        Upload your statement in Excel Format.
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
                            <input type="file" name="image" onChange={handleFileUpload}/>
                            <div className="flex justify-content-end mt-25">
                                {loading ?
                                <button type="submit" disabled className="Button grey">Loading...</button>
                                :
                                <button type="submit" className="Button green">Submit</button>
                                }
                            </div>
                        </form>
                        
                        <div className="flex justify-content-end mt-8">
                            {success && <p className="text-green-500">Success</p>}
                            {error && <p className="text-red-500">Error</p>}
                        </div>
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