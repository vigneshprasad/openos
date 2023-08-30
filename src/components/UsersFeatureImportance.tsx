import * as Dialog from '@radix-ui/react-dialog'
import Avatar from "boring-avatars";
import { useState } from "react";
import { type UserForBucket, type UsersByBucket } from "~/server/api/routers/dataModelRouter";

const UsersFeatureImportance = ({
    data,
}: {
    data: UsersByBucket[];
}) => {

    const [selectedUser, setSelectedUser] = useState<UserForBucket | undefined>(undefined)
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const gradients:string[] = [
        "bg-gradient-to-r from-red-400 to-orange-300",
        "bg-gradient-to-r from-blue-400 to-violet-300",
        "bg-gradient-to-r from-green-400 to-emerald-300"
    ]

    const handleClick = (index: number, index2:number) => {
        setSelectedUser(undefined)
        const bucket = data[index]
        const user = bucket?.users[index2]
        if(!user) return
        setSelectedUser(user)
        setSelectedIndex(index)
        setIsOpen(true)
    }

    return (
        <div className="overflow-x-auto w-full">
            <div className={`grid grid-cols-3`}>
                {
                    data.map((item, index) => (
                        <div key={index}>
                            <div className="border-b border-border-color p-2 flex flex-row gap-2 align-middle justify-center text-sm font-medium mb-4">
                                <div className="my-auto">{item.name}</div>
                                <div className="px-2 py-1 rounded-full bg-lighter-grey-background-colour text-xs">{item.users.length}</div>
                            </div>
                            <div className="flex flex-col gap-4 h-[600px] overflow-scroll pb-8">
                                {
                                    item.users.map((user, index2) => (
                                        <div 
                                            key={index2} 
                                            className="m-2 flex flex-col align-middle justify-center rounded-md border drop-shadow-xl"
                                            onClick={() => handleClick(index, index2)}
                                        >
                                            <div className={`h-8 w-full ${gradients[index] as string} rounded-t-md`}></div>
                                            <div className="flex flex-col justify-center -translate-y-4 gap-4 border-b pb-4">
                                                <div className="mx-auto text-center">
                                                    <Avatar
                                                        size={50}
                                                        name={user.distinctId}
                                                        variant="marble"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="m-auto text-sm text-center">{user.name}</div>
                                                    <div className="m-auto text-xs text-center">{user.distinctId}</div>
                                                </div>
                                            </div>
                                            <div className="m-auto text-xs text-center pb-4">
                                                <span className="text-light-grey-text-colour"> Conversion Probability: </span> {(user.probability * 100).toFixed(2)} % 
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
            {
                selectedUser &&
                <Dialog.Root open={isOpen}>
                    <Dialog.Portal>
                    <Dialog.Overlay className="DialogOverlay2" />
                    <Dialog.Content className="DialogContent min-w-[50%] max-w-max" onInteractOutside={() => setIsOpen(false)}>
                        <div className="flex flex-col align-middle justify-center rounded-md border drop-shadow-xl">
                            <div className={`h-16 w-full ${gradients[selectedIndex] as string} rounded-t-md`}></div>
                            <div className="flex flex-col justify-center -translate-y-6 gap-6 border-b pb-4">
                                <div className="mx-auto text-center">
                                    <Avatar
                                        size={80}
                                        name={selectedUser.distinctId}
                                        variant="marble"
                                    />
                                </div>
                                <div>
                                    <div className="m-auto text-center">{selectedUser.name}</div>
                                    <div className="m-auto text-sm text-center">{selectedUser.distinctId}</div>
                                </div>
                            </div>
                            <div className="m-auto text-center border-b pb-4">
                                <span className="text-light-grey-text-colour"> Conversion Probability: </span> {(selectedUser.probability * 100).toFixed(2)} % 
                            </div>
                            <div className="p-8">
                                <div className="text-center font-medium mb-4">
                                    Top Factors that Influenced the Prediction
                                </div>
                                {selectedUser.features.map((feature, index) => {
                                    return (
                                        <div key={index} className="grid grid-cols-[0.1fr_1.25fr_2fr_0.25fr] p-4 mr-8 ml-4 gap-12">
                                            <div className="w-6 h-6 bg-light-grey-background-colour text-sm flex justify-center"> 
                                                <div className="my-auto">{index + 1}</div>
                                            </div>
                                            <div className="border-y-0 border-l-0 text-sm">{feature.feature}</div>
                                            <div className="flex flex-row">
                                                <div className="w-full rounded-l-md bg-light-grey-background-colour flex flex-row justify-end">
                                                    {
                                                        feature.score && feature.score < 0 &&
                                                        <div 
                                                        className="bg-accent-colour h-full rounded-l-md w-1/2 align-end"
                                                        style={
                                                            {
                                                                'width': `${selectedUser.features[0]?.score ? ((feature.score / selectedUser.features[0]?.score) * 100).toFixed(0) : '0'}%`
                                                            }
                                                        }
                                                        />
                                                    }
                                                </div>
                                                <div className="w-full rounded-r-md bg-light-grey-background-colour">
                                                    {
                                                        feature.score && feature.score > 0 &&
                                                        <div 
                                                            className="bg-accent-colour h-full rounded-r-md w-1/2"
                                                            style={
                                                                {
                                                                    'width': `${selectedUser.features[0]?.score ? ((feature.score / selectedUser.features[0]?.score) * 100).toFixed(0) : '0'}%`
                                                                }
                                                            }
                                                        />
                                                    }
                                                </div>
                                            </div>
                                            <div> {feature.score.toFixed(4)} </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            }
        </div>
    )
}

export default UsersFeatureImportance;