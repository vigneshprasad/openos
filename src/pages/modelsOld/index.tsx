import type { DataModel, FeatureImportance } from "@prisma/client";
import moment from "moment";
import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { BaseLayout } from "~/components/BaseLayout";
import ChurnComparisonChart from "~/components/ChurnComparisonChart";
import CohortsSection from "~/components/CohortsSection";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import FeaturesTable from "~/components/FeaturesTable";
import { IntegrationStatus } from "~/components/IntegrationStatus";
import Select from "~/components/Select";
import { type Cohort, type Churn } from "~/server/api/routers/dataModelRouter";
import { type ExcelSheet, type SelectOption } from "~/types/types";
import { api } from "~/utils/api";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const Home: NextPage = () => {

    const [models, setModels] = useState<DataModel[]>([]);
    const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
    const [dateOptions, setDateOptions] = useState<SelectOption[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>();
    const defaultDate = moment().subtract(1, 'days').format('DD/MM/YYYY');
    const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("daily");

    const [features, setFeatures] = useState<FeatureImportance[]>([]);
    const [featuresLoading, setFeaturesLoading] = useState<boolean>(true);
    const [churnsByDay, setChurnsByDay] = useState<Churn[]>([]);
    const [churnsByDayLoading, setChurnsByDayLoading] = useState<boolean>(true);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [cohortLoading, setCohortLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<ExcelSheet>();
    const [userListLoading, setUserListLoading] = useState<boolean>(true);    

    const modelMutation = api.dataModelRouter.getModels.useMutation({
        onSuccess: (data: DataModel[]) => {
            const modelOptions = data.map((model) => ({
                label: model.name,
                value: model.id,
            }));
            setModels(data);
            setModelOptions(modelOptions);
            if(!data[0]) return;
            setSelectedModelId(data[0].id);
            const dateArray: Date[] = [];
            let currentDate = new Date(data[0].createdAt);
            while (currentDate <= yesterday) {
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
            const defaultDate = dateOptions[dateOptions.length -1 ]
            const defaultDateValue = defaultDate?.value;
            if (defaultDateValue) setSelectedDate(defaultDateValue);
        }
    });

    useMemo(() => {
        if (models && models.length > 0) return;
        modelMutation.mutate();
    }, []);

    const selectedModel = models?.find((model: DataModel) => model.id === selectedModelId);
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

    const runGetFeatures = api.dataModelRouter.getFeatures.useMutation({
        onSuccess: (data: FeatureImportance[]) => {
            setFeatures(data);
            setFeaturesLoading(false);
        }
    })

    const runChurnByDay = api.dataModelRouter.churnByDay.useMutation({
        onSuccess: (churnByDayData) => {
            setChurnsByDay(churnByDayData);
            setChurnsByDayLoading(false);
        }
    });

    const runGetCohorts = api.dataModelRouter.getCohorts.useMutation({
        onSuccess: (cohorts) => {
            setCohorts(cohorts);
            setCohortLoading(false);
        }
    })

    const runGetUserList = api.dataModelRouter.getUserList.useMutation({
        onSuccess: (userList) => {
            setUserList(userList);
            setUserListLoading(false);
        }
    })

    useMemo(() => {
        setFeaturesLoading(true);
        setChurnsByDayLoading(true);
        setCohortLoading(true);
        setUserListLoading(true);
        if (!selectedModelId) return;
        runGetFeatures.mutate({
            modelId: selectedModelId,
        });
        runChurnByDay.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
        runGetCohorts.mutate({
            modelId: selectedModelId,
        })
        runGetUserList.mutate({
            modelId: selectedModelId,
            date: selectedDate,
            period: selectedPeriod,
        })
    }, [selectedModelId])

    useMemo(() => {
        setChurnsByDayLoading(true);
        if (!selectedModelId) return;
        runChurnByDay.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            period: selectedPeriod,
        });
    }, [selectedDate, selectedPeriod])

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
                            {
                                modelOptions && dateOptions && selectedDate && selectedModelId ?
                                <form className="flex flex-row gap-5 items-center">                                
                                    <Select 
                                        title="Model Name" 
                                        options={modelOptions} 
                                        onChange={(selectedModel) => setSelectedModelId(selectedModel)} 
                                        value={selectedModelId}/>
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
                    </div>
                    <div className="p-1 mx-4 gap-5">
                        <div className="my-4 p-4 border border-border shadow-md rounded-lg">
                            {selectedModel ? selectedModel.description : 'No model selected'}
                        </div>
                        {
                            selectedModelId && selectedDate &&
                            <div className="grid grid-cols-[1fr_1.5fr] justify-between gap-8 items-center">
                                <div>
                                    {
                                    featuresLoading ?
                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                        <FeaturesTable features={features} modelId={selectedModelId} date={selectedDate}/>
                                    }
                                </div>
                                <div>
                                    {
                                        churnsByDayLoading ?
                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                        <ChurnComparisonChart churnsByDay={churnsByDay} />
                                    }
                                </div>
                            </div>
                        }
                        <div className="flex flex-col justify-between my-4">
                            <div className="bg-section-header flex flex-col gap-2 py-5 px-3 rounded-t-lg">
                                <h2 className="text-dark-text-colour font-bold">Cohort Table</h2>
                                <div className="text-subtext">Showing <span className="text-dark-text-colour">top 6</span> cohorts</div>
                            </div>
                            {
                                cohortLoading || userListLoading || !userList ?
                                <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                <CohortsSection userList={userList} cohorts={cohorts} />
                            }
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Home;
