import Avatar from "boring-avatars";
import { type UserToContact } from "~/server/api/routers/dataModelRouter";
import { UserPredictionFeedback } from "./UserPredictionFeedback";

const UsersToContactTable = ({
    users,
}: {
    users: UserToContact[];
}) => {

    return (
        <div className="overflow-x-auto w-full">
            <div className="grid grid-cols-[1fr_0.3fr_0.3fr_0.3fr] text-xs text-light-grey-text-colour p-4 uppercase font-medium border-b border-border-colour">
                <div className="my-auto">Users</div>
                <div className="my-auto text-center">% Likely to Convert</div>
                <div className="my-auto text-center">Phone Number</div>
                <div className="my-auto text-center">Feedback</div>
            </div>
            <div className="text-xs text-light-text-colour font-light">
                {
                    users.map((item, index) => (
                        <div key={index} className={`grid grid-cols-[1fr_0.3fr_0.3fr_0.3fr] px-4 py-4 ${index !== users.length - 1  ? "border-b border-border-colour" : ""}`}>
                            <div className="flex flex-row gap-4 align-middle">
                                <Avatar
                                    size={24}
                                    name={item.distinctId}
                                    variant="marble"
                                />
                                <div className="my-auto">
                                    {item.distinctId}
                                </div>
                            </div>
                            <div className="my-auto text-center">{(item.probability * 100).toFixed(2)}%</div>
                            <div className="my-auto text-center">{item.phoneNumber}</div>
                            <div className="my-auto text-center"><UserPredictionFeedback userPrediction={item}/></div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default UsersToContactTable;
