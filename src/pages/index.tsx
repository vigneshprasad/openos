import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import { Navbar } from "~/components/Navbar";
import QueryResult from "~/components/QueryResult";
import { COMPLEX_REPORT, DATABASE_QUERY, GET_DATA, GET_REPORT } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType } from "../types/types";
import FinancialReport from "~/components/FinancialReport";

type CommandDataType = {
    type: string,
    data: CommandResultType
}

const Home: NextPage = () => {

    const [command, setCommand] = useState<string>("");
    const [data, setData] = useState<CommandDataType[]>([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const runSimpleQuery = api.commandRouter.runCommand.useMutation({
        onSuccess: (data) => {
            return data;
        },
        onError: () => {
            return null;
        }
    })

    const runQuery = api.commandRouter.runCommand.useMutation({
        onSuccess: async (res) => {
            const dataResult = res as CommandDataType;
            if(dataResult.type === COMPLEX_REPORT) {
                if(!dataResult.data[0]) {
                    setLoading(false);
                    setError(true);
                    return;
                }
                const commands:string[] = dataResult.data[0] as unknown as string[];
                const dataState = data;
                for(let i = 0; i < commands.length; i++) {
                    const command = commands[i] as string;
                    if(!commands[i]) continue;
                    const simpleResult = await runSimpleQuery.mutateAsync({ query: command });
                    const simpleResultData = simpleResult as CommandDataType;
                    if(!simpleResultData) continue;
                    dataState.push(simpleResultData);
                    setData(dataState);
                }
                setLoading(false);
            } else {
                setData([dataResult]);
                setLoading(false);
            }
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
        setData([]);
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
                    {
                        data?.map((item, index) => {
                            if(item.type === DATABASE_QUERY) {
                                return <QueryResult key={index} props={item.data} />
                            } else if(item.type === GET_DATA) {
                                return <RazorpayData key={index} props={item.data} />
                            } else if(item.type === GET_REPORT) {
                                return <FinancialReport key={index} props={item.data} />
                            }
                        })
                    }
                    {loading && <div className="text-white">Loading...</div>}
                    {error && <div className="text-white">Error</div>}
                </div>
            </div>
        </main>
        </>
    );
};

export default Home;
