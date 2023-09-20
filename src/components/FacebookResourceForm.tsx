import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Image from "next/image";
import { FACEBOOK_APPLICATION_ID } from "~/constants/global.constants";


export const FacebookResourceForm: React.FC = () => {

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data } = api.amplitudeResource.getByUserId.useQuery()

    useEffect(() => {
        if (data) setSuccess(true)
    }, [data])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);

    };

    const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APPLICATION_ID}&redirect_uri=https://openos.app/integrations&config_id=3183854955257524`
    console.log("URL: ", url);

    return (
        success ? 
            <button className="bg-primary/10 text-[#49C179] rounded-md mt-3 py-2 px-3
            font-normal text-xs flex gap-1.5" disabled>
                <Image src="/svg/green_tick.svg" alt="Green Tick" width={15} height={15} />
                Connected
            </button> :
            <a href={url}>
                <button className="bg-primary/10 text-primary rounded-md mt-3 py-2 px-3
                font-normal text-xs flex gap-1.5
                hover:bg-primary/20 cursor-pointer">
                    Connect
                </button>
            </a>
    );
};