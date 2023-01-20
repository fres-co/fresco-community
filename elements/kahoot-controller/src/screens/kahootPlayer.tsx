const KahootURL = 'https://kahoot.it'

import { Styled } from '../components/Styled'

let haveLocalStorage = false
try {
    haveLocalStorage = Boolean(window.localStorage)
} catch{
    // no local storage
}


export const KahootPlayer = ({ pin, canSetPin, resetPin } : { pin?: number, canSetPin: boolean, resetPin: () => void }) => {

    const url = new URL(KahootURL)
    if (pin) {
        url.searchParams.set('pin', pin)
    }

    if(!haveLocalStorage){
        return <Styled
        css='text-align: center; padding-top: 30px; background-color: rgb(56, 18, 114); height: 100%; color:white; font-size: 24px; font-weight: bold;'
        >
            Sorry, looks like you can not access this Kahoot!<br/>
            Are you using incognito mode ?<br/>if so, please reopen in non-incognito mode.
        </Styled>
    }
    
    return <><Styled
        el={<iframe src={url.toString()} />}
        css={`
            width: 100%;
            height: 100%;
            border: none;
        }`
    } />
        {canSetPin && <Styled
            css={`position: absolute; top: 10px; left:10px; padding: 10px; border-radius: 30px; font-weight: bold; cursor: pointer; background: white`}
            onClick={resetPin}>
            RESET PIN
            </Styled>}
    
    </>
}
