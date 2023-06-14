import { useCallback, useEffect, useRef, useState } from "react";
import {  UNKNOWN_COMMAND, PREDICTIVE_ANALYSIS_COMMANDS_LIST, PREDICT_LTV, MODEL_CORRELATION, PREDICT_CHURN, PREDICT_LIKELIHOOD } from "~/constants/commandConstants";
import { api } from "~/utils/api";
import type { CommandResultType, PredictCommandInput} from "../types/types";
import Image from "next/image";
import { Spinner } from "~/components/Spinner";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import { ErrorBox } from "~/components/ErrorBox";
import { PredictLTV } from "./PredictLTV";
import { PredictChurn } from "./PredictChurn";
import { PredictLikelihood } from "./PredictLikelihood";
import { ModelCorrelation } from "./ModelCorrelation";
import GraphReport from "./GraphReport";
import Report from "./Report";
import { AnalyticsEvents } from "~/utils/analytics/types";
import useAnalytics from "~/utils/analytics/AnalyticsContext";

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
        event2: "",
        repeat: 0,
        period: 0,
    });
    const [data, setData] = useState<CommandDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null)

    const { track } = useAnalytics();

    const selectCommand = useCallback((command: string) => {
        setCommand(command);
    }, [setCommand])

    useEffect(() => {
        if (scrollRef.current && (loading || data)) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [loading, data])


    const runQuery = api.predictiveAnalysisCommand.runCommand.useMutation({
        onSuccess: (res) => {
            setCommand("");
            const dataResult = res as unknown as CommandDataType;
            setData([...data, dataResult]);
            setLoading(false);
        },
        onError: () => {
            setLoading(false);
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        runQuery.mutate({
            command: input.command,
            type: input.type,
            event: input.event,
            period: input.period,
            event2: input.event2 ? input.event2 : "",
            repeat: input.repeat ? input.repeat : 0,
        });
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
                            item.type === PREDICT_LTV && <GraphReport key={index} props={item.output} />
                        }  
                        {
                            item.type === PREDICT_CHURN && <GraphReport key={index} props={item.output} />
                        }
                        {
                            item.type === PREDICT_LIKELIHOOD && <GraphReport key={index} props={item.output} />
                        }
                        {
                            item.type === MODEL_CORRELATION && <Report key={index} props={item.output} />
                        }  
                        {
                            item.type === UNKNOWN_COMMAND && 
                                <ErrorBox
                                    title="Incorrect command entered"
                                    description='The command you entered seems to be in the wrong format. Correct format eg “get-data: followed by your command“'
                                />
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
                                onClick={
                                    () => {
                                        track(AnalyticsEvents.command_palette_clicked, {
                                            command
                                        })
                                        selectCommand(command)
                                    }
                                }
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