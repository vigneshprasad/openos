import { type SavedQuery } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons';

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
        <div>
            {
                query.feedback === 0 && (
                    <>
                        <button className="btn cursor-pointer bg-green-400" onClick={handleThumbsUp}>
                            <CheckIcon />
                        </button>
                        <button className="btn cursor-pointer bg-red-400" onClick={handleThumbsDown}>
                            <Cross1Icon />
                        </button>
                    </>
                )
            }
            {
                query.feedback === 1 && (
                    <CheckIcon className="text-green-400" />
                )
            } 
            {
                query.feedback === -1 && (
                    <Cross1Icon className="text-red-400" />
                )
            }
        </div>
    );
}
