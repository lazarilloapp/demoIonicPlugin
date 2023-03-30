import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonText,
  IonToggle
} from '@ionic/react'
import { SdkStepRoute } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions'
import { useState } from 'react'

interface RouteInstructionProps {
  steps: SdkStepRoute[],
  currentStepIndex: number | undefined
}
const RouteInstruction: React.FC<RouteInstructionProps> = ({ steps, currentStepIndex }) => {
  const [useHTML, setUseHTML] = useState(false)

  if (steps.length === 0) {
    return (<></>)
  }
  return (<>
    <IonItemGroup>
      <IonItemDivider color='success'>
        <IonLabel>Current Route Instructions</IonLabel>
      </IonItemDivider>
      <IonItem color='medium'>
        <IonLabel>Use HTML</IonLabel>
        <IonToggle slot='end' checked={useHTML} onIonChange={e => setUseHTML(e.detail.value)} />
      </IonItem>
      {steps.map((step, i) => (
        <IonItem key={i}>
          {useHTML ?
            <IonText color={currentStepIndex == i ? 'primary' : ''} dangerouslySetInnerHTML={{__html: step.html_instructions}}/>
            :  
            <IonText color={currentStepIndex == i ? 'primary' : ''}>{step.plain_instructions}</IonText>
          }          
        </IonItem>
      ))}
    </IonItemGroup>
  </>)
}

export default RouteInstruction