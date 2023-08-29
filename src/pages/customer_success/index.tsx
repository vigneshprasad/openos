import { type CustomerSuccessUsersFilter, type Insights } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import { BaseLayout2 } from "~/components/BaseLayout2";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import { PrimaryButton2 } from "~/components/PrimaryButton2";
import Select from "~/components/Select";
import { type ChurnCards, type DataModelList, type ChurnByThreshold, type UserToContact, type UserToContactPaginationResponse } from "~/server/api/routers/dataModelRouter";
import { type SelectOption } from "~/types/types";
import { api } from "~/utils/api";
import Image from "next/image";
import moment from "moment";
import ChurnByThresholdTable from "~/components/ChurnByThresholdTable";
import UsersToContactTable from "~/components/UsersToContact";


const CustomerSuccess: NextPage = () => {

    const [models, setModels] = useState<DataModelList[]>([]);
    const [modelsLoading, setModelsLoading] = useState<boolean>(true);
    const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
    const [dateOptions, setDateOptions] = useState<SelectOption[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<string>();
    const [selectedEndDate, setSelectedEndDate] = useState<string>();

    // CHURN CARD STATES
    const [churnCardData, setChurnCardData] = useState<ChurnCards>();
    const [churnCardLoading, setChurnCardLoading] = useState<boolean>(true);

    // INSIGHT AND ACTIONABLE INSIGHTS
    const [insights, setInsights] = useState<Insights[]>();
    const [insightsLoading, setInsightsLoading] = useState<boolean>(true);
    const [selectedInsight, setSelectedInsight] = useState<Insights>();

    // CHURN BY THRESHOLD STATES
    const [churnByThreshold, setChurnByThreshold] = useState<ChurnByThreshold[]>();
    const [churnByThresholdLoading, setChurnByThresholdLoading] = useState<boolean>(true);

    // USER FILTER STATES
    const [userFilterList, setUserFilterList] = useState<SelectOption[]>([]);
    const [userFilterListLoading, setUserFilterListLoading] = useState<boolean>(true);
    const [selectedUserFilter, setSelectedUserFilter] = useState<string>();
    const [userFilterInputText, setUserFilterInputText] = useState<string>();

    // USER LIST STATES
    const [userList, setUserList] = useState<UserToContact[]>([]);
    const [userListLoading, setUserListLoading] = useState<boolean>(true);
    const [totalLength, setTotalLength] = useState<number>(0);
    const [userListLoadingMore, setUserListLoadingMore] = useState<boolean>(false);

    const loading = churnCardLoading || insightsLoading;

    // SETTING FIRST MODEL AS DEFAULT
    const modelMutation = api.dataModelRouter.getModels.useMutation({
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

    // LOADING MODELS ON FIRST LOAD
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

    const runGetInsights = api.insightsRouter.getInsights.useMutation({
        onSuccess: (data: Insights[]) => {
            setInsights(data);
            setInsightsLoading(false);
            setSelectedInsight(data[0]);
        }
    })

    const runChurnByThreshold = api.dataModelRouter.getChurnByThreshold.useMutation({
        onSuccess: (data: ChurnByThreshold[]) => {
            setChurnByThreshold(data);
            setChurnByThresholdLoading(false);
        }
    })

    const runGetUserList = api.dataModelRouter.getUsersToContact.useMutation({
        onSuccess: (data: UserToContactPaginationResponse) => {
            const newUserList = userList.concat(data.users);
            setUserList(newUserList);
            setTotalLength(data.total);
            setUserListLoading(false);
            setUserListLoadingMore(false);
        }
    })

    const runGetCustomerSuccessUsersFilter = api.dataModelRouter.getCustomerSuccessUsersFilter.useMutation({
        onSuccess: (data: CustomerSuccessUsersFilter[]) => {
            let userFilterList = data.map((filter) => ({
                label: filter.fieldName,
                value: filter.id,
            }));
            userFilterList = [{
                label: 'All',
                value: 'all',
            }, ...userFilterList]
            setUserFilterList(userFilterList);
            setSelectedUserFilter(userFilterList[0]?.value);
            setUserFilterListLoading(false);
        }
    })

    // SELECTION HANDLERS
    const handleModelChange = (value: string, dataModels?: DataModelList[]) => {
        setSelectedModelId(value);
        setUserList([]);
        let selectedModel = models?.find((model: DataModelList) => model.model.id === value);
        if(dataModels) {
            selectedModel = dataModels?.find((model: DataModelList) => model.model.id === value);
        }
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
        if (defaultDateValue) {
            setSelectedDate(defaultDateValue);
            setSelectedEndDate(defaultDateValue);
            reRunAllQueries(value, defaultDateValue, defaultDateValue, true);
        }
    }

    const handleDateChange = (value: string) => {
        if(!value) return;
        setSelectedUserFilter(undefined);
        setUserFilterInputText('');
        setSelectedDate(value);
        setUserList([]);
        if (moment(value, 'DD/MM/YYYY').isAfter(moment(selectedEndDate, 'DD/MM/YYYY'))) {
            setSelectedEndDate(value);
        }
        if(loading || !selectedModelId || !selectedEndDate) return;
        reRunAllQueries(selectedModelId, value, selectedEndDate);
    }

    const handleEndDateChange = (value: string) => {
        if(!value) return;
        setSelectedEndDate(value);
        if (moment(value, 'DD/MM/YYYY').isBefore(moment(selectedDate, 'DD/MM/YYYY'))) {
            setSelectedDate(value);
        }
        if(loading || !selectedModelId || !selectedDate) return;
        reRunAllQueries(selectedModelId, selectedDate, value);
    }

    const handleLoadMore = () => {
        setUserListLoadingMore(true);
        if(!selectedDate || !selectedModelId || !selectedDate) return;
        const selectedFilter = userFilterList.find((filter) => filter.value === selectedUserFilter)?.label;
        const filterName = selectedFilter === 'all' ? undefined : selectedFilter;
        runGetUserList.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            endDate: selectedDate,
            skip: userList.length,
            filterName: filterName,
            filterValue: userFilterInputText,
        });
    }

    const handleUserFilterSubmit = () => {
        if(!selectedUserFilter || !selectedModelId || !selectedDate) return;
        const selectedFilter = userFilterList.find((filter) => filter.value === selectedUserFilter);
        selectedUserFilter === 'all' ? undefined : selectedUserFilter;
        setUserListLoading(true);
        setUserList([]);
        runGetUserList.mutate({
            date: selectedDate,
            modelId: selectedModelId,
            endDate: selectedDate,
            skip: 0,
            filterName: selectedFilter?.label,
            filterValue: userFilterInputText,
        });
    }

    const handleCustomerSuccessFilterChange = (value: string) => {
        // if(!value) return;
        const selectedFilter = userFilterList.find((filter) => filter.value === value);
        if(!selectedFilter) return;
        setSelectedUserFilter(selectedFilter?.value as string);
    }


    // RE-RUN ALL QUERIES
    const reRunAllQueries = (modelId: string, date: string, endDate: string, modelChange?: boolean) => {
        setChurnCardLoading(true);
        setInsightsLoading(true);
        setChurnByThresholdLoading(true);
        setUserListLoading(true);
        
        if(moment(date, 'DD/MM/YYYY').isBefore(moment(endDate, 'DD/MM/YYYY'))) {
            endDate = date;
        }

        runGetChurnCards.mutate({
            date: date,
            modelId: modelId,
            endDate: endDate,
        });
        runChurnByThreshold.mutate({
            date: date,
            modelId: modelId,
            endDate: endDate,
        });
        runGetUserList.mutate({
            date: date,
            modelId: modelId,
            endDate: endDate,
            skip: userList.length,
        });

        if(modelChange) {
            runGetInsights.mutate({
                modelId: modelId,
            });
            runGetCustomerSuccessUsersFilter.mutate({
                modelId: modelId,
            });
        }
    }

    const selectedModel = models?.find((model: DataModelList) => model.model.id === selectedModelId);

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout2 activeKey="customer_success">
                {modelsLoading || models.length > 0 ? 
                    <div className="flex flex-col">
                        {/* Navbar Selection Filters */}
                        <div className="flex flex-row justify-end gap-2 p-4 border-border-colour border-b bg-white">
                            {
                                modelOptions && dateOptions && selectedDate && selectedModelId ?
                                    <form className="flex flex-row gap-5 items-center">
                                        <Select
                                            title="Model Name"
                                            options={modelOptions}
                                            onChange={handleModelChange}
                                            value={selectedModelId} />
                                        <Select 
                                            title="Date"
                                            options={dateOptions}
                                            onChange={handleDateChange}
                                            value={selectedDate} />
                                        to
                                        <Select
                                            title="End Date"
                                            onChange={handleEndDateChange}
                                            options={dateOptions.filter((date) => moment(date.value, 'DD/MM/YYYY') >= moment(selectedDate, 'DD/MM/YYYY'))}
                                            value={selectedEndDate} />
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
                                                                        selectedDate == selectedEndDate ? 'vs. Yesterday' : 'vs. Last Period'
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
                                                                Predicted Conversion
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
                                                                        selectedDate == selectedEndDate ? 'vs. Yesterday' : 'vs. Last Period'
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
                                                                Actual Conversion
                                                            </div>
                                                            <div className="text-2xl text-dark-text-colour">
                                                                {churnCardData?.actualChurn ? churnCardData?.actualChurn.toFixed(2) : '-'} %
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
                                                                            selectedDate == selectedEndDate ? 'vs. Yesterday' : 'vs. Last Period'
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                }
                                            </div>
                                        </div>

                                        {/* Churn By Threshold*/}
                                        {
                                            (churnByThreshold === undefined || churnByThreshold.length > 0) &&
                                                <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                {
                                                    churnByThresholdLoading || !churnByThreshold ?
                                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                        <div>
                                                            <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                <div className="text-dark-text-colour font-medium my-auto">
                                                                    Conversion Rate by Threshold
                                                                </div>                                                  
                                                            </div>
                                                            <ChurnByThresholdTable buckets={churnByThreshold} />
                                                        </div>
                                                }
                                            </div>
                                        }


                                        {/* User List*/}
                                        {
                                            <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                {
                                                    userListLoading || !userList || !totalLength || userFilterListLoading ?
                                                    <div className="flex justify-center"> 
                                                        <FadingCubesLoader height={100} width={100} /> 
                                                    </div> :
                                                    <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                        <div className="border-b border-border-colour flex justify-between">
                                                            <div className="text-dark-text-colour font-medium my-auto p-6">List of Users Likely to Convert</div>
                                                            <div className="flex flex-row my-auto p-6 gap-2">
                                                                <Select
                                                                    title="Form ID"
                                                                    options={userFilterList}
                                                                    onChange={handleCustomerSuccessFilterChange}
                                                                    value={selectedUserFilter} />
                                                                <input 
                                                                    className="border-2 border-border-colour rounded-md p-2 w-72 h-[36px] text-light-text-colour"
                                                                    placeholder="Enter Value"
                                                                    value={userFilterInputText}
                                                                    onChange={(e) => setUserFilterInputText(e.target.value)} />
                                                                <PrimaryButton2 
                                                                    onClick={() => void handleUserFilterSubmit()}
                                                                    paddingY={2}>
                                                                    <p>Submit</p>
                                                                </PrimaryButton2>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {
                                                                userList.length > 0 ?
                                                                <UsersToContactTable users={userList} />
                                                                :
                                                                <div className="flex justify-center">
                                                                    <p>No Users Found</p>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="border-t border-border-colour p-4">
                                                            {
                                                                userList.length < totalLength &&
                                                                <>
                                                                    {
                                                                        userListLoadingMore ? 
                                                                            <div className="align-center mx-auto">
                                                                                <FadingCubesLoader height={50} width={50} />
                                                                            </div>
                                                                            :
                                                                            <div className="align-center mx-auto">
                                                                                <PrimaryButton2 
                                                                                    onClick={() => void handleLoadMore()}
                                                                                    paddingY={1}>
                                                                                    <p>Load More</p>
                                                                                </PrimaryButton2>
                                                                            </div>
                                                                    }
                                                                </> 
                                                            }
                                                        </div>
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
            </BaseLayout2>
        </>
    );
};

export default CustomerSuccess;
