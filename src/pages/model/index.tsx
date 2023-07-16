import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { BaseLayout } from "~/components/BaseLayout";
import ChurnComparisonChart from "~/components/ChurnComparisonChart";
import { ChurnDetailsModal } from "~/components/ChurnModal";
import Select from "~/components/Select";

const CHURN_HISTORY = [
    {
        id: 1,
        title: 'Nagpur location',
        badge: 'Feature',
    },
    {
        id: 2,
        title: 'Apple Iphone Device',
        badge: 'Characteristics',
    },
    {
        id: 3,
        title: 'Nagpur location',
        badge: 'Feature',
    },
    {
        id: 4,
        title: 'Apple Iphone Device',
        badge: 'Characteristics',
    },
    {
        id: 5,
        title: 'Apple Iphone Device',
        badge: 'Characteristics',
    },
]

const ChurnHistoryTable = () => {

    const [activeChurnId, setChurnId] = useState<number | null>(null);

    const handleOpenChange = () => {
        setChurnId(null);
    }

    return <div className="bg-white flex flex-col gap-4 h-[250px] rounded-lg grow">
        <div className="flex gap-2 p-2">
            <p>Navigate to churn</p>
            <Image src="/svg/arrow-right-up.svg" alt="arrow" width={24} height={24} />
        </div>
        <table className="w-full flex flex-col gap-2 overflow-y-scroll">
            <tbody className="w-full">
                {CHURN_HISTORY.map((row) => {
                    return <tr key={row.id} className="w-full">
                        <td className="border-x-0 w-full">{row.title}</td>
                        <td className="border-x-0">{row.badge}</td>
                        <td className="border-x-0 underline cursor-pointer" onClick={() => setChurnId(row.id)}>details</td>
                    </tr>
                })}
            </tbody>
        </table>
        <ChurnDetailsModal isOpen={!!activeChurnId} handleOpenChange={handleOpenChange} />
    </div>
}

const PredictedChurnCard = () => {
    return <div className="h-[120px] w-[200px] bg-predicted-churn-background 
            flex flex-col justify-center items-center rounded-2xl gap-4"
    >
        <div>
            Predicted Churn
        </div>
        <div>
            <b>30%</b>
        </div>
    </div>
}

const ActualChurnCard = () => {
    return <div className="h-[120px] w-[200px] bg-actual-churn-background
            flex flex-col justify-center items-center rounded-2xl gap-4"
    >
        <div>
            Actual Churn
        </div>
        <div className="flex w-3/5 justify-between">
            <b>--</b>
            <span>+9.15%</span>
        </div>
    </div>
}



const Home: NextPage = () => {

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Toolsyo to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout activeKey="terminal">
                <div className="flex flex-col justify-start">
                    <div className="h-12 flex-row flex justify-between flex-basis-content p-2 bg-homepage-tab-background">
                        <div className="flex gap-2 items-center ml-3">
                            <h3>Predicted churn for cohorts</h3>
                            <div className="bg-success-badge px-3 py-1 rounded-full">Database</div>
                        </div>
                        <div className="flex gap-2">
                            <Select title="Pre-made models" options={[{
                                label: '1',
                                value: '1',
                            }]} />
                            <Select title="Dates" options={[{
                                label: '1',
                                value: '1',
                            }]} />
                        </div>
                    </div>
                    <div className="flex flex-col p-1 mx-4 gap-5">
                        <div className="my-4 p-4 border border-border shadow-md rounded-lg">
                            Model Description: Predicting whats the likelyhood that a user  who makes a purchase atleast twice, post signing up will churn within 90 days
                        </div>
                        <div className="flex justify-between gap-8 items-center">
                            <ChurnHistoryTable />
                            <PredictedChurnCard />
                            <ActualChurnCard />
                            <ChurnComparisonChart />
                        </div>
                        <div className="flex flex-col justify-between my-4">
                            <div className="bg-section-header flex flex-col gap-4 p-3 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-subtext">Last updated / 2022-06-19</div>
                                    <Select options={[]} title="View" />
                                </div>
                                <h2 className="text-dark-text font-bold">Prediction Details</h2>
                                <div className="text-subtext">Showing <span className="text-dark-text">top 6</span> cohorts</div>
                            </div>
                            <div className="bg-white">
                                <table className="w-full">
                                    <thead className="w-full border-none sticky">
                                        <th className="">Event</th>
                                        <th className="">Predicted Churn</th>
                                        <th className="">Actual value</th>
                                        <th className="">Deviation</th>
                                        <th className="">Download List</th>
                                    </thead>
                                    <tbody className="w-full">
                                        {CHURN_HISTORY.map((row) => {
                                            return <tr key={row.id} className="w-full">
                                                <td className="">{row.title}</td>
                                                <td className="">{row.badge}</td>
                                                <td className="underline cursor-pointer ">details</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Home;
