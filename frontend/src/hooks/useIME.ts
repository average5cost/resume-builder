import { useRef } from 'react';

export function useIMEInput(value: string, onChange: (v: string) => void) {
  const composing = useRef(false);
  return {
    value,
    onCompositionStart: () => { composing.current = true; },
    onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      composing.current = false;
      onChange((e.target as HTMLInputElement).value);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!composing.current) onChange(e.target.value);
    },
  };
}

export const useIMETextarea = useIMEInput;
