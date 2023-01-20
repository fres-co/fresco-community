import { useState } from "react"

export const usePin = () => {


    const [pin, setPin] = useState(0)

    return { pin, setPin }
}