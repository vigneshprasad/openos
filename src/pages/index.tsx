import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import { Navbar } from "~/components/Navbar";
import QueryResult from "~/components/QueryResult";
import { COMPLEX_REPORT, DATABASE_QUERY, FINANCIAL_DATA, CREATE_REPORT, COMPLEX_REPORT_LOADING, UNKNOWN_COMMAND } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType, SimpleReportType } from "../types/types";
import Report from "~/components/Report";
import { GettingStartedModal } from "~/components/GettingStartedModal";
import Image from "next/image";
import { Spinner } from "~/components/Spinner";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";

type CommandDataType = {
    input: string,
    id: string,
    output: CommandResultType
    feedback: number,
    type: string
    createdAt: Date,
}

const Home: NextPage = () => {

    const [command, setCommand] = useState<string>("");
    const [data, setData] = useState<CommandDataType[]>([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current && (loading || data)) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [loading, data])

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
            const dataResult = res as unknown as CommandDataType;
            if(dataResult.type === COMPLEX_REPORT_LOADING) {
                if(!dataResult.output[0]) {
                    setLoading(false);
                    setError(true);
                    return;
                }
                const commands:string[] = dataResult.output[0] as unknown as string[];
                const complexReport:CommandDataType = {
                    input: command,
                    id: dataResult.id,
                    createdAt: dataResult.createdAt,
                    output: [[], undefined],
                    feedback: dataResult.feedback,
                    type: COMPLEX_REPORT,
                }
                const prevCommands = data;
                let simpleReports:SimpleReportType[] = [];
                for(let i = 0; i < commands.length; i++) {
                    const command = commands[i] as string;
                    if(!commands[i]) continue;
                    const simpleResult = await runSimpleQuery.mutateAsync({ query: command });
                    const simpleResultCommandResponse = simpleResult as unknown as CommandDataType;
                    if(!simpleResultCommandResponse 
                        || simpleResultCommandResponse.type !== CREATE_REPORT
                        || !simpleResultCommandResponse.output) continue;
                    simpleReports = [...simpleReports, simpleResultCommandResponse.output as SimpleReportType]
                    complexReport.output = simpleReports as unknown as CommandResultType;
                    setData([...prevCommands, complexReport]);
                }
                setLoading(false);
            } else {
                setData([...data, dataResult]);
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
        runQuery.mutate({ query: command });
    };

    return (
        <>
        <Head>
            <title>Open OS</title>
            <meta name="description" content="Tools to make your life easier" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen">
            <Navbar />
            <GettingStartedModal />
            <div className="h-[calc(100vh_-_44px)] grid grid-cols-[3fr_1fr] grid-rows-1">
                <div className="grid grid-rows-[max-content_1fr] grid-cols-1">
                    <div className="w-full p-1 bg-[#131313] border border-solid border-[#333]">
                        <div className="w-[172px] px-2.5 py-2 bg-[#0A2950] rounded-md">
                            <text className="text-sm font-normal text-[#fff]">Terminal</text>
                        </div>
                    </div>
                    <div className="p-5 bg-[#0A0A0A] grid grid-rows-[1fr_max-content] grid-cols-1 gap-5 overflow-hidden">
                        {data.length === 0 ? <div className="w-[30%] h-max mx-auto pt-20">
                            <Image src="/terminal_empty.png" alt="Terminal" width={300} height={100} className="mx-auto" />
                            <div className="pt-8">
                                <h3 className="text-[#fff] text-sm font-medium text-center">Start by writing your first command</h3>
                                <p className="pt-1 text-xs text-[#838383] text-center">
                                    Open OS lets you write exactly like you speak, in natural English. But if you wish to write commands, 
                                    try the command palette.
                                </p>
                            </div>
                        </div> : (
                            <div className="overflow-auto p-4 bg-[#111] rounded-md">
                                {data.map((item, index) => {
                                    return <div key={index}>
                                        <br />
                                        {
                                            item.type === DATABASE_QUERY && <QueryResult key={index} props={item.output} />
                                        }
                                        {
                                            item.type === FINANCIAL_DATA && <RazorpayData key={index} props={item.output} />
                                        }
                                        {
                                            item.type === CREATE_REPORT && <Report key={index} props={item.output} />
                                        }
                                        {
                                            item.type === COMPLEX_REPORT && 
                                                item.output.map((report, index2) => {
                                                    const simpleReport = report as unknown as SimpleReportType;
                                                    if(simpleReport) {
                                                        return <Report key={index2} props={simpleReport} />
                                                    } 
                                                })
                                        }
                                        {
                                            item.type === UNKNOWN_COMMAND && 
                                                <p className="text-white"> Bad query </p>
                                        }

                                        {loading && index === data.length - 1  && 
                                            <div className="w-full flex justify-center">
                                                <FadingCubesLoader />
                                            </div>
                                        }

                                        <br />
                                        <hr />
                                    </div>
                                })}

                                <div ref={scrollRef} />
                            </div>
                        )}

                        <div className="w-full bg-[#1C1B1D] border border-solid border-[#333] rounded-md">
                            <div className="px-3 py-2.5 border-b border-solid border-b-[#333]">
                                <text className="text-xs text-[#616161] font-normal">Command Palette</text>
                            </div>
                            <div className="pt-3 pb-2 pl-5 pr-10">
                                <form onSubmit={handleSubmit}>
                                    <fieldset>
                                        <label>
                                            <input 
                                                type="text" 
                                                className="w-full px-0 py-[9px] pb-[18px] text-sm text-[#fff] 
                                                font-normal placeholder:text-sm placeholder:text-[#616161]"
                                                placeholder="Start by typing the command eg. run-query"
                                                value={command}
                                                onChange={(e) => setCommand(e.target.value)}
                                            />
                                        </label>
                                    </fieldset>
                                    <div className="flex justify-end items-center gap-2">
                                        <button
                                            type="submit" 
                                            className="bg-[#333134] rounded-md py-2 px-3
                                            text-[#838383] font-normal text-xs flex gap-1.5
                                            hover:bg-[#434144] cursor-pointer"
                                        >
                                            Execute
                                            <Image src="/svg/enter.svg" alt="Enter" width={12} height={12} />
                                        </button>
                                        {loading && <Spinner />}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-rows-[max-content_1fr] grid-cols-1 bg-[#1C1B1D] border border-solid border-[#333333]">
                    <div className="p-3 border-b border-solid border-b-[#333333]">
                        <text className="text-sm text-[#838383] font-medium">Command History</text>
                    </div>
                    <div className="w-[80%] h-max mx-auto mt-[70px] px-5">
                        <Image 
                            src="/command_history_empty.png" 
                            alt="Command History" 
                            width={36} 
                            height={36} 
                            className="mx-auto" />
                        <div className="pt-3">
                            <h3 className="text-[#fff] text-sm font-medium text-center">
                                Your command history is empty
                            </h3>
                            <p className="pt-1 text-xs text-[#838383] text-center">
                                All the commands you write will be shown in the history. 
                                You can repeat commands or command sets by clicking on them here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
};

export default Home;
