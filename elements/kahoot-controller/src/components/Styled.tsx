import { cloneElement } from "preact";
import { JSX } from "preact/jsx-runtime";
import { useStyle } from "../hooks/useStyle";

const div = <div />;
export const Styled = ({ el = div, css, ...props }: { el?: JSX.Element; css: string; } & any) => {

    const styles = useStyle(css);

    const eiWithProps = cloneElement(el, { ...props, className: styles.className });
    return <>
        {styles.style}
        {eiWithProps}
    </>;
};
