const KahootURL = 'https://kahoot.it'

import './kahootPlayer.css'

export const KahootPlayer = ({ pin } : { pin?: number }) => {

    const url = new URL(KahootURL)
    if(pin){
        url.searchParams.set('pin', pin)
    }
    

    return <iframe src={url.toString()} class="kahootPlayer" />
}
