import * as Dialog from '@radix-ui/react-dialog'
import ScatterPlotForPhoneDevice from './ScatterPlotForPhoneDevice';

interface IProps {
    isOpen: boolean;
    handleOpenChange: () => void;
}

export const ChurnDetailsModal: React.FC<IProps> = ({
    isOpen,
    handleOpenChange
}) => {
  return (
    <div>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent bg-white w-[90vw] min-w-[800px] max-w-max">
            hello
            <ScatterPlotForPhoneDevice/>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )  
}