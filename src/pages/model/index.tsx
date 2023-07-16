import type { FeatureImportance } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BaseLayout } from "~/components/BaseLayout";
import ChurnComparisonChart from "~/components/ChurnComparisonChart";
import { ChurnDetailsModal } from "~/components/ChurnModal";
import Select from "~/components/Select";
import { type Cohort } from "~/server/api/routers/dataModelRouter";
import { api } from "~/utils/api";

const CohortsSection = ({
    modelId
}: {
    modelId?: string
}) => {

    const [features, setFeatures] = useState<Cohort[]>([]);

    const runGetCohorts = api.dataModelRouter.getCohorts.useMutation({
        onSuccess: (cohorts) => {
            setFeatures(cohorts);
        }
    })
    useEffect(() => {
        if (!modelId) return;
        runGetCohorts.mutate({
            modelId,
        })
    }, [modelId]);


    return <div className="bg-white">
        <table className="w-full">
            <thead className="w-full border-none sticky">
                <th>Event</th>
                <th>Predicted Churn</th>
                <th>Actual value</th>
                <th>Deviation</th>
                <th>Download List</th>
            </thead>
            <tbody className="w-full">
                {features.map((row) => {
                    return <tr key={row.name} className="w-full">
                        <td className="">{row.name}</td>
                        <td className="">{row.predictedChurn}</td>
                        <td className="">{row.actualChurn}</td>
                        <td className="">{row.deviation}</td>
                        <td className="underline cursor-pointer ">details</td>
                    </tr>
                })}
            </tbody>
        </table>
    </div>
}

const ChurnHistoryTable = ({
    modelId
}: {
    modelId?: string
}) => {

    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
    const [features, setFeatures] = useState<FeatureImportance[]>([]);

    const runGetFeatures = api.dataModelRouter.getFeatures.useMutation({
        onSuccess: (data) => {
            setFeatures(data);
        }
    })
    const handleOpenChange = () => {
        setSelectedFeatureId(null);
    }
    useEffect(() => {
        if (!modelId) return;
        runGetFeatures.mutate({
            modelId,
        })
    }, [modelId]);

    return <div className="bg-white flex flex-col gap-4 h-[250px] rounded-lg grow">
        <div className="flex gap-2 p-2">
            <p>Navigate to churn</p>
            <Image src="/svg/arrow-right-up.svg" alt="arrow" width={24} height={24} />
        </div>
        <table className="w-full flex flex-col gap-2 overflow-y-scroll">
            <tbody className="w-full">
                {features.map((row) => {
                    return <tr key={row.id} className="w-full">
                        <td className="border-x-0 w-full">{row.featureName}</td>
                        <td className="border-x-0">{row.type}</td>
                        <td className="border-x-0 underline cursor-pointer" onClick={() => setSelectedFeatureId(row.id)}>details</td>
                    </tr>
                })}
            </tbody>
        </table>
        {selectedFeatureId && <ChurnDetailsModal
            isOpen={!!selectedFeatureId}
            modelId={modelId}
            featureId={selectedFeatureId}
            handleOpenChange={handleOpenChange}
        />}
    </div>
}



const Home: NextPage = () => {

    const [selectedModelId, setSelectedModelId] = useState<string>();


    const { data: models } = api.dataModelRouter.getModels.useQuery();

    useEffect(() => {
        if (!models || !models.length) return;
        const model = models[0];
        if (!model) return;
        setSelectedModelId(model.id);
    }, [models]);

    const modelOptions = useMemo(() => {
        if (!models || !models.length) return [];
        return models.map((model) => ({
            label: model.name,
            value: model.id,
        }));
    }, [models]);

    const selectedModel = models?.find((model) => model.id === selectedModelId);

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Toolsyo to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout activeKey="model">
                <div className="flex flex-col justify-start">
                    <div className="h-12 flex-row flex justify-between flex-basis-content p-2 bg-homepage-tab-background">
                        <div className="flex gap-2 items-center ml-3">
                            <h3>Predicted churn for cohorts</h3>
                            <div className="bg-success-badge px-3 py-1 rounded-full">Database</div>
                        </div>
                        <div className="flex gap-2">
                            <Select title="Pre-made models" options={modelOptions} value={selectedModelId} />
                            <Select title="Dates" options={[{
                                label: '1',
                                value: '1',
                            }]} />
                        </div>
                    </div>
                    <div className="flex flex-col p-1 mx-4 gap-5">
                        <div className="my-4 p-4 border border-border shadow-md rounded-lg">
                            {selectedModel ? selectedModel.description : 'No model selected'}
                        </div>
                        <div className="flex justify-between gap-8 items-center">
                            <ChurnHistoryTable modelId={selectedModelId} />
                            <ChurnComparisonChart modelId={selectedModelId} />
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
                            <CohortsSection modelId={selectedModelId} />
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Home;
