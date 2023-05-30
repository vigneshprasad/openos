import React, { useState, type SetStateAction } from "react";
import { type PredictCommandInput } from "~/types/types";

interface IProps {
    setInput: (value: SetStateAction<PredictCommandInput>) => void
}

export const PredictChurn: React.FC<IProps> = ({ setInput }) => {
    const [event, setEvent] = useState<string>("");
    const [repeat, setRepeat] = useState<string>("");
    const [repeatName, setRepeatName] = useState<string>("");
    const [period, setPeriod] = useState<string>("");

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setEvent(value);
        setInput({
            command: `Predict churn for a user that does ${value} atleast ${repeatName} in ${period} days`,
            type: "predict-churn",
            event: value,
            period: Number(period),
            repeat: Number(repeat),
        });
    }

    const handleRepeatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        const [number, text] = value.split(',');
        setRepeat(number ? number : "");
        setRepeatName(text ? text : "");
        setInput({
            command: `Predict LTV For users that perform ${event} atleast ${text ? text : ""} after ${period} days`,
            type: "predict-ltv",
            event: event,
            period: Number(period),
            repeat: Number(number ? number : ""),
        });
    }

    const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setPeriod(value);
        setInput({
            command: `Predict churn for a user that does ${event} atleast ${repeatName} in ${value} days`,
            type: "predict-churn",
            event: event,
            period: Number(value),
            repeat: Number(repeat),
        });
    }
    

    return (
        <div className="w-full px-0 py-[9px] pb-[18px] text-sm font-normal text-[#616161]">
            <span className="px-1 text-[#FFF]"> 
                Predict churn
            </span>
            <span className="px-1"> 
                for a user that does  
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
                atleast
            </span>
            <span className="px-1">
                <select name="repeat" id="repeat" 
                className="py-2 px-1 bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col rounded-md" onChange={handleRepeatChange}>
                    <option disabled selected value=""> -- </option>
                    <option value="1,once">Once</option>
                    <option value="2,twice">Twice</option>
                    <option value="3,thrice">Thrice</option>
                </select>
            </span>
            <span className="px-1">
                in 
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