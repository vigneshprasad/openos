import React, { useState, type SetStateAction } from "react";
import { type PredictCommandInput } from "~/types/types";

interface IProps {
    setInput: (value: SetStateAction<PredictCommandInput>) => void
}

export const ModelCorrelation: React.FC<IProps> = ({ setInput }) => {
    const [event, setEvent] = useState<string>("");
    const [event2, setEvent2] = useState<string>("");
    const [period, setPeriod] = useState<string>("");

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setEvent(value);
        setInput({
            command: `Model Correlation for ${value} and ${event2} over period of ${period} days`,
            type: "predict-likelihood",
            event: value,
            event2: event2,
            period: Number(period),
        });
    }

    const handleEvent2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setEvent2(value);
        setInput({
            command: `Model Correlation for ${event} and ${value} over period of ${period} days`,
            type: "predict-likelihood",
            event: event,
            event2: value,
            period: Number(period),
        });
    }

    const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setPeriod(value);
        setInput({
            command: `Model Correlation for ${event} and ${event2} over period of ${value} days`,
            type: "predict-likelihood",
            event: event,
            event2: event2,
            period: Number(value),
        });
    }
    

    return (
        <div className="w-full px-0 py-[9px] pb-[18px] text-sm font-normal text-[#616161]">
            <span className="px-1 text-[#FFF]"> 
                Model correlation
            </span>
            <span className="px-1"> 
                for
            </span>
            <span className="px-1">
                <select name="event" id="event" 
                className="py-2 px-1 bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col rounded-md" onChange={handleEventChange}>
                    <option disabled selected value=""> -- </option>
                    <option value="watch stream">Watch stream</option>
                    <option value="rsvp">RSVP</option>
                    <option value="make a purchase">Make a purchase</option>
                    <option value="send a chat">Send a chat</option>
                </select>
            </span>
            <span className="px-1">
                and
            </span>
            <span className="px-1">
                <select name="event2" id="event2" 
                className="py-2 px-1 bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col rounded-md" onChange={handleEvent2Change}>
                    <option disabled selected value=""> -- </option>
                    <option value="watch stream">Watch stream</option>
                    <option value="rsvp">RSVP</option>
                    <option value="make a purchase">Make a purchase</option>
                    <option value="send a chat">Send a chat</option>
                </select>
            </span>
            <span className="px-1">
                over period of
            </span>
            <span className="px-1">
                <select name="period" id="period" 
                className="py-2 px-1 bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col rounded-md" onChange={handleDaysChange}>
                    <option disabled selected value=""> -- </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="7">7</option>
                    <option value="14">14</option>
                    <option value="30">30</option>
                </select>
            </span>
            <span className="px-1">
                days.
            </span>
        </div>
    )
};