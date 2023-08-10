import type { FeatureImportance, Insights } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import AreaGraph from "~/components/AreaGraph";
import { BaseLayout2 } from "~/components/BaseLayout2";
import CohortTable from "~/components/CohortTable";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import FeaturesImportanceTable from "~/components/FeatureImportanceTable";
import { PrimaryButton2 } from "~/components/PrimaryButton2";
import { ScatterPlot } from "~/components/ScatterPlot";
import Select from "~/components/Select";
import UsersTable from "~/components/UsersTable";
import { type ModelGraph, type Cohort, type ChurnCards, type AggregateChurnByPrimaryCohorts, type IncludeAndExcludeUsers, type ScatterPlotData, type DataModelList } from "~/server/api/routers/dataModelRouter";
import { type ExcelSheet, type SelectOption } from "~/types/types";
import { api } from "~/utils/api";
import { convertSimpleReportToExcel } from "~/utils/convertJSONtoExcel";
import Image from "next/image"


const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const Home: NextPage = () => {

    const [models, setModels] = useState<DataModelList[]>([]);
    const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
    const [dateOptions, setDateOptions] = useState<SelectOption[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<string>();
    const [selectedEndDate, setSelectedEndDate] = useState<string>();
    const [selectedPeriod, setSelectedPeriod] = useState<string>("daily");
    
    //CHURN CARD STATES
    const [churnCardData, setChurnCardData] = useState<ChurnCards>();
    const [churnCardLoading, setChurnCardLoading] = useState<boolean>(true);


    //PRIMARY GRAPH STATES
    const [primaryGraphData, setPrimaryGraphData] = useState<ModelGraph>();
    const [primaryGraphLoading, setPrimaryGraphLoading] = useState<boolean>(true);
    const [selectedPrimaryGraph, setSelectedPrimaryGraph] = useState<'cohort 1' | 'cohort 2'>('cohort 1');

    //AGGREGATE CHURN FOR PRIMARY METRICS STATES
    const [aggregateChurnByPrimaryCohorts, setAggregateChurnByPrimaryCohorts] = useState<AggregateChurnByPrimaryCohorts>();
    const [aggregateChurnByPrimaryCohortsLoading, setAggregateChurnByPrimaryCohortsLoading] = useState<boolean>(true);

    //USER LIST STATES
    const [userList, setUserList] = useState<ExcelSheet>();
    const [userListLoading, setUserListLoading] = useState<boolean>(true);
    
    //FEATURE IMPORTANCE STATES
    const [features, setFeatures] = useState<FeatureImportance[]>();
    const [featuresLoading, setFeaturesLoading] = useState<boolean>(true);

    // SCATTER PLOT STATES
    const [scatterPlotData, setScatterPlotDataLoading] = useState<ScatterPlotData>();
    const [scatterPlotLoading, setScatterPlotLoading] = useState<boolean>(true);
    const [selectedFeature, setSelectedFeature] = useState<FeatureImportance>();

    //INCLUDE AND EXCLUDE USERS
    const [includeAndExcludeUsers, setIncludeAndExcludeUsers] = useState<IncludeAndExcludeUsers>();
    const [includeAndExcludeUsersLoading, setIncludeAndExcludeUsersLoading] = useState<boolean>(true);

    //INSIGHT AND ACTIONABLE INSIGHTS
    const [insights, setInsights] = useState<Insights[]>();
    const [insightsLoading, setInsightsLoading] = useState<boolean>(true);
    const [selectedInsight, setSelectedInsight] = useState<Insights>();


    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [cohortLoading, setCohortLoading] = useState<boolean>(true);


    //SETTING FIRST MODEL AS DEFAULT
    const modelMutation = api.dataModelRouter.getModels.useMutation({
        onSuccess: (data) => {
            if(!data) return;
            const modelOptions = data.map((model) => ({
                label: model.model.name,
                value: model.model.id,
            }));
            setModels(data);
            setModelOptions(modelOptions);
            if (!data[0]) return;
            setSelectedModelId(data[0].model.id);
            const dateArray: Date[] = [];
            let currentDate = new Date(data[0].start_date);
            while (currentDate <= data[0].end_date) {
                dateArray.push(new Date(currentDate));
                const tempDate = new Date(currentDate);
                tempDate.setDate(tempDate.getDate() + 1);
                currentDate = tempDate;
            }
            const dateOptions = dateArray.map((date) => {
                const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                return {
                    label: dateString,
                    value: dateString,
                }
            });
            setDateOptions(dateOptions);
            const defaultDate = dateOptions[dateOptions.length - 1]
            const defaultDateValue = defaultDate?.value;
            if (defaultDateValue) setSelectedDate(defaultDateValue);
        }
    });

    useEffect(() => {
        if (models && models.length > 0) return;
        modelMutation.mutate();
    }, []);

    const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);
    const availableTimePeriods = useMemo(() => {
        setSelectedPeriod("daily");
        return [{
            label: "Daily",
            value: "daily"
        }, {
            label: "Weekly",
            value: "weekly"
        }];
    }, []);

    const runGetChurnCards = api.dataModelRouter.getChurnCards.useMutation({
        onSuccess: (data: ChurnCards) => {
            setChurnCardData(data);
            setChurnCardLoading(false);
        }
    });

    const modelPrimaryGraph = api.dataModelRouter.modelPrimaryGraph.useMutation({
        onSuccess: (primaryGraphData) => {
            setPrimaryGraphData(primaryGraphData);
            setPrimaryGraphLoading(false);
        }
    });

    const runGetAggregateChurnByPrimaryCohorts = api.dataModelRouter.getAggregateChurnByPrimaryCohorts.useMutation({
        onSuccess: (aggregateChurnData) => {
            setAggregateChurnByPrimaryCohorts(aggregateChurnData);
            setAggregateChurnByPrimaryCohortsLoading(false);
        }
    });

    const runGetUserList = api.dataModelRouter.getUserList.useMutation({
        onSuccess: (userList) => {
            setUserList(userList);
            setUserListLoading(false);
        }
    })

    const runGetFeatures = api.dataModelRouter.getFeatures.useMutation({
        onSuccess: (data: FeatureImportance[]) => {
            setFeatures(data);
            setFeaturesLoading(false);
            setSelectedFeature(data[0]);
        }
    })

    const runGetUsersToIncludeAndExclude = api.dataModelRouter.getUsersToIncludeAndExclude.useMutation({
        onSuccess: (data: IncludeAndExcludeUsers) => {
            setIncludeAndExcludeUsers(data);
            setIncludeAndExcludeUsersLoading(false);
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

    useEffect(() => {
        if (!selectedModelId) return;
        const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);
        if(!selectedModel) return;
        const dateArray: Date[] = [];
        let currentDate = new Date(selectedModel.start_date);
        while (currentDate <= selectedModel.end_date) {
            dateArray.push(new Date(currentDate));
            const tempDate = new Date(currentDate);
            tempDate.setDate(tempDate.getDate() + 1);
            currentDate = tempDate;
        }
        const dateOptions = dateArray.map((date) => {
            const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return {
                label: dateString,
                value: dateString,
            }
        });
        setDateOptions(dateOptions);
        const defaultDate = dateOptions[dateOptions.length - 1]
        const defaultDateValue = defaultDate?.value;
        if (defaultDateValue) setSelectedDate(defaultDateValue);

    }, [selectedModelId]);


    useEffect(() => {
        setChurnCardLoading(true);
        setPrimaryGraphLoading(true);
        setAggregateChurnByPrimaryCohortsLoading(true);
        setUserListLoading(true);
        setFeaturesLoading(true);
        setIncludeAndExcludeUsersLoading(true);

        setCohortLoading(true);
        if (!selectedModelId || !selectedDate) return;
        runGetChurnCards.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        modelPrimaryGraph.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        runGetAggregateChurnByPrimaryCohorts.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        runGetUserList.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        runGetFeatures.mutate({
            modelId: selectedModelId,
        });
        runGetUsersToIncludeAndExclude.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        runGetInsights.mutate({
            modelId: selectedModelId,
        });
    }, [selectedModelId, selectedDate, selectedPeriod])

    useEffect(() => {
        if(!selectedFeature || !selectedModelId || !selectedDate) return;
        runGetScatterPlot.mutate({
            modelId: selectedModelId,
            featureId: selectedFeature?.id,
            date: selectedDate,
            period: selectedPeriod,
        })
    }, [selectedFeature, selectedModelId, selectedDate, selectedPeriod])

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout2 activeKey="models">
                <div className="flex flex-col">
                    {/* Navbar Selection Filters */}
                    <div className="flex flex-row justify-end gap-2 p-4 border-border-colour border-b bg-white">
                        {
                            modelOptions && dateOptions && selectedDate && selectedModelId ?
                                <form className="flex flex-row gap-5 items-center">
                                    <Select
                                        title="Model Name"
                                        options={modelOptions}
                                        onChange={(selectedModel) => setSelectedModelId(selectedModel)}
                                        value={selectedModelId} />
                                    <Select
                                        title="Time Period"
                                        options={availableTimePeriods}
                                        onChange={(selectedPeriod) => setSelectedPeriod(selectedPeriod)}
                                        defaultValue={availableTimePeriods[0]?.value}
                                        value={selectedPeriod} />
                                    <Select
                                        title="Date"
                                        options={dateOptions}
                                        onChange={(selectedDate) => setSelectedDate(selectedDate)}
                                        value={selectedDate} />
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
                                            <PrimaryButton2 onClick={() => router.push('/create-model')}>
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
                                                        <div className="flex flex-row gap-1">
                                                            {
                                                                churnCardData.totalUsersDeviation > 0 ? 
                                                                <div className="text-green-text-colour text-xs">
                                                                    ↑ {churnCardData.totalUsersDeviation.toFixed(2)} %
                                                                </div>
                                                                :
                                                                <div className="text-red-text-colour text-xs">
                                                                    ↓ {churnCardData.totalUsersDeviation.toFixed(2)} %
                                                                </div>
                                                            }
                                                            <div className="text-dark-grey-text-colour font-light text-xs">
                                                                {
                                                                    selectedPeriod === 'daily' ? 'vs. Yesterday' : 'vs. Last Week'
                                                                }
                                                            </div>
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
                                                            Predicted Churn
                                                        </div>
                                                        <div className="text-2xl text-dark-text-colour">
                                                            {churnCardData?.predictedChurn.toFixed(2)} %
                                                        </div>
                                                        <div className="flex flex-row gap-1">
                                                            {
                                                                churnCardData.predictedChurnDeviation > 0 ? 
                                                                <div className="text-green-text-colour text-xs">
                                                                    ↑ {churnCardData.predictedChurnDeviation.toFixed(2)} %
                                                                </div>
                                                                :
                                                                <div className="text-red-text-colour text-xs">
                                                                    ↓ {churnCardData.predictedChurnDeviation.toFixed(2)} %
                                                                </div>
                                                            }
                                                            <div className="text-dark-grey-text-colour font-light text-xs">
                                                                {
                                                                    selectedPeriod === 'daily' ? 'vs. Yesterday' : 'vs. Last Week'
                                                                }
                                                            </div>
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
                                                            Actual Churn
                                                        </div>
                                                        <div className="text-2xl text-dark-text-colour">
                                                            {churnCardData?.actualChurn ? churnCardData?.actualChurn.toFixed(2) : '-'}
                                                        </div>
                                                        {   
                                                            churnCardData?.actualChurnDeviation &&
                                                            <div className="flex flex-row gap-1">
                                                                {
                                                                    churnCardData.actualChurnDeviation > 0 ? 
                                                                    <div className="text-green-text-colour text-xs">
                                                                        ↑ {churnCardData.actualChurnDeviation.toFixed(2)} %
                                                                    </div>
                                                                    :
                                                                    <div className="text-red-text-colour text-xs">
                                                                        ↓ {churnCardData.actualChurnDeviation.toFixed(2)} %
                                                                    </div>
                                                                }
                                                                <div className="text-dark-grey-text-colour font-light text-xs">
                                                                    {
                                                                        selectedPeriod === 'daily' ? 'vs. Yesterday' : 'vs. Last Week'
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                            }
                                        </div>
                                    </div>

                                    {/* Primary Graph */}
                                    {
                                        (primaryGraphData === undefined || primaryGraphData.cohort1.data.length > 0 || primaryGraphData.cohort2.data.length > 0) && 
                                        <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                            {
                                                primaryGraphLoading || !primaryGraphData || !selectedPrimaryGraph ?
                                                    <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                    <div>
                                                        <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                            <div className="text-dark-text-colour font-medium my-auto">Predicted Churn by Source</div>
                                                            <Select
                                                                title="Cohort"
                                                                options={[{
                                                                    label: primaryGraphData.cohort1.title,
                                                                    value: 'cohort 1',
                                                                }, {
                                                                    label: primaryGraphData.cohort2.title,
                                                                    value: 'cohort 2'
                                                                }]}
                                                                onChange={
                                                                    (selectedPrimaryGraph) => 
                                                                        setSelectedPrimaryGraph(selectedPrimaryGraph === 'cohort 1' ? 'cohort 1' : 'cohort 2')
                                                                }
                                                                value={selectedPrimaryGraph} />                                                        
                                                        </div>
                                                        <div className="p-4">
                                                            <AreaGraph 
                                                                graphData={selectedPrimaryGraph === 'cohort 1' ? primaryGraphData.cohort1 : primaryGraphData.cohort2} 
                                                                categoriesFormat={selectedPeriod === "daily" ? "h:mm a" : "MMM Do YYYY"} />
                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                    }
                                    
                                    {/* Aggregate Churn by Primary Cohorts */}
                                    {
                                        (aggregateChurnByPrimaryCohorts === undefined || aggregateChurnByPrimaryCohorts.cohort1.data.length > 0 || aggregateChurnByPrimaryCohorts.cohort2.data.length > 0) &&
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-white drop-shadow-md rounded-lg">
                                                {
                                                    aggregateChurnByPrimaryCohortsLoading || userListLoading || !aggregateChurnByPrimaryCohorts || !userList ?
                                                        <div className="flex justify-center"> <FadingCubesLoader height={100} width={100} /> </div> :
                                                        <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                            <div className="border-b border-border-colour">
                                                                <div className="text-dark-text-colour font-medium my-auto p-6">Aggregate Predicted Churn by {aggregateChurnByPrimaryCohorts.cohort1.title}</div>
                                                            </div>
                                                            <div>
                                                                <CohortTable data={aggregateChurnByPrimaryCohorts.cohort1.data} />
                                                            </div>
                                                            <div className="border-t border-border-colour p-4">
                                                                <CSVLink className="w-fit-content mx-auto" data={convertSimpleReportToExcel(userList.sheet)}       target="_blank">
                                                                    <PrimaryButton2 paddingY={1}>
                                                                        <p>Download All Users</p>
                                                                    </PrimaryButton2>
                                                                </CSVLink>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                            <div className="bg-white drop-shadow-md rounded-lg">
                                                {
                                                    aggregateChurnByPrimaryCohortsLoading || userListLoading || !aggregateChurnByPrimaryCohorts || !userList ?
                                                        <div className="flex justify-center"> <FadingCubesLoader height={100} width={100} /> </div> :
                                                        <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                            <div className="border-b border-border-colour">
                                                                <div className="text-dark-text-colour font-medium my-auto p-6">Aggregate Predicted Churn by {aggregateChurnByPrimaryCohorts.cohort2.title}</div>
                                                            </div>
                                                            <div className="mb-">
                                                                <CohortTable data={aggregateChurnByPrimaryCohorts.cohort2.data} />
                                                            </div>
                                                            <div className="border-t border-border-colour p-4">
                                                                <CSVLink className="w-fit-content mx-auto" data={convertSimpleReportToExcel(userList.sheet)}       target="_blank">
                                                                    <PrimaryButton2 paddingY={1}>
                                                                        <p>Download All Users</p>
                                                                    </PrimaryButton2>
                                                                </CSVLink>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    }

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
                                        (scatterPlotData === undefined || scatterPlotData.series.length > 0) && 
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
                                                                onChange={
                                                                    (selectedFeature) => 
                                                                        setSelectedFeature(features.find(feature => feature.id === selectedFeature))
                                                                }
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

                                    {/* Include and Exclude List */}
                                    {
                                        (includeAndExcludeUsers === undefined || includeAndExcludeUsers.include.users.length > 0) &&
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-white drop-shadow-md rounded-lg">
                                                {
                                                    includeAndExcludeUsersLoading || !includeAndExcludeUsers ?
                                                        <div className="flex justify-center"> <FadingCubesLoader height={100} width={100} /> </div> :
                                                        <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                            <div className="border-b border-border-colour">
                                                                <div className="text-dark-text-colour font-medium my-auto p-6">Type of Users to Avoid When Marketing 🤦🏼‍♂️</div>
                                                            </div>
                                                            <div>
                                                                <UsersTable data={includeAndExcludeUsers.exclude.users} />
                                                            </div>
                                                            <div className="border-t border-border-colour p-4">
                                                                <CSVLink 
                                                                    className="w-fit-content mx-auto" 
                                                                    data={convertSimpleReportToExcel(includeAndExcludeUsers?.include.userList.sheet)}
                                                                    target="_blank">
                                                                    <PrimaryButton2 paddingY={1}>
                                                                        <p>Download List</p>
                                                                    </PrimaryButton2>
                                                                </CSVLink>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                            <div className="bg-white drop-shadow-md rounded-lg">
                                                {
                                                    includeAndExcludeUsersLoading || !includeAndExcludeUsers ?
                                                        <div className="flex justify-center"> <FadingCubesLoader height={100} width={100} /> </div> :
                                                        <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                            <div className="border-b border-border-colour">
                                                                <div className="text-dark-text-colour font-medium my-auto p-6">Type of Users to Target When Marketing 🕵🏻</div>
                                                            </div>
                                                            <div className="mb-">
                                                                <UsersTable data={includeAndExcludeUsers.include.users} />
                                                            </div>
                                                            <div className="border-t border-border-colour p-4">
                                                                <CSVLink 
                                                                    className="w-fit-content mx-auto" 
                                                                    data={convertSimpleReportToExcel(includeAndExcludeUsers?.exclude.userList.sheet)}
                                                                    target="_blank">
                                                                    <PrimaryButton2 paddingY={1}>
                                                                        <p>Download List</p>
                                                                    </PrimaryButton2>
                                                                </CSVLink>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
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
                                                                src={`/insight${insights.indexOf(selectedInsight) + 1}.png`} 
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
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </BaseLayout2>
        </>
    );
};

export default Home;
