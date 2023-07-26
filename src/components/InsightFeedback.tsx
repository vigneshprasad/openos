import { type Insights } from "@prisma/client";
import { api } from "~/utils/api";
import Image from "next/image";
import { useState } from "react";

interface Props {
    insight: Insights;
}

export const InsightFeedback: React.FC<Props> = ({insight}) => {

    const [feedback, setFeedback] = useState<number>(insight.feedback ? insight.feedback : 0);
    const [updatedList, setUpdatedList] = useState<string[]>([]);
    
    const insightThumbsUp = api.insightsRouter.thumbsUp.useMutation({
        onSuccess: () => {
            setUpdatedList([...updatedList, insight.id]);
            setFeedback(1);
        },
    });

    const insightThumbsDown = api.insightsRouter.thumbsDown.useMutation({
        onSuccess: () => {
            setUpdatedList([...updatedList, insight.id]);
            setFeedback(-1);
        },
    });

    const handleThumbsUp = async () => {
        await insightThumbsUp.mutateAsync({
            id: insight.id,
        });
    }

    const handleThumbsDown = async () => {
        await insightThumbsDown.mutateAsync({
            id: insight.id,
        });
    }

    return (
        <div className="flex gap-1 items-center justify-center">
            {
                (insight.feedback === 0 || insight.feedback === null) && (!updatedList.includes(insight.id)) && (
                    <>
                        <button className="btn cursor-pointer" onClick={handleThumbsUp}>
                            <Image src="/like.png" alt="Like" width={15} height={15} />
                        </button>
                        <button className="btn cursor-pointer" onClick={handleThumbsDown}>
                            <Image src="/dislike.png" alt="Like" width={15} height={15} 
                                style={{transform: "rotateY(180deg)"}} />
                        </button>
                    </>
                )
            }
            {
                (insight.feedback === 1 || (updatedList.includes(insight.id) && feedback === 1)) && (
                    <div className="p-[2px] bg-[#90EE90] rounded-[4px]">
                        <Image src="/like.png" alt="Like" width={15} height={15} />
                    </div>
                )
            } 
            {
                (insight.feedback === -1 || (updatedList.includes(insight.id) && feedback === -1)) && (
                    <div className="p-[2px] bg-[#ffcccb] rounded-[4px]">
                        <Image src="/dislike.png" alt="Like" width={15} height={15}
                            style={{transform: "rotateY(180deg)"}} />
                    </div>
                )
            }
        </div>
    );
}
