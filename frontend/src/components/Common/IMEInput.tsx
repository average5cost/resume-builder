import { useState, useRef, useEffect, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function IMEInput({ value, onChange, ...rest }: Props & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const composing = useRef(false);
  const [v, setV] = useState(value);

  useEffect(() => {
    if (!composing.current) setV(value);
  }, [value]);

  return (
    <input
      {...rest}
      value={v}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(e) => {
        composing.current = false;
        const nv = e.currentTarget.value;
        setV(nv);
        onChange(nv);
      }}
      onChange={(e) => {
        const nv = e.currentTarget.value;
        if (composing.current) {
          setV(nv);
        } else {
          setV(nv);
          onChange(nv);
        }
      }}
    />
  );
}

export function IMETextarea({ value, onChange, ...rest }: Props & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const composing = useRef(false);
  const [v, setV] = useState(value);

  useEffect(() => {
    if (!composing.current) setV(value);
  }, [value]);

  return (
    <textarea
      {...rest}
      value={v}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(e) => {
        composing.current = false;
        const nv = e.currentTarget.value;
        setV(nv);
        onChange(nv);
      }}
      onChange={(e) => {
        const nv = e.currentTarget.value;
        if (composing.current) {
          setV(nv);
        } else {
          setV(nv);
          onChange(nv);
        }
      }}
    />
  );
}
