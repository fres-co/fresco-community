const KahootURL = 'https://kahoot.it'

import { Styled } from '../components/Styled'

export const KahootPlayer = ({ pin } : { pin?: number }) => {

    const url = new URL(KahootURL)
    if (pin) {
        url.searchParams.set('pin', pin)
    }
    
    return <Styled
        el={<iframe src={url.toString()} />}
        css={`
            width: 100%;
            height: 100%;
            border: none;
        }`
    } />
}
