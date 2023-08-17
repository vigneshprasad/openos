import { useState } from "react";
import { PrimaryButton } from "./PrimaryButton";
import HighlightedText from "./TextHighlight";
import { type ModelPredictionTabKeys } from "~/pages/create_model";
import useAnalytics from "~/utils/analytics/AnalyticsContext";
import { api } from "~/utils/api";
import { AnalyticsEvents } from "~/utils/analytics/types";
import { CHURN_MODEL, CONVERSION_MODEL, RETENTION_MODEL } from "~/constants/modelTypes";

const ChurnView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | null>(null);
    const [eventCount, setEventCount] = useState<string | null>(null);
    const [interval, setInterval] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);


    const { track } = useAnalytics();

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);

    const createDataModel = api.dataModelRouter.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.create_data_model, {
                ...data
            });
            setSuccess(true);
            setError(false);
            setLoading(false);
        },
        onError: (e) => {
            setSuccess(false);
            setError(true);
            setErrorMessage("Error: " + e.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);


        track(AnalyticsEvents.create_data_model_form_submitted, {
            type: CHURN_MODEL,
            name: modelName,
            userFilter: attribute,
            eventA: eventName,
            eventAFrequency: eventCount,
            timeInterval: interval,
            predictionWindow: predictionWindow,
        })

        if(!modelName || !attribute || !eventName || !eventCount || !interval || !predictionWindow) {
            setLoading(false);
            setError(true);
            setErrorMessage("Error: Please fill out all fields");
            return
        }

        createDataModel.mutate({
            type: CHURN_MODEL,
            name: modelName,
            description: `Build ${modelName} to predict if new users from ${attribute} performing ${eventName}, at least ${eventCount} times per ${interval} days, will cease the event within next ${predictionWindow} days`,
            userFilter: attribute,
            predictionTimeframe: "",
            eventA: eventName,
            eventB: "",
            eventAFrequency: eventCount,
            predictionWindow: predictionWindow,
            timeInterval: interval,
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-10 items-center">
                    <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
                        <div className="flex flex-col gap-2 text-left">
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventName(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter the event count (eg. 2)" onChange={(e) => setEventCount(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a time interval in days" onChange={(e) => setInterval(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window in days" onChange={(e) => setPredictionWindow(e.target.value)} />
                        </div>
                    </div>
                    <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
                        <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                            to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText>, performing <HighlightedText>{eventName ? eventName : '--'}</HighlightedText>, at least <HighlightedText>{eventCount ? eventCount : '--'}</HighlightedText> times per&nbsp;
                        <HighlightedText>{interval ? interval : '--'} </HighlightedText> days, will cease the event within next <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>
                    </div>
                </div>
                <div className="flex justify-center mt-8">
                    {loading ?
                        <PrimaryButton type="submit" disabled className="mt-8">Loading...</PrimaryButton>
                        :
                        <PrimaryButton type="submit" className="mt-8">Build the Model</PrimaryButton>
                    }
                </div>
                <div className="flex justify-center mt-8">
                    {success && <p className="text-green-500">Success</p>}
                    {error && <p className="text-red-500">{errorMessage}</p>}
                </div>
            </form>
        </div>
    );
}

const RetentionView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | null>(null);
    const [eventCount, setEventCount] = useState<string | null>(null);
    const [interval, setInterval] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    const { track } = useAnalytics();

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);

    const createDataModel = api.dataModelRouter.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.create_data_model, {
                ...data
            });
            setSuccess(true);
            setError(false);
            setLoading(false);
        },
        onError: (e) => {
            setSuccess(false);
            setError(true);
            setErrorMessage("Error: " + e.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);


        track(AnalyticsEvents.create_data_model_form_submitted, {
            type: RETENTION_MODEL,
            name: modelName,
            userFilter: attribute,
            eventA: eventName,
            eventAFrequency: eventCount,
            timeInterval: interval,
            predictionWindow: predictionWindow,
        })

        if(!modelName || !attribute || !eventName || !eventCount || !interval || !predictionWindow) {
            setLoading(false);
            setError(true);
            setErrorMessage("Error: Please fill out all fields");
            return
        }

        createDataModel.mutate({
            type: RETENTION_MODEL,
            name: modelName,
            description: `Build ${modelName} to predict if new users from ${attribute} will stay active after ${predictionWindow} days. Active being defined as users performing ${eventName}, at least ${eventCount} times per ${interval} days.`,
            userFilter: attribute,
            predictionTimeframe: "",
            eventA: eventName,
            eventB: "",
            eventAFrequency: eventCount,
            predictionWindow: predictionWindow,
            timeInterval: interval,
        });
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-10 items-center">
                    <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
                        <div className="flex flex-col gap-2 text-left">
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window in days" onChange={(e) => setPredictionWindow(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventName(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter the event count (eg. twice)" onChange={(e) => setEventCount(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a time interval in days" onChange={(e) => setInterval(e.target.value)} />
                        </div>
                    </div>
                    <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
                        <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                            to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText> will stay active after
                            <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days. 
                            Active being defined as users performing <HighlightedText>{eventName ? eventName : '--'}</HighlightedText>, 
                            at least <HighlightedText>{eventCount ? eventCount : '--'}</HighlightedText> times per <HighlightedText>{interval ? interval : '--'}</HighlightedText> days.</span>
                    </div>
                </div>
                <div className="flex justify-center mt-8">
                    {loading ?
                        <PrimaryButton type="submit" disabled className="mt-8">Loading...</PrimaryButton>
                        :
                        <PrimaryButton type="submit" className="mt-8">Build the Model</PrimaryButton>
                    }
                </div>
                <div className="flex justify-center mt-8">
                    {success && <p className="text-green-500">Success</p>}
                    {error && <p className="text-red-500">{errorMessage}</p>}
                </div>
            </form>
        </div>
    );
}

const ConversionView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventAName, setEventAName] = useState<string | null>(null);
    const [eventBName, setEventBName] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    const { track } = useAnalytics();

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);

    const createDataModel = api.dataModelRouter.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.create_data_model, {
                ...data
            });
            setSuccess(true);
            setError(false);
            setLoading(false);
        },
        onError: (e) => {
            setSuccess(false);
            setError(true);
            setErrorMessage("Error: " + e.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);


        track(AnalyticsEvents.create_data_model_form_submitted, {
            type: CONVERSION_MODEL,
            name: modelName,
            userFilter: attribute,
            eventA: eventAName,
            eventB: eventBName,
            predictionWindow: predictionWindow,
        })

        if(!modelName || !attribute || !eventAName || !eventBName || !predictionWindow) {
            setLoading(false);
            setError(true);
            setErrorMessage("Error: Please fill out all fields");
            return
        }

        createDataModel.mutate({
            type: CONVERSION_MODEL,
            name: modelName,
            description: `Build ${modelName} to predict if new users from ${attribute} performing ${eventAName} will do ${eventBName} within next ${predictionWindow} days.`,
            userFilter: attribute,
            predictionTimeframe: "",
            eventA: eventAName,
            eventB: eventBName,
            eventAFrequency: "",
            predictionWindow: predictionWindow,
            timeInterval: "",
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-10 items-center">
                    <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
                        <div className="flex flex-col gap-2 text-left">
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventAName(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventBName(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window in days" onChange={(e) => setPredictionWindow(e.target.value)} />
                        </div>
                    </div>
                    <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
                        <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                            to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText> performing&nbsp;
                                <HighlightedText>{eventAName ? eventAName : '--'}</HighlightedText> will do <HighlightedText>{eventBName ? eventBName : '--'}</HighlightedText>within next&nbsp;
                                <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days.</span>
                    </div>
                </div>
                <div className="flex justify-center mt-8">
                    {loading ?
                        <PrimaryButton type="submit" disabled className="mt-8">Loading...</PrimaryButton>
                        :
                        <PrimaryButton type="submit" className="mt-8">Build the Model</PrimaryButton>
                    }
                </div>
                <div className="flex justify-center mt-8">
                    {success && <p className="text-green-500">Success</p>}
                    {error && <p className="text-red-500">{errorMessage}</p>}
                </div>
            </form>
        </div>
    )
}

const FrequencyView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventAName, setEventAName] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    const { track } = useAnalytics();

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);

    const createDataModel = api.dataModelRouter.create.useMutation({
        onSuccess: (data) => {
            track(AnalyticsEvents.create_data_model, {
                ...data
            });
            setSuccess(true);
            setError(false);
            setLoading(false);
        },
        onError: (e) => {
            setSuccess(false);
            setError(true);
            setErrorMessage("Error: " + e.message);
            setLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);


        track(AnalyticsEvents.create_data_model_form_submitted, {
            type: CONVERSION_MODEL,
            name: modelName,
            userFilter: attribute,
            eventA: eventAName,
            predictionWindow: predictionWindow,
        })

        if(!modelName || !attribute || !eventAName || !predictionWindow) {
            setLoading(false);
            setError(true);
            setErrorMessage("Error: Please fill out all fields");
            return
        }

        createDataModel.mutate({
            type: CONVERSION_MODEL,
            name: modelName,
            description: `Build ${modelName} to predict how many times new users from ${attribute} will do ${eventAName} over next ${predictionWindow} days.`,
            userFilter: attribute,
            predictionTimeframe: "",
            eventA: eventAName,
            eventB: "",
            eventAFrequency: "",
            predictionWindow: predictionWindow,
            timeInterval: "",
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-10 items-center">
                    <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
                        <div className="flex flex-col gap-2 text-left">
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                            <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventAName(e.target.value)} />
                            <input type="number" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window in days" onChange={(e) => setPredictionWindow(e.target.value)} />
                        </div>
                    </div>
                    <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
                        <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                            to predict how many times new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText>, will do <HighlightedText>{eventAName ? eventAName : '--'}</HighlightedText> over next&nbsp;
                            <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>
                    </div>
                </div>
                <div className="flex justify-center mt-8">
                    {loading ?
                        <PrimaryButton type="submit" disabled className="mt-8">Loading...</PrimaryButton>
                        :
                        <PrimaryButton type="submit" className="mt-8">Build the Model</PrimaryButton>
                    }
                </div>
                <div className="flex justify-center mt-8">
                    {success && <p className="text-green-500">Success</p>}
                    {error && <p className="text-red-500">{errorMessage}</p>}
                </div>
            </form>
        </div>
    )
}

const CreateModelForm = ({
    model
}: {
    model: ModelPredictionTabKeys
}) => {

    return <>
        <div>
            {model === 'churn' && <ChurnView />}
            {model === 'retention' && <RetentionView />}
            {model === 'conversion' && <ConversionView />}
            {model === 'frequency' && <FrequencyView />}
        </div>
    </>
}

export default CreateModelForm;