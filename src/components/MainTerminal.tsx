import { CSVLink } from "react-csv";
import { useCallback, useEffect, useRef, useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import QueryResult from "~/components/QueryResult";
import { COMPLEX_REPORT, DATABASE_QUERY, FINANCIAL_DATA, CREATE_REPORT, COMPLEX_REPORT_LOADING, UNKNOWN_COMMAND, GET_HELP, COMMANDS_LIST } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType, ExcelSheet, QueryAndResult, SimpleReportType } from "../types/types";
import Report from "~/components/Report";
import Image from "next/image";
import { Spinner } from "~/components/Spinner";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import { convertComplexReportToExcel, convertDatabaseQueryResultToExcel, convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";
import { ErrorBox } from "~/components/ErrorBox";
import { useRouter } from "next/router";
import AutoComplete from "~/components/AutoComplete";

type CommandDataType = {
    input: string,
    id: string,
    output: CommandResultType
    feedback: number,
    type: string
    createdAt: Date,
}

export const MainTerminal: React.FC = () => {
    const router = useRouter();
    const [command, setCommand] = useState<string>("");
    const [data, setData] = useState<CommandDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputFocusRef = useRef<HTMLInputElement>(null)

    const selectCommand = useCallback((command: string) => {
        setCommand((prevCommand) => `${command}: ${prevCommand}`)
        inputFocusRef.current?.focus()
    }, [inputFocusRef, setCommand])

    

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

    useEffect(() => {
        const executeTemplateCommand = async (): Promise<void> => {
            // Add template command to input
            const templateCommand = router.query.exec as string
            setCommand(templateCommand)

            // Execute template command
            setLoading(true);
            command.length > 0 && runQuery.mutate({ query: command });

            // Clear router query parameters
            await router.replace("/", undefined, {shallow: true})
        }

        if (router && router.query.exec) {
            void executeTemplateCommand()
        }
    }, [router.query.exec, command])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        runQuery.mutate({ query: command });
    };

    return (
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
                <div className="hide-scrollbar overflow-auto flex flex-col gap-5">
                    {data.map((item, index) => {
                        const [key, value] = item.input.split(":")

                        return <div className="p-4 bg-[#111] rounded-md" key={index}>
                            <p className="text-sm text-[#F4BF4F]">
                                <span className="text-[#fff]">{key}: </span>
                                {value}
                            </p>

                            {
                                item.type === DATABASE_QUERY && <QueryResult key={index} props={item.output} />
                            }
                            {   item.type === DATABASE_QUERY && item.output && item.output[0] && ((item.output[0] as QueryAndResult).result) &&
                                    <div className="max-w-max">
                                        <CSVLink className="w-fit-content" data={convertDatabaseQueryResultToExcel((item.output[0] as QueryAndResult).result)} target="_blank">
                                            <button className="bg-[#333134] rounded-md mt-3 py-2 px-3
                                            text-[#838383] font-normal text-xs flex gap-1.5
                                            hover:bg-[#434144] cursor-pointer">
                                                <p>Download CSV</p>
                                            </button>
                                        </CSVLink>
                                    </div>
                            }
                            {
                                item.type === FINANCIAL_DATA && <RazorpayData key={index} props={item.output} />
                            }
                            {
                                item.type === CREATE_REPORT && <Report key={index} props={item.output} />
                            }
                            {   item.type === CREATE_REPORT && item.output && item.output[0] && (item.output[0] as ExcelSheet).sheet &&
                                    <div className="max-w-max">
                                        <CSVLink data={convertSimpleReportToExcel((item.output[0] as ExcelSheet).sheet)} target="_blank">
                                            <button className="bg-[#333134] rounded-md mt-3 py-2 px-3
                                            text-[#838383] font-normal text-xs flex gap-1.5
                                            hover:bg-[#434144] cursor-pointer">
                                                <p>Download CSV</p>
                                            </button>
                                        </CSVLink>
                                    </div>
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
                                    <div className="max-w-max">
                                        <CSVLink data={convertComplexReportToExcel((item.output as unknown as SimpleReportType[]))} target="_blank">
                                            <button className="bg-[#333134] rounded-md mt-3 py-2 px-3
                                            text-[#838383] font-normal text-xs flex gap-1.5
                                            hover:bg-[#434144] cursor-pointer">
                                                <p>Download CSV</p>
                                            </button>
                                        </CSVLink>
                                    </div>
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
                        </div>
                    })}

                    {loading && 
                        <div className="w-full flex justify-center">
                            <FadingCubesLoader />
                        </div>
                    }

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
                                <AutoComplete
                                    command={command}
                                    loading={loading}
                                    setCommand={setCommand}
                                    ref={inputFocusRef}
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
    );
};