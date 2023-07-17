import { useState } from "react";
import { PrimaryButton } from "./PrimaryButton";
import HighlightedText from "./TextHighlight";
import { type ModelPredictionTabKeys } from "~/pages/create-model";


const ChurnView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | null>(null);
    const [eventCount, setEventCount] = useState<string | null>(null);
    const [interval, setInterval] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    return <div className="flex gap-10 items-center">
        <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
            <div className="flex flex-col gap-2 text-left">
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter the event count (eg. twice)" onChange={(e) => setEventCount(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a time interval" onChange={(e) => setInterval(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window" onChange={(e) => setPredictionWindow(e.target.value)} />
            </div>
        </div>
        <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
            <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText>, performing <HighlightedText>{eventName ? eventName : '--'}</HighlightedText>, at least <HighlightedText>{eventCount ? eventCount : '--'}</HighlightedText> per&nbsp;
               <HighlightedText>{interval ? interval : '--'}</HighlightedText>, will cease the event within next <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>
        </div></div>
}

const RetentionView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | null>(null);
    const [eventCount, setEventCount] = useState<string | null>(null);
    const [interval, setInterval] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    return <div className="flex gap-10 items-center">
        <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
            <div className="flex flex-col gap-2 text-left">
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter the event count (eg. twice)" onChange={(e) => setEventCount(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a time interval" onChange={(e) => setInterval(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window" onChange={(e) => setPredictionWindow(e.target.value)} />
            </div>
        </div>
        <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
            <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText> will stay active after <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>. Active being defined as users performing&nbsp;
                 <HighlightedText>{eventName ? eventName : '--'}</HighlightedText>, at least <HighlightedText>{eventCount ? eventCount : '--'}</HighlightedText> per&nbsp;
               <HighlightedText>{interval ? interval : '--'}</HighlightedText>,
        </div></div>
}

const ConversionView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventAName, setEventAName] = useState<string | null>(null);
    const [eventBName, setEventBName] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    return <div className="flex gap-10 items-center">
        <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
            <div className="flex flex-col gap-2 text-left">
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventAName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventBName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window" onChange={(e) => setPredictionWindow(e.target.value)} />
            </div>
        </div>
        <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
            <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText> performing&nbsp;
                 <HighlightedText>{eventAName ? eventAName : '--'}</HighlightedText> will do <HighlightedText>{eventBName ? eventBName : '--'}</HighlightedText>within next&nbsp;
                  <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>
        </div></div>
}

const FrequencyView = () => {
    const [modelName, setModelName] = useState<string | null>(null);
    const [attribute, setAttribute] = useState<string | null>(null);
    const [eventAName, setEventAName] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);

    return <div className="flex gap-10 items-center">
        <div className="px-4 py-5 bg-white w-[400px] border flex flex-col justify-between rounded-2xl">
            <div className="flex flex-col gap-2 text-left">
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a model name" onChange={(e) => setModelName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an attribute" onChange={(e) => setAttribute(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter an event name" onChange={(e) => setEventAName(e.target.value)} />
                <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window" onChange={(e) => setPredictionWindow(e.target.value)} />
            </div>
        </div>
        <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
            <span className="inline">Build <HighlightedText>{modelName ? modelName : '--'}</HighlightedText>
                to predict if new users from  <HighlightedText>{attribute ? attribute : '--'}</HighlightedText>, will do <HighlightedText>{eventAName ? eventAName : '--'}</HighlightedText> over next&nbsp;
                  <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days </span>
        </div></div>
}

const CreateModelForm = ({
    model
}: {
    model: ModelPredictionTabKeys
}) => {
    console.log({ model });

    return <>
        <div>
            {model === 'churn' && <ChurnView />}
            {model === 'retention' && <RetentionView />}
            {model === 'conversion' && <ConversionView />}
            {model === 'frequency' && <FrequencyView />}
        </div>
        <div className="flex justify-center">
            <PrimaryButton>Build the model</PrimaryButton>
        </div></>
}

export default CreateModelForm;