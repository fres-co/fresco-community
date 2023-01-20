import './App.css'
import { usePin } from './hooks/usePin'
import { KahootPlayer } from './screens/kahootPlayer'

import { SettingScreen } from './screens/settingScreen'

export function App() {
  const { pin, setPin } = usePin()

  if(pin){
    return  <KahootPlayer pin={pin} />
  }
  return (
    <SettingScreen setPin={setPin} />
  )
}
