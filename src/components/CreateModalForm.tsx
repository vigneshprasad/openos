import { useState } from "react";
import { PrimaryButton } from "./PrimaryButton";
import HighlightedText from "./TextHighlight";

const CreateModelForm = () => {

    const [cohort, setCohort] = useState<string | null>(null);
    const [event, setEvent] = useState<string | null>(null);
    const [predictionWindow, setPredictionWindow] = useState<string | null>(null);


    return <>
        <div className="flex justify-center gap-10">
            <div className="px-4 py-5 bg-white w-[400px] h-[250px] border flex flex-col justify-between rounded-2xl">
                <div className="flex flex-col gap-2 text-left">
                    <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter a user cohort (Optional)" onChange={(e) => setCohort(e.target.value)} />
                    <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Enter the event" onChange={(e) => setEvent(e.target.value)} />
                    <input type="text" className="bg-slate-50 rounded-lg p-2 pl-3" placeholder="Prediction window" onChange={(e) => setPredictionWindow(e.target.value)} />
                </div>
            </div>
            <div className="px-4 py-5 bg-primary/10 w-[400px] h-[250px] border flex flex-col justify-center rounded-2xl text-lg">
                <span className="inline">Predicting user churn for users that
                    are from <HighlightedText>{cohort ? cohort : '--'}</HighlightedText> who
                    have performed <HighlightedText>{event ? event : '--'}</HighlightedText> action for
                    within the next <HighlightedText>{predictionWindow ? predictionWindow : '--'}</HighlightedText> days</span>
            </div>
        </div>
        <div className="flex justify-center">
            <PrimaryButton>Build the model</PrimaryButton>
        </div></>
}

export default CreateModelForm;