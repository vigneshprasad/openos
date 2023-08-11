import { api } from "~/utils/api";
import Image from "next/image";
import { useState } from "react";
import { type UserToContact } from "~/server/api/routers/dataModelRouter";

interface Props {
    userPrediction: UserToContact;
}

export const UserPredictionFeedback: React.FC<Props> = ({userPrediction}) => {

    const [feedback, setFeedback] = useState<number>(userPrediction.feedback ? userPrediction.feedback : 0);
    const [updatedList, setUpdatedList] = useState<string[]>([]);
    
    const userPredictionUp = api.userPredictionRouter.thumbsUp.useMutation({
        onSuccess: (userPrediction) => {
            setUpdatedList([...updatedList, userPrediction.id]);
            setFeedback(1);
        },
    });

    const userPredictionDown = api.userPredictionRouter.thumbsDown.useMutation({
        onSuccess: (userPrediction) => {
            setUpdatedList([...updatedList, userPrediction.id]);
            setFeedback(-1);
        },
    });

    const handleThumbsUp = async () => {
        await userPredictionUp.mutateAsync({
            id: userPrediction.id,
        });
    }

    const handleThumbsDown = async () => {
        await userPredictionDown.mutateAsync({
            id: userPrediction.id,
        });
    }

    return (
        <div className="flex gap-1 items-center justify-center">
            {
                (userPrediction.feedback === 0 || userPrediction.feedback === null) && (!updatedList.includes(userPrediction.id)) && (
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
                (userPrediction.feedback === 1 || (updatedList.includes(userPrediction.id) && feedback === 1)) && (
                    <div className="p-[2px] bg-[#90EE90] rounded-[4px]">
                        <Image src="/like.png" alt="Like" width={15} height={15} />
                    </div>
                )
            } 
            {
                (userPrediction.feedback === -1 || (updatedList.includes(userPrediction.id) && feedback === -1)) && (
                    <div className="p-[2px] bg-[#ffcccb] rounded-[4px]">
                        <Image src="/dislike.png" alt="Like" width={15} height={15}
                            style={{transform: "rotateY(180deg)"}} />
                    </div>
                )
            }
        </div>
    );
}
