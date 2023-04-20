import * as Dialog from '@radix-ui/react-dialog'
import { UserForm } from './UserForm'
import { useState, useEffect } from 'react'
import Integrations from './Integrations'
import { api } from '~/utils/api'
import { InlineWidget } from 'react-calendly'

enum formStages {
  UserDetails = 1,
  Integrations,
  Calendly,
}

const steps = [
  formStages.UserDetails,
  formStages.Integrations,
  formStages.Calendly
]

export const GettingStartedModal: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1)
  const [isNewUser, setIsNewUser] = useState(false)

  const userMutation = api.user.isNewUser.useMutation({
    onSuccess: (data) => {
      if (data.stage1) {
        setActiveStage(formStages.UserDetails)
        setIsNewUser(true)
      } else if (data.stage2) {
        setActiveStage(formStages.Integrations)
        setIsNewUser(true)
      } else if (data.stage3) {
        setActiveStage(formStages.Calendly)
        setIsNewUser(true)
      } else {
        setIsNewUser(false)
      }
    }
  })

  useEffect(() => void userMutation.mutate(), [activeStage, isNewUser])

  return (
    <div>
      <Dialog.Root open={isNewUser}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent w-[90vw] min-w-[800px] max-w-max">
              <div className="p-[10px] flex items-center justify-between border-b-[1px] border-solid border-[#373737]">
                <text className="text-sm text-[#C4C4C4]">Getting Started</text>
                <text className="text-sm text-[#616161]">{activeStage} of {steps.length}</text>
              </div>

              {activeStage === formStages.UserDetails && (
                <div className="w-[50%] mx-auto pt-[48px] pb-4 grid grid-cols-1 grid-rows-[max-content_1fr] gap-[40px]">
                  <div>
                    <h1 className="text-2xl leading-400 text-[#fff]">Welcome to Open OS!</h1>
                    <p className="pt-2 text-sm text-[#616161]">Tell us a little about yourself. 
                    This helps us customize the product for you</p>
                  </div>

                  <UserForm 
                    onSuccessCallback={userMutation.mutate} 
                    userName={userMutation.data?.user?.name ?? undefined} 
                    userRole={userMutation.data?.user?.role ?? undefined}
                  />
                </div>
              )}

              {activeStage === formStages.Integrations && (
                <div className="w-[70%] mx-auto pt-[48px] pb-4 grid grid-cols-1 grid-rows-[max-content_1fr] gap-6">
                  <div>
                    <h1 className="text-2xl leading-400 text-[#fff]">Connect your data sources 🛠️</h1>
                    <p className="pt-2 text-sm text-[#616161]">
                        Connect at-least one data source to get started.
                    </p>
                  </div>

                  <Integrations />
                </div>
              )}

              {activeStage === formStages.Calendly && (
                <div className="pt-4">
                  <p className="text-sm text-[#fff] text-center">
                    Your account is pending onboarding. Please schedule a call using Calendly below.
                  </p>

                  <InlineWidget
                    url="https://calendly.com/vivanpuri/product-experience-a"
                    styles={{
                      marginTop: "-50px",
                      height: "700px",
                      width: "1000px",
                    }}
                  />
                </div>
              )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )  
}