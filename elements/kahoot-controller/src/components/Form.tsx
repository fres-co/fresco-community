import { useStyle } from "../hooks/useStyle";

export const Form = (props: any) => {
  const { className, style } = useStyle(
    `
            background-color: white;
            max-width: 800px;
            display: flex;
            flex-direction: column;
            padding: 15px;
            width: 300px;
            ${props.css}
        `
  );
  return (
    <>
      {style}
      <form {...props} className={className} />
    </>
  );
};
