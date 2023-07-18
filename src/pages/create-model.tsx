import { type DataModel } from "@prisma/client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import Typography from "~/Typography";
import { BaseLayout } from "~/components/BaseLayout";
import CreateModelForm from "~/components/CreateModalForm";
import { IntegrationStatus } from "~/components/IntegrationStatus";
import { PreviousModelsSection } from "~/components/PreviousModelsSection";
import { api } from "~/utils/api";

export type ModelPredictionTabKeys = 'churn' | 'retention' | 'conversion' | 'frequency' | 'roas' | 'ltv';

interface ModelPredictionTabItem {
    key: ModelPredictionTabKeys;
    title: string;
    disabled: boolean;
    beta: boolean;
}

const MODEL_PREDICTION_TAB_ITEMS: ModelPredictionTabItem[] = [{
    key: 'churn',
    title: 'Churn',
    disabled: false,
    beta: false,
}, {
    key: 'conversion',
    title: 'Conversion',
    disabled: false,
    beta: false,

},
{
    key: 'retention',
    title: 'Retention',
    disabled: false,
    beta: false,

},
{
    key: 'frequency',
    title: 'Frequency',
    disabled: false,
    beta: true,

}, {
    key: 'roas',
    title: 'ROAS',
    disabled: true,
    beta: false,
},
{
    key: 'ltv',
    title: 'LTV',
    disabled: true,
    beta: false,
}
]


const CreateModel = () => {
    const [modelHistory, setModelHistory] = useState<DataModel[]>([]);

    const listOfModels = api.dataModelRouter.getModelMutation.useMutation({
        onSuccess: (data) => {
            setModelHistory(data)
        },
        onError: () => {
            return null;
        }
    })

    useMemo(() => listOfModels.mutate(), [])
    
    const [activeTabKey, setActiveTabKey] = useState<ModelPredictionTabKeys>('churn');
    return <>
        <Head>
            <title>Open OS</title>
            <meta name="description" content="Toolsyo to make your life easier" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <BaseLayout activeKey="create-model">
            <div className="grid grid-cols-[3fr_1fr] grid-rows-1">
                <div className="grid grid-rows-[max-content_1fr] grid-cols-1">
                    <div className="h-12 flex-row flex flex-basis-content p-1 bg-homepage-tab-background">
                        <IntegrationStatus />
                    </div>
                    <div className="flex justify-between h-full">
                        <div className="flex w-full flex-col p-1 m-4 gap-8 items-center text-center">
                            <div className="flex flex-col mb-1 mt-[3%]">
                                <Typography variant="h2">Design Your Own Predictive Models</Typography>
                                <Typography variant="sub" className="underline font-[500]">Start by choosing what you wish to predict</Typography>
                            </div>
                            <div className="flex justify-center mb-5">
                                {MODEL_PREDICTION_TAB_ITEMS.map((item) => <div
                                    key={item.key}
                                    onClick={() => setActiveTabKey(item.key)}
                                    className={twMerge(
                                        "w-[130px] p-5 relative border font-semibold text-[#808192]",
                                        item.disabled ? "cursor-not-allowed text-disabled pointer-events-none" : "cursor-pointer",
                                        activeTabKey === item.key && 'bg-primary/10 text-primary'
                                    )}>
                                    {item.title}
                                    {item.beta && <div className="absolute top-1 right-1 text-xs px-2 bg-beta-background rounded-2xl text-black">Beta</div>}
                                </div>)}
                            </div>
                            <CreateModelForm model={activeTabKey}/>
                        </div>
                    </div>
                </div>
                <PreviousModelsSection models={modelHistory}/>
            </div>
        </BaseLayout>
    </>
}

export default CreateModel;