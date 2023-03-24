import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import { Navbar } from "~/components/Navbar";
import QueryResult from "~/components/QueryResult";
import { DATABASE_QUERY, GET_DATA } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType } from "../types/types";

type CommandDataType = {
    type: string,
    data: CommandResultType
}

const Home: NextPage = () => {

    const [command, setCommand] = useState<string>("");
    const [data, setData] = useState<CommandDataType>();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const runQuery = api.commandRouter.runCommand.useMutation({
        onSuccess: (data) => {
            const dataResult = data as CommandDataType;
            setData(dataResult);
            setLoading(false);
        },
        onError: () => {
            setLoading(false);
            setError(true)
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setData(undefined);
        runQuery.mutate({ query: command });        
    };

    return (
        <>
        <Head>
            <title>Open OS</title>
            <meta name="description" content="Tools to make your life easier" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <Navbar />
            <div className="flex min-h-screen flex-col items-center">
                <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                        Open <span className="text-[hsl(280,100%,70%)]">OS</span> 
                    </h1>
                    <div className="flex items-center gap-2 text-white w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                            <fieldset className="Fieldset w-full">
                                <label className="Label">
                                    <span>Write Query</span>
                                    <input
                                        className="Input" 
                                        type="text"
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                    />
                                </label>
                            </fieldset>
                            <div className="mt-25 mb-25">
                                <button type="submit" className="Button green">Generate</button>
                            </div>
                        </form>
                    </div>
                    {loading && <div className="text-white">Loading...</div>}
                    {
                        data?.type && data?.data && data?.type === DATABASE_QUERY && 
                            <QueryResult props={data?.data} />
                    }
                    {
                        data?.type && data?.data && data?.type === GET_DATA && 
                            <RazorpayData props={data?.data} />
                    }
                    {error && <div className="text-white">Error</div>}
                </div>
            </div>
        </main>
        </>
    );
};

export default Home;
