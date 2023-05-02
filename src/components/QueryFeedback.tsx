import { type SavedQuery } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
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
        <div className="flex gap-4 items-center justify-center">
            {
                query.feedback === 0 && (
                    <>
                        <button className="btn cursor-pointer" onClick={handleThumbsUp}>
                            <Image src="/like.png" alt="Like" width={14} height={14} />
                        </button>
                        <button className="btn cursor-pointer" onClick={handleThumbsDown}>
                            <Image src="/dislike.png" alt="Like" width={14} height={14} />
                        </button>
                    </>
                )
            }
            {
                query.feedback === 1 && (
                    <Image src="/like.png" alt="Like" width={14} height={14} />
                )
            } 
            {
                query.feedback === -1 && (
                    <Image src="/dislike.png" alt="Like" width={14} height={14} />
                )
            }
        </div>
    );
}
