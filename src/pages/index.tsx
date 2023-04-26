import { type NextPage } from "next";
import { CSVLink } from "react-csv";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import { Navbar } from "~/components/Navbar";
import QueryResult from "~/components/QueryResult";
import { COMPLEX_REPORT, DATABASE_QUERY, FINANCIAL_DATA, CREATE_REPORT, COMPLEX_REPORT_LOADING, UNKNOWN_COMMAND, GET_HELP, COMMANDS_LIST } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType, ExcelSheet, SimpleReportType } from "../types/types";
import Report from "~/components/Report";
import { GettingStartedModal } from "~/components/GettingStartedModal";
import Image from "next/image";
import { Spinner } from "~/components/Spinner";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import { convertComplexReportToExcel, convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";
import { commands } from "~/constants/commandAutocomplete";
import { CommandHistorySection } from "~/components/CommandHistorySection";
import { ErrorBox } from "~/components/ErrorBox";
import { type CommandHistory } from "@prisma/client";
import { MicrosoftClarityScript } from "~/components/MicrosoftClarityScript";

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
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputFocusRef = useRef<HTMLInputElement>(null)
    const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);

    const selectCommand = useCallback((command: string) => {
        setCommand((prevCommand) => `${command}: ${prevCommand}`)
        inputFocusRef.current?.focus()
    }, [inputFocusRef, setCommand])

    const selectCommandFromHistory = useCallback((command: string) => {
        setCommand((prevCommand) => `${prevCommand} ${command}`)
        inputFocusRef.current?.focus()
    }, [inputFocusRef, setCommand])

    const autocompleteCommand = useCallback((command: string) => {
        setCommand(command)
        inputFocusRef.current?.focus()
    }, [inputFocusRef, setCommand])

    useEffect(() => {
        if (scrollRef.current && (loading || data)) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [loading, data])

    const filteredCommands = useMemo(() => {
        return commands.filter((item) => {
            return item.command.toLowerCase().includes(command.toLowerCase()) && item.command.toLowerCase() !== command.toLowerCase()
        })
    }, [command])

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
            setCommand("");
            const dataResult = res as unknown as CommandDataType;
            if(dataResult.type === COMPLEX_REPORT_LOADING) {
                if(!dataResult.output[0]) {
                    setLoading(false);
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
        }
    });

    const commandHistoryMutation = api.commandHistory.getAll.useMutation({
        onSuccess: (data) => {
            setCommandHistory(data)
        },
        onError: () => {
            return null;
        }
    })

    useEffect(() => commandHistoryMutation.mutate(), [data])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        runQuery.mutate({ query: command });
        commandHistoryMutation.mutate()
    };

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
                <MicrosoftClarityScript />    
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
                            {data.length === 0 ? <div>
                                {loading ? 
                                    <div className="w-full flex justify-center">
                                        <FadingCubesLoader />
                                    </div> :

                                    <div className="w-[30%] h-max mx-auto pt-20">
                                        <Image src="/terminal_empty.png" alt="Terminal" width={300} height={100} className="mx-auto" />
                                        <div className="pt-8">
                                            <h3 className="text-[#fff] text-sm font-medium text-center">Write your first command</h3>
                                            <p className="pt-1 text-xs text-[#838383] text-center">
                                                Start by typing a syntax from the command pallet followed by natural language
                                            </p>
                                        </div>
                                    </div>}
                            </div> : (
                                <div className="overflow-auto p-4 bg-[#111] rounded-md">
                                    {data.map((item, index) => {
                                        const [key, value] = item.input.split(":")

                                        return <div key={index}>
                                            <br />
                                            
                                            <p className="pb-2 text-sm text-[#F4BF4F]">
                                                <span className="text-[#fff]">{key}: </span>
                                                {value}
                                            </p>

                                            {
                                                item.type === DATABASE_QUERY && <QueryResult key={index} props={item.output} />
                                            }
                                            {
                                                item.type === FINANCIAL_DATA && <RazorpayData key={index} props={item.output} />
                                            }
                                            {
                                                item.type === CREATE_REPORT && <Report key={index} props={item.output} />
                                            }
                                            {   item.type === CREATE_REPORT && item.output && item.output[0] && (item.output[0] as ExcelSheet).sheet &&
                                                    <>
                                                        <CSVLink data={convertSimpleReportToExcel((item.output[0] as ExcelSheet).sheet)} target="_blank">
                                                            <button className="bg-[#333134] rounded-md py-2 px-3
                                                            text-[#838383] font-normal text-xs flex gap-1.5
                                                            hover:bg-[#434144] cursor-pointer">
                                                                <p>Download CSV</p>
                                                            </button>
                                                        </CSVLink>
                                                    </>
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
                                            {   item.type === COMPLEX_REPORT && item.output && (item.output as unknown as SimpleReportType[]) &&
                                                    <>
                                                        <CSVLink data={convertComplexReportToExcel((item.output as unknown as SimpleReportType[]))} target="_blank">
                                                            <button className="bg-[#333134] rounded-md py-2 px-3
                                                            text-[#838383] font-normal text-xs flex gap-1.5
                                                            hover:bg-[#434144] cursor-pointer">
                                                                <p>Download CSV</p>
                                                            </button>
                                                        </CSVLink>
                                                    </>
                                            }   
                                            {
                                                item.type === UNKNOWN_COMMAND && 
                                                    <ErrorBox
                                                        title="Incorrect command entered"
                                                        description='The command you entered seems to be in the wrong format. Correct format eg “get-data: followed by your command“'
                                                    />
                                            }
                                            {
                                                item.type === GET_HELP && 
                                                    <p className="text-white"> {item.output as unknown as string} </p>
                                            }
                                            <>
                                                <br /><hr />
                                            </>
                                            {loading && index === data.length - 1  && 
                                                <div className="w-full flex justify-center">
                                                    <FadingCubesLoader />
                                                </div>
                                            }
                                        </div>
                                    })}

                                    <div ref={scrollRef} />
                                </div>
                            )}

                            <div className="w-full bg-[#1C1B1D] border border-solid border-[#333] rounded-md">
                                <div className="px-3 py-1 border-b border-solid border-b-[#333] flex justify-between items-center">
                                    <text className="text-xs text-[#616161] font-normal">Command Palette</text>
                                    <div className="flex gap-1">
                                        {COMMANDS_LIST.map((command, index) => (
                                            <div 
                                                className="py-1 px-2 bg-[#262626] rounded-md cursor-pointer
                                                hover:bg-[#464646]"
                                                key={index}
                                                onClick={() => selectCommand(command)}
                                            >
                                                <text className="text-xs text-[#C4C4C4] leading-[150%]">{command}</text>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-3 pb-2 pl-5 pr-10">
                                    <form onSubmit={handleSubmit}> 
                                        <fieldset>
                                            <label className="relative">
                                                <input
                                                    ref={inputFocusRef}
                                                    type="text" 
                                                    className="w-full px-0 py-[9px] pb-[18px] text-sm text-[#fff] 
                                                    font-normal placeholder:text-sm placeholder:text-[#616161]"
                                                    placeholder="Start by typing the command eg. run-query"
                                                    value={command}
                                                    onChange={(e) => setCommand(e.target.value)}
                                                />

                                                {command.length > 0 && filteredCommands.length > 0 && !loading && 
                                                    <div className="absolute w-[400px] h-[max] max-h-[145px] overflow-y-auto py-1 bg-[#272628] 
                                                        border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] flex-col gap-2
                                                        bottom-0"
                                                        style={{
                                                            left: (command.length * 10) + 10,
                                                        }}
                                                    >
                                                        {filteredCommands
                                                            .map((item, index) => (
                                                                <div 
                                                                    className="px-3 py-1 flex justify-between items-center cursor-pointer 
                                                                    hover:bg-[#373737]"
                                                                    key={index}
                                                                    onClick={() => autocompleteCommand(item.command)}
                                                                >
                                                                    <p className="text-[#fff] text-sm">
                                                                        {item.command}
                                                                    </p>
                                                                    <p className="text-xs text-[#C4C4C4]">{item.description}</p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                } 
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
                    <CommandHistorySection
                        commands={commandHistory}
                        selectCommandFromHistory={selectCommandFromHistory}
                    />
                </div>
            </main>
        </>
    );
};

export default Home;
