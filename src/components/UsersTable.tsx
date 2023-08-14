import { type LookAlikeUsers } from "~/server/api/routers/dataModelRouter";
import Avatar from "boring-avatars";

const UsersTable = ({
    data,
    isConversion
}: {
    data: LookAlikeUsers[];
    isConversion?: boolean
}) => {
    
    return (
        <div className="overflow-x-auto w-full">
            <div className="text-xs text-light-text-colour font-light">
                {
                    data.map((item, index) => (
                        <div key={index} className="flex flex-row p-4 gap-4">
                            <div className="my-auto">
                                <Avatar
                                    size={24}
                                    name={item.distinctId}
                                    variant="marble"
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-sm text-dark-text-colour">
                                    {item.distinctId}
                                </div>
                                <div className="text-xs text-dark-grey-text-colour">
                                    {(item.probability * 100).toFixed(2)} % likely to {isConversion ? 'convert' : 'churn'}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default UsersTable;
