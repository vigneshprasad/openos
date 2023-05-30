import { CSVLink } from "react-csv";
import { useCallback, useEffect, useRef, useState } from "react";
import RazorpayData from "~/components/RazorpayData";
import QueryResult from "~/components/QueryResult";
import { COMPLEX_REPORT, DATABASE_QUERY, FINANCIAL_DATA, CREATE_REPORT, COMPLEX_REPORT_LOADING, UNKNOWN_COMMAND, GET_HELP, PREDICTIVE_ANALYSIS_COMMANDS_LIST, PREDICT_LTV, MODEL_CORRELATION, PREDICT_CHURN, PREDICT_LIKELIHOOD } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType, ExcelSheet, PredictCommandInput, QueryAndResult, SimpleReportType } from "../types/types";
import Report from "~/components/Report";
import Image from "next/image";
import { Spinner } from "~/components/Spinner";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import { convertComplexReportToExcel, convertDatabaseQueryResultToExcel, convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";
import { ErrorBox } from "~/components/ErrorBox";
import { PredictLTV } from "./PredictLTV";
import { PredictChurn } from "./PredictChurn";
import { PredictLikelihood } from "./PredictLikelihood";
import { ModelCorrelation } from "./ModelCorrelation";

type CommandDataType = {
    input: string,
    id: string,
    output: CommandResultType
    feedback: number,
    type: string
    createdAt: Date,
}

export const PredictiveAnalysisTerminal: React.FC = () => {
    const [command, setCommand] = useState<string>("");
    const [input, setInput] = useState<PredictCommandInput>({
        command: "",
        type: "",
        event: "",
        period: 0,
    });
    const [data, setData] = useState<CommandDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null)

    const selectCommand = useCallback((command: string) => {
        setCommand(command);
    }, [setCommand])

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        runQuery.mutate({ query: input.command });
    };

    return (
        <div className="p-5 bg-[#0A0A0A] grid grid-rows-[1fr_max-content] grid-cols-1 gap-5 overflow-hidden">
            <div className="hide-scrollbar overflow-auto flex flex-col gap-5">
                <div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Churn Propensity Table: Users that are likely to churn</p>
                        </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th className="w-fit whitespace-nowrap"></th>
                                        <th className="w-fit whitespace-nowrap">No.</th>
                                        <th className="w-fit whitespace-nowrap">Risk</th>
                                        <th className="w-full whitespace-nowrap">Cohorts of Users</th>
                                        <th className="w-full whitespace-nowrap	">ARPU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="w-fit whitespace-nowrap">1</td>
                                        <td className="w-fit whitespace-nowrap">60</td>
                                        <td className="w-fit whitespace-nowrap">30%</td>
                                        <td className="w-full whitespace-nowrap">High LTV Users</td>
                                        <td className="w-full whitespace-nowrap	">₹ 1000</td>
                                    </tr>
                                    <tr>
                                        <td className="w-fit whitespace-nowrap">2</td>
                                        <td className="w-fit whitespace-nowrap">40</td>
                                        <td className="w-fit whitespace-nowrap">20%</td>
                                        <td className="w-full whitespace-nowrap">High Ability to Pay Users</td>
                                        <td className="w-full whitespace-nowrap	">₹ 830</td>
                                    </tr>
                                    <tr>
                                        <td className="w-fit whitespace-nowrap">3</td>
                                        <td className="w-fit whitespace-nowrap">46</td>
                                        <td className="w-fit whitespace-nowrap">23%</td>
                                        <td className="w-full whitespace-nowrap">High Engagement Users</td>
                                        <td className="w-full whitespace-nowrap	">₹ 1200</td>
                                    </tr>
                                    <tr>
                                        <td className="w-fit whitespace-nowrap">4</td>
                                        <td className="w-fit whitespace-nowrap">34</td>
                                        <td className="w-fit whitespace-nowrap">17%</td>
                                        <td className="w-full whitespace-nowrap">Users Been Part of the Platform for Greater than 90 Days</td>
                                        <td className="w-full whitespace-nowrap	">₹ 1500</td>
                                    </tr>
                                    <tr>
                                        <td className="w-fit whitespace-nowrap">5</td>
                                        <td className="w-fit whitespace-nowrap">20</td>
                                        <td className="w-fit whitespace-nowrap">10%</td>
                                        <td className="w-full whitespace-nowrap">Users with Negative Support Tickets</td>
                                        <td className="w-full whitespace-nowrap	">₹ 820</td>
                                    </tr>
                                </tbody>
                            </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Churn Correlation Table: User characteristics that are highly associated with churn</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">No.</th>
                                    <th className="w-fit whitespace-nowrap">Churn %</th>
                                    <th className="w-full whitespace-nowrap">Cohorts of Users</th>
                                    <th className="w-full whitespace-nowrap	">Avg. LTV</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">60</td>
                                    <td className="w-fit whitespace-nowrap">30%</td>
                                    <td className="w-full whitespace-nowrap">Device prices below ₹ 50000</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1000</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">40</td>
                                    <td className="w-fit whitespace-nowrap">20%</td>
                                    <td className="w-full whitespace-nowrap">Location: Nagpur</td>
                                    <td className="w-full whitespace-nowrap	">₹ 830</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">46</td>
                                    <td className="w-fit whitespace-nowrap">23%</td>
                                    <td className="w-full whitespace-nowrap">Users with non-business Email IDs</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1200</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">34</td>
                                    <td className="w-fit whitespace-nowrap">17%</td>
                                    <td className="w-full whitespace-nowrap">Users with Campaign Source: FB Week 2</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1500</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">20</td>
                                    <td className="w-fit whitespace-nowrap">10%</td>
                                    <td className="w-full whitespace-nowrap">Users of Company Sizes less than 100</td>
                                    <td className="w-full whitespace-nowrap	">₹ 820</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">6</td>
                                    <td className="w-fit whitespace-nowrap">20</td>
                                    <td className="w-fit whitespace-nowrap">10%</td>
                                    <td className="w-full whitespace-nowrap">Users with MacOS</td>
                                    <td className="w-full whitespace-nowrap">₹ 820</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Features that lead to retention</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">No.</th>
                                    <th className="w-fit whitespace-nowrap">Churn %</th>
                                    <th className="w-full whitespace-nowrap">Features</th>
                                    <th className="w-full whitespace-nowrap	">Avg. LTV</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">60</td>
                                    <td className="w-fit whitespace-nowrap">30%</td>
                                    <td className="w-full whitespace-nowrap">App Version 10.2 </td>
                                    <td className="w-full whitespace-nowrap	">₹ 1000</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">40</td>
                                    <td className="w-fit whitespace-nowrap">20%</td>
                                    <td className="w-full whitespace-nowrap">Pricing Plan = Platinum Subscription</td>
                                    <td className="w-full whitespace-nowrap	">₹ 830</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">46</td>
                                    <td className="w-fit whitespace-nowrap">23%</td>
                                    <td className="w-full whitespace-nowrap">Payment method = Stripe</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1200</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">34</td>
                                    <td className="w-fit whitespace-nowrap">17%</td>
                                    <td className="w-full whitespace-nowrap">Users with 2+ actions in D7</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1500</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">20</td>
                                    <td className="w-fit whitespace-nowrap">10%</td>
                                    <td className="w-full whitespace-nowrap">Users with role = Analyst</td>
                                    <td className="w-full whitespace-nowrap	">₹ 820</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Projected LTV of Cohorts</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">No.</th>
                                    <th className="w-fit whitespace-nowrap">Certainty</th>
                                    <th className="w-full whitespace-nowrap">Cohorts of Users</th>
                                    <th className="w-full whitespace-nowrap	">Top 25% LTV</th>
                                    <th className="w-full whitespace-nowrap	">Median</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">60</td>
                                    <td className="w-fit whitespace-nowrap">30%</td>
                                    <td className="w-full whitespace-nowrap">Device prices below ₹ 50000</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1000</td>
                                    <td className="w-full whitespace-nowrap	">₹ 920</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">40</td>
                                    <td className="w-fit whitespace-nowrap">20%</td>
                                    <td className="w-full whitespace-nowrap">Users retained at D90</td>
                                    <td className="w-full whitespace-nowrap	">₹ 830</td>
                                    <td className="w-full whitespace-nowrap	">₹ 760</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">46</td>
                                    <td className="w-fit whitespace-nowrap">23%</td>
                                    <td className="w-full whitespace-nowrap">Payment method = Stripe </td>
                                    <td className="w-full whitespace-nowrap	">₹ 1200</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1050</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">34</td>
                                    <td className="w-fit whitespace-nowrap">17%</td>
                                    <td className="w-full whitespace-nowrap">Users with role = Analyst</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1500</td>
                                    <td className="w-full whitespace-nowrap	">₹ 1240</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">20</td>
                                    <td className="w-fit whitespace-nowrap">10%</td>
                                    <td className="w-full whitespace-nowrap">User with city = Mumbai</td>
                                    <td className="w-full whitespace-nowrap	">₹ 820</td>
                                    <td className="w-full whitespace-nowrap	">₹ 700</td>
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

            <div className="w-full bg-[#1C1B1D] border border-solid border-[#333] rounded-md">
                <div className="px-3 py-1 border-b border-solid border-b-[#333] flex justify-between items-center">
                    <text className="text-xs text-[#616161] font-normal">Command Palette</text>
                    <div className="flex gap-1">
                        {PREDICTIVE_ANALYSIS_COMMANDS_LIST.map((command, index) => (
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
                        {command.length == 0 ? 
                            <fieldset>
                                <label className="relative">
                                    <p
                                        className="w-full px-0 py-[9px] pb-[18px] text-sm 
                                        font-normal text-[#616161]">
                                        Select a command from the command pallette
                                    </p>
                                </label>
                            </fieldset>
                            :
                            <div>
                                {command === PREDICT_LTV && <PredictLTV setInput={setInput}/>}
                                {command === PREDICT_CHURN && <PredictChurn setInput={setInput} />}
                                {command === PREDICT_LIKELIHOOD && <PredictLikelihood setInput={setInput} />}
                                {command === MODEL_CORRELATION && <ModelCorrelation setInput={setInput} />}
                            </div>
                            
                        }                             
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