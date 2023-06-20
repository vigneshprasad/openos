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
import { CChart } from "@coreui/react-chartjs";

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

        track(AnalyticsEvents.run_command, {
            command: command,
            terminal: "predictive analysis"
        })

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
                            <p>Churn Propensity: Cohorts that are likely to churn</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">Cohort Name</th>
                                    <th className="w-fit whitespace-nowrap">Likelihood to Churn</th>
                                    <th className="w-full whitespace-nowrap">Number of Users</th>
                                    <th className="w-full whitespace-nowrap	">Avg. Activity Level</th>
                                    <th className="w-full whitespace-nowrap	">Avg. Session Duration</th>
                                    <th className="w-full whitespace-nowrap	">Avg. Revenue</th>
                                    <th className="w-full whitespace-nowrap	">Avg. Conversion to Paid</th>
                                    <th className="w-full whitespace-nowrap	">Onboarding Completion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">New Users</td>
                                    <td className="w-fit whitespace-nowrap">50%</td>
                                    <td className="w-full whitespace-nowrap">500</td>
                                    <td className="w-full whitespace-nowrap">2 times / week</td>
                                    <td className="w-full whitespace-nowrap">10 minutes</td>
                                    <td className="w-full whitespace-nowrap">$25</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                    <td className="w-full whitespace-nowrap">60%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">Users with High Activity</td>
                                    <td className="w-fit whitespace-nowrap">40%</td>
                                    <td className="w-fit whitespace-nowrap">800</td>
                                    <td className="w-fit whitespace-nowrap">5 times / week</td>
                                    <td className="w-fit whitespace-nowrap">20 minutes</td>
                                    <td className="w-fit whitespace-nowrap">$50</td>
                                    <td className="w-fit whitespace-nowrap">90%</td>
                                    <td className="w-fit whitespace-nowrap">80%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">Users with Low Activity</td>
                                    <td className="w-fit whitespace-nowrap">30%</td>
                                    <td className="w-full whitespace-nowrap">350</td>
                                    <td className="w-full whitespace-nowrap	">1 time / week</td>
                                    <td className="w-full whitespace-nowrap	">5 minutes</td>
                                    <td className="w-fit whitespace-nowrap">$10</td>
                                    <td className="w-fit whitespace-nowrap">40%</td>
                                    <td className="w-fit whitespace-nowrap">30%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">Users with Above Average Transaction Value</td>
                                    <td className="w-fit whitespace-nowrap">15%</td>
                                    <td className="w-full whitespace-nowrap">150</td>
                                    <td className="w-full whitespace-nowrap	">2 time / week</td>
                                    <td className="w-full whitespace-nowrap	">10 minutes</td>
                                    <td className="w-fit whitespace-nowrap">$15</td>
                                    <td className="w-fit whitespace-nowrap">50%</td>
                                    <td className="w-fit whitespace-nowrap">40%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">Users with Highest Contribution Source</td>
                                    <td className="w-fit whitespace-nowrap">10%</td>
                                    <td className="w-full whitespace-nowrap">220</td>
                                    <td className="w-full whitespace-nowrap	">2 time / week</td>
                                    <td className="w-full whitespace-nowrap	">8 minutes</td>
                                    <td className="w-fit whitespace-nowrap">$50</td>
                                    <td className="w-fit whitespace-nowrap">60%</td>
                                    <td className="w-fit whitespace-nowrap">70%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Churn Correlation Table: Characteristics and Features highly associated with churn</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">Cohort Name</th>
                                    <th className="w-fit whitespace-nowrap">Likelihood to Churn</th>
                                    <th className="w-full whitespace-nowrap">Number of Users</th>
                                    <th className="w-full whitespace-nowrap">Avg. Activity Level</th>
                                    <th className="w-full whitespace-nowrap">Avg. Session Duration</th>
                                    <th className="w-full whitespace-nowrap">Avg. Revenue</th>
                                    <th className="w-full whitespace-nowrap">Avg. Conversion to Paid</th>
                                    <th className="w-full whitespace-nowrap">Onboarding Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">Users from Nagpur</td>
                                    <td className="w-fit whitespace-nowrap">80%</td>
                                    <td className="w-full whitespace-nowrap">450</td>
                                    <td className="w-full whitespace-nowrap">2 times / week</td>
                                    <td className="w-full whitespace-nowrap">10 minutes</td>
                                    <td className="w-full whitespace-nowrap">$25</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                    <td className="w-full whitespace-nowrap">60%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">Users with Apple Device</td>
                                    <td className="w-fit whitespace-nowrap">75%</td>
                                    <td className="w-full whitespace-nowrap">950</td>
                                    <td className="w-full whitespace-nowrap">5 times / week</td>
                                    <td className="w-full whitespace-nowrap">20 minutes</td>
                                    <td className="w-full whitespace-nowrap">$50</td>
                                    <td className="w-full whitespace-nowrap">90%</td>
                                    <td className="w-full whitespace-nowrap">80%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">Users with Source Facebook</td>
                                    <td className="w-fit whitespace-nowrap">66%</td>
                                    <td className="w-full whitespace-nowrap">350</td>
                                    <td className="w-full whitespace-nowrap">4 times / week</td>
                                    <td className="w-full whitespace-nowrap">15 minutes</td>
                                    <td className="w-full whitespace-nowrap">$30</td>
                                    <td className="w-full whitespace-nowrap">60%</td>
                                    <td className="w-full whitespace-nowrap">50%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">Users with Role Analyst</td>
                                    <td className="w-fit whitespace-nowrap">63%</td>
                                    <td className="w-full whitespace-nowrap">400</td>
                                    <td className="w-full whitespace-nowrap">3 times / week</td>
                                    <td className="w-full whitespace-nowrap">12 minutes</td>
                                    <td className="w-full whitespace-nowrap">$20</td>
                                    <td className="w-full whitespace-nowrap">80%</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">Users using UPI</td>
                                    <td className="w-fit whitespace-nowrap">58%</td>
                                    <td className="w-full whitespace-nowrap">450</td>
                                    <td className="w-full whitespace-nowrap">4 times / week</td>
                                    <td className="w-full whitespace-nowrap">14 minutes</td>
                                    <td className="w-full whitespace-nowrap">$20</td>
                                    <td className="w-full whitespace-nowrap">60%</td>
                                    <td className="w-full whitespace-nowrap">65%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Retention Correlation Table: Characteristics and Features highly associated with retention</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">Cohort Name</th>
                                    <th className="w-fit whitespace-nowrap">Likelihood to Churn</th>
                                    <th className="w-full whitespace-nowrap">Number of Users</th>
                                    <th className="w-full whitespace-nowrap">Avg. Activity Level</th>
                                    <th className="w-full whitespace-nowrap">Avg. Session Duration</th>
                                    <th className="w-full whitespace-nowrap">Avg. Revenue</th>
                                    <th className="w-full whitespace-nowrap">Avg. Conversion to Paid</th>
                                    <th className="w-full whitespace-nowrap">Onboarding Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-fit whitespace-nowrap">Users who perform RSVP</td>
                                    <td className="w-fit whitespace-nowrap">8%</td>
                                    <td className="w-full whitespace-nowrap">350</td>
                                    <td className="w-full whitespace-nowrap">6 times / week</td>
                                    <td className="w-full whitespace-nowrap">40 minutes</td>
                                    <td className="w-full whitespace-nowrap">$150</td>
                                    <td className="w-full whitespace-nowrap">90%</td>
                                    <td className="w-full whitespace-nowrap">95%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-fit whitespace-nowrap">Users who take at least 1 action a day</td>
                                    <td className="w-fit whitespace-nowrap">12%</td>
                                    <td className="w-full whitespace-nowrap">150</td>
                                    <td className="w-full whitespace-nowrap">10 times / week</td>
                                    <td className="w-full whitespace-nowrap">50 minutes</td>
                                    <td className="w-full whitespace-nowrap">$200</td>
                                    <td className="w-full whitespace-nowrap">97%</td>
                                    <td className="w-full whitespace-nowrap">82%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-fit whitespace-nowrap">Users with saved credit card</td>
                                    <td className="w-fit whitespace-nowrap">18%</td>
                                    <td className="w-full whitespace-nowrap">400</td>
                                    <td className="w-full whitespace-nowrap">5 times / week</td>
                                    <td className="w-full whitespace-nowrap">30 minutes</td>
                                    <td className="w-full whitespace-nowrap">$100</td>
                                    <td className="w-full whitespace-nowrap">75%</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-fit whitespace-nowrap">Users with Role Marketer</td>
                                    <td className="w-fit whitespace-nowrap">26%</td>
                                    <td className="w-full whitespace-nowrap">400</td>
                                    <td className="w-full whitespace-nowrap">3 times / week</td>
                                    <td className="w-full whitespace-nowrap">12 minutes</td>
                                    <td className="w-full whitespace-nowrap">$50</td>
                                    <td className="w-full whitespace-nowrap">80%</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">5</td>
                                    <td className="w-fit whitespace-nowrap">Users who visited store page</td>
                                    <td className="w-fit whitespace-nowrap">32%</td>
                                    <td className="w-full whitespace-nowrap">600</td>
                                    <td className="w-full whitespace-nowrap">5 times / week</td>
                                    <td className="w-full whitespace-nowrap">10 minutes</td>
                                    <td className="w-full whitespace-nowrap">$75</td>
                                    <td className="w-full whitespace-nowrap">70%</td>
                                    <td className="w-full whitespace-nowrap">65%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tableDiv hide-scrollbar max-w-max min-w-full">
                        <div className="table-heading flex gap-1">
                            <Image src="/svg/report_icon.svg" alt="Report icon" width={12} height={12} />
                            <p>Projected ARPU of Cohorts Likely to Churn</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className="w-fit whitespace-nowrap"></th>
                                    <th className="w-fit whitespace-nowrap">Cohort Name</th>
                                    <th className="w-full whitespace-nowrap">Projected ARPU</th>
                                    <th className="w-full whitespace-nowrap">Predicted Total Revenue</th>
                                    <th className="w-full whitespace-nowrap	">Past Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">1</td>
                                    <td className="w-full whitespace-nowrap">New Users</td>
                                    <td className="w-full whitespace-nowrap">$50</td>
                                    <td className="w-full whitespace-nowrap">$100</td>
                                    <td className="w-full whitespace-nowrap	">$90</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">2</td>
                                    <td className="w-full whitespace-nowrap">Users with Apple Device</td>
                                    <td className="w-full whitespace-nowrap">$60</td>
                                    <td className="w-full whitespace-nowrap">$90</td>
                                    <td className="w-full whitespace-nowrap	">$80</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">3</td>
                                    <td className="w-full whitespace-nowrap">Users who did not RSVP</td>
                                    <td className="w-full whitespace-nowrap">$45</td>
                                    <td className="w-full whitespace-nowrap">$72</td>
                                    <td className="w-full whitespace-nowrap	">$72</td>
                                </tr>
                                <tr>
                                    <td className="w-fit whitespace-nowrap">4</td>
                                    <td className="w-full whitespace-nowrap">Users who are Executives</td>
                                    <td className="w-full whitespace-nowrap">$45</td>
                                    <td className="w-full whitespace-nowrap">$110</td>
                                    <td className="w-full whitespace-nowrap	">$110</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <CChart
                        type="bar"
                        className="text-white"
                        width={500}
                        options={{
                            indexAxis: 'y',
                        }}
                        data={{
                            labels: ["device_type", "role", "no_of_rsvp", "payment_type", "activity_per_day", "source", "city"],
                            datasets: [
                                {
                                    label: "Feature Importance",
                                    data: [36.49, 12.4, 11.23, 6.71, 6.21, 4.5, 3.59],
                                    backgroundColor: "rgba(220, 220, 220, 0.2)",
                                    barThickness: 20,
                                },
                            ]
                        }}
                                />
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