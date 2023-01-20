import { useMemo } from "react"

export const useStyle = (elStyle: string) => {

    const className = useMemo(() => `useStyle-${Date.now()}-${Math.floor(Math.random() * 1000)}`, [elStyle])

    const style = <style>
        {`.${className} { ${elStyle}}`}
    </style>

    return { className, style }
}