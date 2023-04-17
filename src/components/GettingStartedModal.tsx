import * as Dialog from '@radix-ui/react-dialog'
import { UserForm } from './UserForm'
import { type SyntheticEvent, useCallback, useRef, useState, useEffect } from 'react'
import Integrations from './Integrations'
import { api } from '~/utils/api'

enum formStages {
  UserDetails = 1,
  Integrations
}

const steps = [
  formStages.UserDetails,
  formStages.Integrations
]

export const GettingStartedModal: React.FC = () => {
  const submitRef = useRef<HTMLFormElement>(null);
  const [activeStage, setActiveStage] = useState<number>(1)

  const {data: user} = api.user.getById.useQuery();

  const next = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault()

      if (steps[activeStage - 1] === steps.length) return;

      setActiveStage((prevValue) => prevValue + 1)
  }, [activeStage, setActiveStage])

  const previous = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault()

      if (steps[activeStage - 1] === 1) return;

      setActiveStage((prevValue) => prevValue - 1)
  }, [activeStage, setActiveStage])

  return (
    <div>
      <Dialog.Root>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent w-[90vw] max-w-[800px]">
            <div className="p-[10px] flex items-center justify-between border-b-[1px] border-solid border-[#373737]">
              <text className="text-sm text-[#C4C4C4]">Getting Started</text>
              <text className="text-sm text-[#616161]">{activeStage} of {steps.length}</text>
            </div>

            {activeStage == formStages.UserDetails && (
              <div className="w-[50%] mx-auto py-[48px] grid grid-cols-1 grid-rows-[max-content_1fr] gap-[40px]">
                <div>
                  <h1 className="text-2xl leading-400 text-[#fff]">Welcome to Open OS!</h1>
                  <p className="pt-2 text-sm text-[#616161]">Tell us a little about yourself. 
                  This helps us customize the product for you</p>
                </div>

                <UserForm submitFormRef={submitRef} />
              </div>
            )}

            {activeStage == formStages.Integrations && (
              <div className="w-[70%] mx-auto pt-[48px] grid grid-cols-1 grid-rows-[max-content_1fr] gap-6">
                <div>
                  <h1 className="text-2xl leading-400 text-[#fff]">Connect your tools 🛠️</h1>
                  <p className="pt-2 text-sm text-[#616161]">
                    Supercharge your productivity and connect tools you use everyday
                  </p>
                </div>

                <Integrations />
              </div>
            )}

            <div className="p-[12px] border-t-[1px] border-solid border-[#373737] flex justify-end gap-5">
              {activeStage !== 1 && 
                <button className="Button secondary w-[92px]" 
                  onClick={(e) => previous(e)}
                >
                  Back
                </button>
              }
              {activeStage !== steps.length ?
                <button className="Button primary w-[92px]" 
                  onClick={(e) => next(e)}
                >
                  Next
                </button> :
                <button className="Button primary w-[92px]" 
                  // onClick={() => submitRef.current?.requestSubmit()}
                >
                  Done
                </button>
              }
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )  
}