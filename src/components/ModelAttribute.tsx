import React, { useState, type SetStateAction } from "react";
import { MODEL_ATTRIBUTE } from "~/constants/commandConstants";
import { type PredictCommandInput } from "~/types/types";

interface IProps {
    setInput: (value: SetStateAction<PredictCommandInput>) => void
}

export const ModelAttribute: React.FC<IProps> = ({ setInput }) => {
    const [event, setEvent] = useState<string>("");
    const [period, setPeriod] = useState<string>("");

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setEvent(value);
        setInput({
            command: `Predict churn for users that signed up within the last ${period} days & with ${value} attribute`,
            type: MODEL_ATTRIBUTE,
            event: value,
            period: Number(period),
        });
    }

    const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setPeriod(value);
        setInput({
            command: `Predict churn for users that signed up within the last ${period} days & with attribute = ${value}`,
            type: MODEL_ATTRIBUTE,
            event: event,
            period: Number(value),
        });
    }

    return (
        <div className="w-full px-0 py-[9px] pb-[18px] text-sm font-normal text-[#616161]">
            <span className="px-1 text-[#FFF]"> 
                Predict churn for users that signed up within the last 
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
                days and with attribute = 
            </span>
            <span className="px-1">
                <select name="event" id="event" 
                className="py-2 px-1 bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col rounded-md" onChange={handleEventChange}>
                    <option disabled selected value=""> -- </option>
                    <option value="ceo">CEO</option>
                    <option value="nagpur">Nagpur</option>
                    <option value="iPhone">iPhone</option>
                    <option value="upi">UPI</option>
                </select>
            </span>                        
        </div>
    )
};