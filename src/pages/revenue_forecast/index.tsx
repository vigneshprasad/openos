import router from "next/router";
import Image from "next/image";
import Head from "next/head";

import { type NextPage } from "next";
import { useEffect, useState } from "react";

import { type GAInsights, type GAForecastModel, type GAFeatureImportance, GAForecastModelType } from "@prisma/client";
import { BaseLayout2 } from "~/components/BaseLayout2";
import { FadingCubesLoader } from "~/components/FadingCubesLoader";
import Select from "~/components/Select";
import { type GraphData } from "~/server/api/routers/dataModelRouter";
import { type SelectOption } from "~/types/types";
import { api } from "~/utils/api";
import AreaGraph from "~/components/AreaGraph";
import { PrimaryButton2 } from "~/components/PrimaryButton2";
import FeaturesImportanceTable from "~/components/FeatureImportanceTable";
import { type AggregatedForecastByDimension } from "~/server/api/routers/gaForecastRouter";

const RevenueForecast: NextPage = () => {

    const [forecastModel, setForecastModel] = useState<GAForecastModel>();
    const [forecastModelLoading, setForecastModelLoading] = useState<boolean>(true);
    const [dimensions, setDimensions] = useState<SelectOption[]>([]);
    const [metrics, setMetrics] = useState<SelectOption[]>([]);
    const [timePeriod, setTimePeriod] = useState<SelectOption[]>([]);
    const [dateOptions, setDateOptions] = useState<SelectOption[]>([]);

    // SELECTED FIELDS
    const [selectedMetric, setSelectedMetric] = useState<string>();
    const [selectedDimension, setSelectedDimension] = useState<string>();
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>();
    const [selectedStartDate, setSelectedStartDate] = useState<string>();

    // GRAPH DATA STATES
    const [graphData, setGraphData] = useState<GraphData>();
    const [graphDataLoading, setGraphDataLoading] = useState<boolean>(true);

    // FEATURE IMPORTANCE STATES 
    const [features, setFeatures] = useState<GAFeatureImportance[]>();
    const [featuresLoading, setFeaturesLoading] = useState<boolean>(true);

    // AGGREGATE DIMENSION FORECAST
    const [aggregateDimensionForecast, setAggregateDimensionForecast] = useState<AggregatedForecastByDimension>();
    const [aggregateDimensionForecastLoading, setAggregateDimensionForecastLoading] = useState<boolean>(true); 


    // INSIGHT AND ACTIONABLE INSIGHTS
    const [insights, setInsights] = useState<GAInsights[]>();
    const [insightsLoading, setInsightsLoading] = useState<boolean>(true);
    const [selectedInsight, setSelectedInsight] = useState<GAInsights>();

    const loading = false // graphDataLoading || insightsLoading || featuresLoading || aggregateDimensionForecastLoading;

    // SETTING FIRST MODEL AS DEFAULT
    const forecastModelMutation = api.gaForecastRouter.getForecastModels.useMutation({
        onSuccess: (data) => {
            setForecastModelLoading(false);
            if(!data) return;
            setForecastModel(data.model);
            setDimensions(data.dimensions.map((dimension) => {
                return {
                    label: dimension.name,
                    value: dimension.id,
                }
            }));
            setMetrics(data.metrics.map((metric) => {
                return {
                    label: metric.name,
                    value: metric.id,
                }
            }));
            setTimePeriod(data.timePeriod.map((timePeriod) => {
                return {
                    label: timePeriod.name,
                    value: timePeriod.id,
                }
            }));
            const dateArray: Date[] = [];
            let currentDate = new Date(data.model.startDate);
            const endDate = new Date();
            while (currentDate < endDate) {
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
            const defaultDate = dateOptions[0]
            const defaultDateValue = defaultDate?.value;
            if (defaultDateValue) {
                if(!data.dimensions[0]?.name || !data.metrics[0]?.name || !data.timePeriod[0]?.name) return;
                setSelectedStartDate(defaultDateValue);
                setSelectedDimension(data.dimensions[0]?.id);
                setSelectedMetric(data.metrics[0]?.id);
                setSelectedTimePeriod(data.timePeriod[0]?.id);
                reRunAllQueries(data.metrics[0]?.name, data.dimensions[0]?.name, data.timePeriod[0]?.name, defaultDateValue, true, data.model.id);
                setAggregateDimensionForecastLoading(true);
                runGetAggregatedForecastByDimension.mutate({
                    startDate: defaultDateValue,
                    timePeriod: data.timePeriod[0]?.name,
                    metric: 'grossPurchaseRevenue',
                    modelId: data.model.id
                });
            }
        },
        onError: () => {
            setForecastModelLoading(false);
        }
    });

    // LOADING MODELS ON FIRST LOAD
    useEffect(() => {
        if (forecastModel) return;
        forecastModelMutation.mutate({
            type: GAForecastModelType.REVENUE_FORECAST
        });
    }, []);


    // DATA MUTATIONS
    const runGetGraphData = api.gaForecastRouter.getGraphData.useMutation({
        onSuccess: (data:GraphData) => {
            setGraphData(data);
            setGraphDataLoading(false);
        }
    })

    const runGetFeatures = api.gaForecastRouter.getGaFeatures.useMutation({
        onSuccess: (data:GAFeatureImportance[]) => {
            setFeatures(data);
            setFeaturesLoading(false);
        }
    })

    const runGetInsights = api.gaForecastRouter.getGaInsights.useMutation({
        onSuccess: (data:GAInsights[]) => {
            setInsights(data);
            setInsightsLoading(false);
            setSelectedInsight(data[0]);
        }
    })

    const runGetAggregatedForecastByDimension = api.gaForecastRouter.getAggregatedForecastByDimension.useMutation({
        onSuccess: (data) => {
            setAggregateDimensionForecast(data);
            setAggregateDimensionForecastLoading(false);
        }
    })



    // SELECTION HANDLERS
    const handleDateChange = (value: string) => {
        if(!value) return;
        setSelectedStartDate(value);
        if(!selectedMetric || !selectedDimension || !selectedTimePeriod) return;
        const metricName = metrics.find((metricItem) => metricItem.value === selectedMetric)?.label;
        const dimensionName = dimensions.find((dimensionItem) => dimensionItem.value === selectedDimension)?.label;
        const timePeriodName = timePeriod.find((timePeriodItem) => timePeriodItem.value === selectedTimePeriod)?.label;
        if(!metricName || !dimensionName || !timePeriodName || !forecastModel) return;
        reRunAllQueries(metricName, dimensionName, timePeriodName, value);
        setAggregateDimensionForecastLoading(true);
        runGetAggregatedForecastByDimension.mutate({
            startDate: value,
            timePeriod: timePeriodName,
            metric: 'grossPurchaseRevenue',
            modelId: forecastModel.id,
        });
    }

    const handleTimePeriodChange = (value: string) => {
        if(!value) return;
        setSelectedTimePeriod(value);
        if(!selectedMetric || !selectedDimension || !selectedStartDate) return;
        const metricName = metrics.find((metricItem) => metricItem.value === selectedMetric)?.label;
        const dimensionName = dimensions.find((dimensionItem) => dimensionItem.value === selectedDimension)?.label;
        const timePeriodName = timePeriod.find((timePeriodItem) => timePeriodItem.value === value)?.label;
        if(!metricName || !dimensionName || !timePeriodName || !forecastModel) return;
        reRunAllQueries(metricName, dimensionName, timePeriodName, selectedStartDate);
        setAggregateDimensionForecastLoading(true);
        runGetAggregatedForecastByDimension.mutate({
            startDate: selectedStartDate,
            timePeriod: timePeriodName,
            metric: 'grossPurchaseRevenue',
            modelId: forecastModel.id
        });  
    }

    const handleDimensionChange = (value: string) => {
        if(!value) return;
        setSelectedDimension(value);
        if(!selectedMetric || !selectedTimePeriod || !selectedStartDate) return;
        const metricName = metrics.find((metricItem) => metricItem.value === selectedMetric)?.label;
        const dimensionName = dimensions.find((dimensionItem) => dimensionItem.value === value)?.label;
        const timePeriodName = timePeriod.find((timePeriodItem) => timePeriodItem.value === selectedTimePeriod)?.label;
        if(!metricName || !dimensionName || !timePeriodName) return;
        reRunAllQueries(metricName, dimensionName, timePeriodName, selectedStartDate);
    }

    const handleMetricChange = (value: string) => {
        if(!value) return;
        setSelectedMetric(value);
        if(!selectedDimension || !selectedTimePeriod || !selectedStartDate) return;
        const metricName = metrics.find((metricItem) => metricItem.value === value)?.label;
        const dimensionName = dimensions.find((dimensionItem) => dimensionItem.value === selectedDimension)?.label;
        const timePeriodName = timePeriod.find((timePeriodItem) => timePeriodItem.value === selectedTimePeriod)?.label;
        if(!metricName || !dimensionName || !timePeriodName) return;
        reRunAllQueries(metricName, dimensionName, timePeriodName, selectedStartDate);
    }

    // RE-RUN ALL QUERIES
    const reRunAllQueries = (metricName: string, dimensionName: string, timePeriodName: string, startDate: string, modelChange?: boolean, modelId?: string) => {
        setGraphDataLoading(true);
        
        runGetGraphData.mutate({
            metric: metricName,
            dimension: dimensionName,
            timePeriod: timePeriodName,
            startDate: startDate,
        });

        if(modelChange && modelId) {
            setFeaturesLoading(true);
            setInsightsLoading(true);
            runGetFeatures.mutate({
                modelId: modelId,
            });
            runGetInsights.mutate({
                modelId: modelId,
            });
        }
    }

    return (
        <>
            <Head>
                <title>Open OS</title>
                <meta name="description" content="Tools to to make your life easier" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BaseLayout2 activeKey="revenue_forecast">
                {forecastModelLoading || forecastModel !== undefined ?
                    <div className="flex flex-col">
                        {/* Navbar Selection Filters */}
                        <div className="flex flex-row justify-end gap-2 p-4 border-border-colour border-b bg-white">
                            {
                                dateOptions && selectedStartDate ?
                                    <form className="flex flex-row gap-5 items-center align-middle">
                                        <div className="my-auto text-sm">Start Date</div>
                                        <Select 
                                            title="Start Date"
                                            disabled={loading}
                                            options={dateOptions}
                                            onChange={handleDateChange}
                                            value={selectedStartDate} />
                                        <div className="my-auto text-sm">Forecasted Time Period</div>
                                        <Select
                                            title="Time Period"
                                            disabled={loading}
                                            options={timePeriod}
                                            onChange={(value) => handleTimePeriodChange(value)}
                                            value={selectedTimePeriod} />     

                                    </form>
                                    :
                                    <p> Loading</p>
                            }
                        </div>

                        <div className="bg-page-background-colour flex justify-center">
                            <div className="w-[100ch]">
                                {/* Model Title Card */}
                                <div className="my-8 p-6 border-2 border-blue-card-border-colour bg-blue-card-background-colour rounded-lg">
                                    {forecastModel ?
                                        <div className="grid grid-cols-[3fr_1fr]">
                                            <div>
                                                <p className="mb-1"> {forecastModel.name}</p>
                                                <p className="text-light-text-colour text-sm">{forecastModel.description} </p>
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
                                { forecastModel && 
                                    <div>
                                        {/* Primary Graph */}
                                        {
                                            (graphData === undefined || graphData.data.length > 0) && 
                                            <div className="bg-white drop-shadow-md mb-8 rounded-lg">
                                                {
                                                    !forecastModel || !dimensions || !metrics || !timePeriod ?
                                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                        <div>
                                                            <div className="border-b border-border-colour flex flex-row p-6 justify-between align-middle">
                                                                <div className="text-dark-text-colour font-medium my-auto">Revenue Forecast</div>
                                                                <div className="flex flex-row gap-2">
                                                                    <Select
                                                                        title="Dimension"
                                                                        disabled={loading}
                                                                        options={dimensions}
                                                                        onChange={(value) => handleDimensionChange(value)}
                                                                        value={selectedDimension} /> 
                                                                    <Select
                                                                        title="Metric"
                                                                        disabled={loading}
                                                                        options={metrics}
                                                                        onChange={(value) => handleMetricChange(value)}
                                                                        value={selectedMetric} />                                                   
                                                                </div>
                                                            </div>
                                                            <div className="p-4">
                                                                {
                                                                    !graphData || graphDataLoading ?
                                                                    <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                                    <AreaGraph 
                                                                        graphData={graphData} 
                                                                        categoriesFormat={"MMM Do YYYY"} 
                                                                        yAxisNotPercentage={true} />
                                                                }
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                        }

                                        {/* Aggregate Forecast */}
                                        {
                                            (aggregateDimensionForecast === undefined || aggregateDimensionForecast.cohort1.length > 0) &&
                                            <div className="grid gap-4 mb-8 bg-white drop-shadow-md rounded-lg">
                                                {
                                                    aggregateDimensionForecastLoading || !aggregateDimensionForecast ?
                                                        <div className="flex justify-center"> <FadingCubesLoader /> </div> :
                                                        <div className="grid grid-rows-[auto_1fr_auto] h-full">
                                                            <div className="border-b border-border-colour">
                                                                <div className="text-dark-text-colour font-medium my-auto p-6">Top 5 Campaigns</div>
                                                            </div>
                                                            <div>
                                                                <div className="overflow-x-auto w-full">
                                                                    <div className="grid grid-cols-[1fr_0.5fr_0.5fr] text-xs bg-table-heading-background-colour text-light-grey-text-colour p-4 uppercase font-medium">
                                                                        <div>Campaign Name</div>
                                                                        <div>Gross Revenue</div>
                                                                        <div>Predicted Revenue Next 
                                                                            {timePeriod.find((timePeriodItem) => timePeriodItem.value === selectedTimePeriod)?.label}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-light-text-colour font-light">
                                                                        {
                                                                            aggregateDimensionForecast.cohort1.slice(0, 5).map((item, index) => (
                                                                                <div key={index} className={`grid grid-cols-[1fr_0.5fr_0.5fr] mx-4 py-4 ${index !== 4  ? "border-b border-border-colour" : ""}`}>
                                                                                    <div>{item.name}</div>
                                                                                    <div>₹ {item.aggregate}</div>
                                                                                    <div>₹ {item.predicted.toFixed(0)}</div>
                                                                                </div>
                                                                            ))
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
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
                                                            <div className="p-4 max-h-72 overflow-y-auto">
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

export default RevenueForecast;
