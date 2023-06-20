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
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { AnalyticsEvents } from "~/utils/analytics/types";

type CommandDataType = {
    input: string,
    id: string,
    output: CommandResultType
    feedback: number,
    type: string
    createdAt: Date,
}

export const MarketingAnalysisTerminal: React.FC = () => {
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

    const { track } = useAnalytics();

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
        track(AnalyticsEvents.run_command, {
            command: command,
            terminal: "marketing analysis"
        })
        setLoading(true);
        runQuery.mutate({ query: command });
    };

    return (
        <div className="p-5 bg-[#0A0A0A] grid grid-rows-[1fr_max-content] grid-cols-1 gap-5 overflow-hidden">
            <div className="hide-scrollbar overflow-auto flex flex-col gap-5">
                <div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Predict Churn by Source</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-full whitespace-nowrap">Source</th>
                                    <th className="w-full whitespace-nowrap">Predicted Acquisition</th>
                                    <th className="w-full whitespace-nowrap">Predicted Churn Rate</th>
                                    <th className="w-full whitespace-nowrap	">Past Churn</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-full whitespace-nowrap">Facebook Ads</td>
                                    <td className="w-full whitespace-nowrap">1000</td>
                                    <td className="w-full whitespace-nowrap">75%</td>
                                    <td className="w-full whitespace-nowrap	">65%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-full whitespace-nowrap">Google Ads</td>
                                    <td className="w-full whitespace-nowrap">800</td>
                                    <td className="w-full whitespace-nowrap	">85%</td>
                                    <td className="w-full whitespace-nowrap	">45%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-full whitespace-nowrap">Email Campaign</td>
                                    <td className="w-full whitespace-nowrap">1200</td>
                                    <td className="w-full whitespace-nowrap	">70%</td>
                                    <td className="w-full whitespace-nowrap	">50%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-full whitespace-nowrap">Organic</td>
                                    <td className="w-full whitespace-nowrap">1500</td>
                                    <td className="w-full whitespace-nowrap	">80%</td>
                                    <td className="w-full whitespace-nowrap	">30%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Predict ARPU by Source</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-full whitespace-nowrap">Source</th>
                                    <th className="w-full whitespace-nowrap">Predicted ARPU</th>
                                    <th className="w-full whitespace-nowrap">Predicted Cost Per User</th>
                                    <th className="w-full whitespace-nowrap	">Past ARPU</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-full whitespace-nowrap">Google Ads</td>
                                    <td className="w-full whitespace-nowrap">$65</td>
                                    <td className="w-full whitespace-nowrap">$60</td>
                                    <td className="w-full whitespace-nowrap	">25</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-full whitespace-nowrap">Email Campaign</td>
                                    <td className="w-full whitespace-nowrap">$43</td>
                                    <td className="w-full whitespace-nowrap">$45</td>
                                    <td className="w-full whitespace-nowrap	">17.8</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-full whitespace-nowrap">Organic</td>
                                    <td className="w-full whitespace-nowrap">$39</td>
                                    <td className="w-full whitespace-nowrap">$55</td>
                                    <td className="w-full whitespace-nowrap	">21.8</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-full whitespace-nowrap">Facebook Ads</td>
                                    <td className="w-full whitespace-nowrap">$30</td>
                                    <td className="w-full whitespace-nowrap">$30</td>
                                    <td className="w-full whitespace-nowrap	">15</td>
                                </tr>          
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Predict ROI by Source</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-full whitespace-nowrap">Source</th>
                                    <th className="w-full whitespace-nowrap">Predicted ROI</th>
                                    <th className="w-full whitespace-nowrap">Predicted Total Revenue</th>
                                    <th className="w-full whitespace-nowrap	">Past Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-full whitespace-nowrap">Facebook Ads</td>
                                    <td className="w-full whitespace-nowrap">200%</td>
                                    <td className="w-full whitespace-nowrap">$50</td>
                                    <td className="w-full whitespace-nowrap	">$100</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-full whitespace-nowrap">Google Ads</td>
                                    <td className="w-full whitespace-nowrap">150%</td>
                                    <td className="w-full whitespace-nowrap">$60</td>
                                    <td className="w-full whitespace-nowrap	">$90</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-full whitespace-nowrap">Email Campaign</td>
                                    <td className="w-full whitespace-nowrap">180%</td>
                                    <td className="w-full whitespace-nowrap">$45</td>
                                    <td className="w-full whitespace-nowrap	">$72</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-full whitespace-nowrap">Organic</td>
                                    <td className="w-full whitespace-nowrap">220%</td>
                                    <td className="w-full whitespace-nowrap">$55</td>
                                    <td className="w-full whitespace-nowrap	">$110</td>
                                </tr>          
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Predicted Increase in Active Users</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-full whitespace-nowrap">Source</th>
                                    <th className="w-full whitespace-nowrap">Change in DAU</th>
                                    <th className="w-full whitespace-nowrap">Change in WAU</th>
                                    <th className="w-full whitespace-nowrap	">Change in MAU</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-full whitespace-nowrap">Facebook Ads</td>
                                    <td className="w-full whitespace-nowrap">1000 ➚</td>
                                    <td className="w-full whitespace-nowrap">5000 ➚</td>
                                    <td className="w-full whitespace-nowrap	">20000 ➚</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-full whitespace-nowrap">Google Ads</td>
                                    <td className="w-full whitespace-nowrap">800 ➚</td>
                                    <td className="w-full whitespace-nowrap">4000 ➚</td>
                                    <td className="w-full whitespace-nowrap	">15000 ➚</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-full whitespace-nowrap">Email Campaign</td>
                                    <td className="w-full whitespace-nowrap">1200 ➚</td>
                                    <td className="w-full whitespace-nowrap">6000 ➚</td>
                                    <td className="w-full whitespace-nowrap	">25000 ➚</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-full whitespace-nowrap">Organic</td>
                                    <td className="w-full whitespace-nowrap">1500 ➚</td>
                                    <td className="w-full whitespace-nowrap">4500 ➚</td>
                                    <td className="w-full whitespace-nowrap	">18000 ➚</td>
                                </tr>          
                            </tbody>
                        </table>
                    </div>
                    
                </div>    
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
                                        hover:bg-[#434144] cursor-pointer"
                                        onClickCapture={() => track(AnalyticsEvents.download_csv_clicked)}>
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
                                        hover:bg-[#434144] cursor-pointer"
                                        onClickCapture={() => track(AnalyticsEvents.download_csv_clicked)}>
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
                                        hover:bg-[#434144] cursor-pointer"
                                        onClickCapture={() => track(AnalyticsEvents.download_csv_clicked)}>
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

            <div className="w-full bg-[#1C1B1D] border border-solid border-[#333] rounded-md">
                <div className="px-3 py-1 border-b border-solid border-b-[#333] flex justify-between items-center">
                    <text className="text-xs text-[#616161] font-normal">Command Palette</text>
                    <div className="flex gap-1">
                        {COMMANDS_LIST.map((command, index) => (
                            <div 
                                className="py-1 px-2 bg-[#262626] rounded-md cursor-pointer
                                hover:bg-[#464646]"
                                key={index}
                                onClick={() => {
                                    track(AnalyticsEvents.command_palette_clicked, {
                                        command
                                    })
                                    selectCommand(command)
                                }}
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