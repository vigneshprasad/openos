import { type SavedQuery } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import Image from "next/image";

interface Props {
    queryProp: SavedQuery;
}

export const QueryFeedback: React.FC<Props> = ({queryProp}) => {

    const [query, setQuery] = useState<SavedQuery>(queryProp);
    
    const savedQueryThumbsUp = api.savedQuery.thumbsUp.useMutation({
        onSuccess: (res: SavedQuery) => {
            setQuery(res);
        },
    });

    const savedQueryThumbsDown = api.savedQuery.thumbsDown.useMutation({
        onSuccess: (res: SavedQuery) => {
            setQuery(res);
        },
    });

    const handleThumbsUp = async () => {
        await savedQueryThumbsUp.mutateAsync({
            id: query.id,
        });
    }

    const handleThumbsDown = async () => {
        await savedQueryThumbsDown.mutateAsync({
            id: query.id,
        });
    }

    return (
        <div className="flex gap-1 items-center justify-center">
            {
                query.feedback === 0 && (
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
                query.feedback === 1 && (
                    <div className="p-[2px] bg-[#303030] rounded-[4px]">
                        <Image src="/like.png" alt="Like" width={15} height={15} />
                    </div>
                )
            } 
            {
                query.feedback === -1 && (
                    <div className="p-[2px] bg-[#303030] rounded-[4px]">
                        <Image src="/dislike.png" alt="Like" width={15} height={15}
                            style={{transform: "rotateY(180deg)"}} />
                    </div>
                )
            }
        </div>
    );
}
