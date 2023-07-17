import type { DataModel } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { BaseLayout } from "~/components/BaseLayout";
import ChurnComparisonChart from "~/components/ChurnComparisonChart";
import CohortsSection from "~/components/CohortsSection";
import FeaturesTable from "~/components/FeaturesTable";
import { IntegrationStatus } from "~/components/IntegrationStatus";
import Select from "~/components/Select";
import { api } from "~/utils/api";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const Home: NextPage = () => {

    const [selectedModelId, setSelectedModelId] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<Date>(yesterday);

    const { data: models } = api.dataModelRouter.getModels.useQuery();

    const modelOptions = useMemo(() => {
        if (!models || !models.length) return [];
        return models.map((model) => ({
            label: model.name,
            value: model.id,
        }));
    }, [models]);

    const selectedModel = models?.find((model: DataModel) => model.id === selectedModelId);
    const availableDates = useMemo(() => {
        if (!selectedModel) return [];
        const dateArray: Date[] = [];
        let currentDate = new Date(selectedModel.createdAt);
        while (currentDate <= yesterday) {
            dateArray.push(new Date(currentDate));
            const tempDate = new Date(currentDate);
            tempDate.setDate(tempDate.getDate() + 1);
            currentDate = tempDate;
        }
        return dateArray.map((date) => {
            const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return {
                label: dateString,
                value: date,
            }
        });
    }, [selectedModel]);

    useEffect(() => {
        if (!models || !models.length) return;
        const model = models[0];
        if (!model) return;
        setSelectedModelId(model.id);
    }, [models]);

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout activeKey="models">
                <div className="flex flex-col justify-start">
                    <div className="h-12 flex-row flex justify-between flex-basis-content p-2 bg-homepage-tab-background">
                        <IntegrationStatus />
                    <div className="flex gap-2">
                            <Select title="Pre-made models" options={modelOptions} value={selectedModelId} />
                            <Select title="Yesterday" options={availableDates} onChange={(selectedDate) => setSelectedDate(new Date(selectedDate))}/>
                        </div>
                    </div>
                    <div className="flex flex-col p-1 mx-4 gap-5">
                        <div className="my-4 p-4 border border-border shadow-md rounded-lg">
                            {selectedModel ? selectedModel.description : 'No model selected'}
                        </div>
                        {
                            selectedModelId &&
                            <div className="flex justify-between gap-8 items-center">
                                <FeaturesTable modelId={selectedModelId} date={selectedDate} />
                                <ChurnComparisonChart modelId={selectedModelId} date={selectedDate} />
                            </div>
                        }
                        <div className="flex flex-col justify-between my-4">
                            <div className="bg-section-header flex flex-col gap-2 py-5 px-3 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    {/* <div className="text-subtext">Last updated / 2022-06-19</div> */}
                                    {/* <Select options={[]} title="View" /> */}
                                </div>
                                <h2 className="text-dark-text font-bold">Cohort Table</h2>
                                <div className="text-subtext">Showing <span className="text-dark-text">top 6</span> cohorts</div>
                            </div>
                            {
                                selectedModelId &&
                                <CohortsSection modelId={selectedModelId} date={selectedDate} />
                            }
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Home;
