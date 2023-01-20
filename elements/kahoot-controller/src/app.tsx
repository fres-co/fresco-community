import { useState } from 'react'
import './App.css'
import { KahootPlayer } from './kahootPlayer'
import { usePin } from './usePin'
import { SettingScreen } from './settingScreen'



export function App() {
  const { pin, setPin } = usePin()

  if(pin){
    return  <KahootPlayer pin={pin} />
  }
  return (
    <SettingScreen setPin={setPin} />
  )
}
