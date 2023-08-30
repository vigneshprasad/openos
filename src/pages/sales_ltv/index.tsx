import type { FeatureImportance, Insights } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import { BaseLayout2 } from "~/components/BaseLayout2";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import FeaturesImportanceTable from "~/components/FeatureImportanceTable";
import { PrimaryButton2 } from "~/components/PrimaryButton2";
import { ScatterPlot } from "~/components/ScatterPlot";
import Select from "~/components/Select";
import { type ChurnCards, type ScatterPlotData, type DataModelList, type UsersByBucket } from "~/server/api/routers/dataModelRouter";
import { type SelectOption } from "~/types/types";
import { api } from "~/utils/api";
import Image from "next/image";
import moment from "moment";
import UsersFeatureImportance from "~/components/UsersFeatureImportance";


const B2BSaas: NextPage = () => {
    const [models, setModels] = useState<DataModelList[]>([]);
    const [modelsLoading, setModelsLoading] = useState<boolean>(true);
    const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>();
    
    // CHURN CARD STATES
    const [churnCardData, setChurnCardData] = useState<ChurnCards>();
    const [churnCardLoading, setChurnCardLoading] = useState<boolean>(true);
    
    // FEATURE IMPORTANCE STATES
    const [features, setFeatures] = useState<FeatureImportance[]>();
    const [featuresLoading, setFeaturesLoading] = useState<boolean>(true);

    // SCATTER PLOT STATES
    const [scatterPlotData, setScatterPlotDataLoading] = useState<ScatterPlotData>();
    const [scatterPlotLoading, setScatterPlotLoading] = useState<boolean>(true);
    const [selectedFeature, setSelectedFeature] = useState<FeatureImportance>();

    // INSIGHT AND ACTIONABLE INSIGHTS
    const [insights, setInsights] = useState<Insights[]>();
    const [insightsLoading, setInsightsLoading] = useState<boolean>(true);
    const [selectedInsight, setSelectedInsight] = useState<Insights>();

    // USERS BY BUCKET
    const [usersByBucket, setUsersByBucket] = useState<UsersByBucket[]>([]);
    const [usersByBucketLoading, setUsersByBucketLoading] = useState<boolean>(true);
    
    const loading = churnCardLoading || featuresLoading || scatterPlotLoading || insightsLoading;

    // SETTING FIRST MODEL AS DEFAULT
    const modelMutation = api.dataModelRouter.getB2BSaasModels.useMutation({
        onSuccess: (data) => {
            if(!data) return;
            const modelOptions = data.map((model) => ({
                label: model.model.name,
                value: model.model.id,
            }));
            setModels(data);
            setModelOptions(modelOptions);
            setModelsLoading(false);
            if (!data[0]) return;
            handleModelChange(data[0].model.id, data);
        }
    });

    // GET MODELS ON FIRST LOAD
    useEffect(() => {
        if (models && models.length > 0) return;

        modelMutation.mutate()
    }, []);

    // DATA MUTATIONS
    const runGetChurnCards = api.dataModelRouter.getChurnCards.useMutation({
        onSuccess: (data: ChurnCards) => {
            setChurnCardData(data);
            setChurnCardLoading(false);
        }
    });

    const runGetFeatures = api.dataModelRouter.getFeatures.useMutation({
        onSuccess: (data: FeatureImportance[]) => {
            setFeatures(data);
            setFeaturesLoading(false);
            if(data[0]) {
                handleFeatureChange(data[0].id, data[0]);
            }
        }
    })

    const runGetScatterPlot = api.dataModelRouter.getScatterPlot.useMutation({
        onSuccess: (data: ScatterPlotData) => {
            setScatterPlotDataLoading(data);
            setScatterPlotLoading(false);
        }
    })

    const runGetInsights = api.insightsRouter.getInsights.useMutation({
        onSuccess: (data: Insights[]) => {
            setInsights(data);
            setInsightsLoading(false);
            setSelectedInsight(data[0]);
        }
    })

    const runGetUsersByBucket = api.dataModelRouter.getUsersByBucket.useMutation({
        onSuccess: (data) => {
            setUsersByBucket(data);
            setUsersByBucketLoading(false);
        }
    })

    // CHANGE HANDLERS
    const handleModelChange = (value: string, dataModels?: DataModelList[]) => {
        setSelectedModelId(value);
        let selectedModel = models?.find((model: DataModelList) => model.model.id === value);
        if(dataModels) {
            selectedModel = dataModels?.find((model: DataModelList) => model.model.id === value);
        }
        if(!selectedModel) return;
        reRunAllQueries(value);
    }

    const handleFeatureChange = (value: string, selectedFeature?: FeatureImportance) => {
        const feature = features?.find((feature) => feature.id === value);
        if(!feature && !selectedFeature) return;
        setSelectedFeature(feature ? feature : selectedFeature);
        if(!selectedModelId) return;
        const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);
        if(!selectedModel) return;
        setScatterPlotLoading(true);
        runGetScatterPlot.mutate({
            modelId: selectedModelId,
            featureId: value,
            date: moment(selectedModel.start_date).format('DD/MM/YYYY'),
            endDate: moment().format('DD/MM/YYYY'),
        })
    }

    // RE RUN ALL QUERIES
    const reRunAllQueries = (modelId: string) => {
        setChurnCardLoading(true);
        setFeaturesLoading(true);
        setInsightsLoading(true);
        setUsersByBucketLoading(true);
        const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);
        const startDate = selectedModel?.start_date ? moment(selectedModel?.start_date).format('DD/MM/YYYY') : '01/01/2023';
        const endDate = moment().format('DD/MM/YYYY');

        runGetChurnCards.mutate({
            date: startDate,
            modelId: modelId,
            endDate: endDate,
        });

        runGetFeatures.mutate({
            modelId: modelId,
        });

        runGetInsights.mutate({
            modelId: modelId,
        });

        runGetUsersByBucket.mutate({
            modelId: modelId,
        })
    }

    const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout2 activeKey="sales_ltv">
                <div className="flex flex-col">
                    {modelsLoading || models.length > 0 ? 
                        <div>
                            {/* Navbar Selection Filters */}
                            <div className="flex flex-row justify-end gap-2 p-4 border-border-colour border-b bg-white">
                                {
                                    modelOptions && selectedModelId ?
                                        <form className="flex flex-row gap-5 items-center">
                                            <Select
                                                title="Model Name"
                                                options={modelOptions}
                                                onChange={handleModelChange}
                                                disabled={loading}
                                                value={selectedModelId} />
                                        </form>
                                        :
                                        <p> Loading</p>
                                }
                            </div>

                            <div className="bg-page-background-colour flex justify-center">
                                <div className="w-[100ch]">
                                    {/* Model Title Card */}
                                    <div className="my-8 p-6 border-2 border-blue-card-border-colour bg-blue-card-background-colour rounded-lg">
                                        {selectedModel ?
                                            <div className="grid grid-cols-[3fr_1fr]">
                                                <div>
                                                    <p className="mb-1"> {selectedModel.model.name}</p>
                                                    <p className="text-light-text-colour text-sm">{selectedModel.model.description} </p>
                                                </div>
                                                <div className="flex justify-end my-auto">
                                                    <PrimaryButton2 onClick={() => router.push('/create_model')}>
                                                        Create Model
                                                    </PrimaryButton2>
                                                </div>                                        
                                            </div> : 
                                            <FadingCubesLoader height={50} width={50}/>
                                        }
                                    </div>
                                    { selectedModel && selectedModelId &&
                                        <div>
                                            {/* Churn Cards */}
                                            <div className="grid grid-cols-3 gap-5 mb-8">
                                                <div className="bg-white drop-shadow-md rounded-lg p-6">
                                                    {
                                                        churnCardLoading || !churnCardData ?
                                                            <div className="flex justify-center"> <FadingCubesLoader height={50} width={50} /> </div> :
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-dark-grey-text-colour text-sm font-semibold">
                                                                    Number of Users
                                                                </div>
                                                                <div className="text-2xl text-dark-text-colour">
                                                                    {churnCardData?.totalUsers}
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                                <div className="bg-white drop-shadow-md rounded-lg p-6">
                                                    {
                                                        churnCardLoading || !churnCardData ?
                                                            <div className="flex justify-center"> <FadingCubesLoader height={50} width={50} /> </div> :
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-dark-grey-text-colour text-sm font-semibold">
                                                                    Predicted Conversion Rate
                                                                </div>
                                                                <div className="text-2xl text-dark-text-colour">
                                                                    {churnCardData?.predictedChurn.toFixed(2)} %
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                                <div className="bg-white drop-shadow-md rounded-lg p-6">
                                                    {
                                                        churnCardLoading || !churnCardData ?
                                                            <div className="flex justify-center"> <FadingCubesLoader height={50} width={50} /> </div> :
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-dark-grey-text-colour text-sm font-semibold">
                                                                    Actual Conversion
                                                                </div>
                                                                <div className="text-2xl text-dark-text-colour">
                                                                    {churnCardData?.actualChurn ? churnCardData?.actualChurn.toFixed(2) : '-'} %
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                            </div>

                                            {/* Feature Importance */}
                                            {
                                                (features === undefined || features.length > 0) &&
                                                    <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                    {
                                                        featuresLoading || !features ?
                                                            <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                            <div>
                                                                <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                    <div className="text-dark-text-colour font-medium my-auto">
                                                                        Features impacting the target variable 🎯
                                                                    </div>                                                  
                                                                </div>
                                                                <FeaturesImportanceTable features={features} />
                                                            </div>
                                                    }
                                                </div>
                                            }

                                            {/* Scatter Plot */}
                                            {
                                                <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                    {
                                                        featuresLoading || !features ?
                                                            <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                            <div>
                                                                <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                    <div className="text-dark-text-colour font-medium my-auto">Feature Importance Exploration</div>
                                                                    <Select
                                                                        title="Cohort"
                                                                        options={features.map((feature) => {
                                                                            return {
                                                                                label: feature.featureName,
                                                                                value: feature.id
                                                                            }
                                                                        })}
                                                                        onChange={handleFeatureChange}
                                                                        value={selectedFeature?.id} />                                                        
                                                                </div>
                                                                {
                                                                    scatterPlotLoading || !scatterPlotData || !selectedFeature ?
                                                                    <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                                    <div className="p-4">
                                                                        <ScatterPlot scatterPlotData={scatterPlotData} title={selectedFeature?.featureName}  />
                                                                    </div>
                                                                }
                                                            </div>
                                                    }
                                                </div>
                                            }

                                            {/* Insights */}
                                            {
                                                (insights == undefined || insights.length > 0) && 
                                                <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                {
                                                    insightsLoading || !insights || !selectedInsight ?
                                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                        <div>
                                                            <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                <div className="text-dark-text-colour font-medium my-auto">Actionables Derived from your Data using AI 🤖</div>
                                                            </div>
                                                            <div className="grid grid-cols-[1fr_2fr]">
                                                                <div className="p-4">
                                                                    {
                                                                    insights.map((insight, index) => {                                                                    
                                                                            if(insight.id === selectedInsight.id) {
                                                                                return (
                                                                                    <div 
                                                                                        key={index} 
                                                                                        className="mb-4 px-4 py-2 bg-blue-card-background-colour border border-blue-card-border-colour rounded-md cursor-pointer" 
                                                                                        onClick={() => setSelectedInsight(insight)}>
                                                                                        <div className="text-dark-text-colour text-sm">{insight.title}</div>
                                                                                    </div>
                                                                                )
                                                                            } else {
                                                                                return (
                                                                                    <div 
                                                                                        key={index} 
                                                                                        className="mb-4 px-4 py-2 cursor-pointer"
                                                                                        onClick={() => setSelectedInsight(insight)}>
                                                                                        <div className="text-dark-text-colour text-sm">{insight.title}</div>
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        })
                                                                    }
                                                                </div>
                                                                <div className="bg-lighter-grey-background-colour flex flex-row">
                                                                    <div className="p-6 my-auto">
                                                                        <div className="text-dark-text-colour mb-2 text-sm">{selectedInsight.title}</div>
                                                                        <div className="text-dark-grey-text-colour mb-2 text-xs font-light">{selectedInsight.description}</div>
                                                                    </div>
                                                                    <Image 
                                                                        className="w-2/5 m-1 rounded-md"
                                                                        src={`/insight${(insights.indexOf(selectedInsight) % 5) + 1}.png`} 
                                                                        alt={selectedInsight.title}
                                                                        width={0}
                                                                        height={0}
                                                                        sizes="100vw"
                                                                        />
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                                </div>
                                            }

                                            {/* Users by Bucket */}
                                            {
                                                (usersByBucket == undefined || usersByBucket.length > 0) &&
                                                <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                {
                                                    usersByBucketLoading || !usersByBucket ?
                                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                        <div>
                                                            <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                <div className="text-dark-text-colour font-medium my-auto">Retention Predictions by Account</div>
                                                            </div>
                                                            <div>
                                                                <UsersFeatureImportance data={usersByBucket} />
                                                            </div>
                                                        </div>
                                                }
                                                </div>
                                            }


                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    :
                        <div className="mx-auto my-auto h-full mt-[30vh] text-center">
                            <Image 
                                className="mx-auto"
                                src="/404.png"
                                width={200}
                                height={200} 
                                alt={"404"}/>
                            We could not find any models. Please create a model to get started.
                        </div>
                    }
                </div>
            </BaseLayout2>
        </>
    );
};

export default B2BSaas;
