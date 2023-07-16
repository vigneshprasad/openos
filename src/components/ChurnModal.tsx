import * as Dialog from '@radix-ui/react-dialog'
import ScatterPlotForPhoneDevice from './ScatterPlotForPhoneDevice';
import { api } from '~/utils/api';
import { useEffect, useState } from 'react';
import { type dummyChurnGraph } from '~/constants/dummyData';

interface IProps {
    isOpen: boolean;
    handleOpenChange: () => void;
    modelId?: string;
    featureId?: string;
}

export const ChurnDetailsModal: React.FC<IProps> = ({
    isOpen,
    handleOpenChange,
    modelId,
    featureId
}) => {

  const [churnGraphData, setChurnGraphData] = useState<typeof dummyChurnGraph[]>([]);

  const runChurnGraphMutation = api.dataModelRouter.getChurnGraph.useMutation({
    onSuccess: (churnGraphData) => {
      setChurnGraphData(churnGraphData);
    }
  });

  useEffect(() => {
    if(!isOpen || !modelId || !featureId)return;
      runChurnGraphMutation.mutate({
      modelId,
      featureId,
      date: new Date()
    });
  }, [isOpen, modelId, featureId]);


  return (
    <div>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent bg-white w-[90vw] min-w-[800px] max-w-max">
            hello
            <ScatterPlotForPhoneDevice churnGraphData={churnGraphData}/>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )  
}