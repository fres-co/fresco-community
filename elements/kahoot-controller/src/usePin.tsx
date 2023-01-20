import { useState } from "preact/hooks"

export const usePin = () => {


    const [pin, setPin] = useState(0)

    return { pin, setPin }
}