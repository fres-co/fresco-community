const KahootURL = 'https://kahoot.it'

import { Styled } from '../components/Styled'

export const KahootPlayer = ({ pin, canSetPin, resetPin } : { pin?: number, canSetPin: boolean, resetPin: () => void }) => {

    const url = new URL(KahootURL)
    if (pin) {
        url.searchParams.set('pin', pin)
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
