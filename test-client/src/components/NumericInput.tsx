import {type FC, useEffect, useRef, useState} from "react";
import s from "./Channel/Channel.module.css";
import classNames from "classnames";

interface NumericInputProps {
  value: number;
  onCommit: (value: number) => void;

  parse: (input: string) => number | null;
  format: (value: number) => string;

  unit?: string;
  maxLength?: number;
  className?: string;
}

const NumericInput: FC<NumericInputProps> = ({
  value,
  onCommit,
  parse,
  format,
  unit,
  maxLength
                                             }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const skipNextBlurCommit = useRef(false);

  useEffect(() => {
    setDraft(null);
    setInvalid(false);
  }, [value]);

  const commit = () => {
    if (draft === null) return;

    const parsed = parse(draft);

    if (parsed === null || !Number.isFinite(parsed)) {
      setInvalid(true);
      return;
    }

    setDraft(null);
    setInvalid(false);
    onCommit(parsed);
  };

  const cancel = () => {
    skipNextBlurCommit.current = true;
    setDraft(null);
    setInvalid(false);
  }

  return (
    <div className={s.gainInputWrapper}>
      <input className={classNames(s.gainInput, invalid && s.invalidGain)} type={"text"}
             value={draft ?? format(value)}
             maxLength={maxLength}
             aria-invalid={invalid}
             onChange={(e) => {
               setDraft(e.target.value);
               setInvalid(false);
             }}
             onKeyDown={(e) => {
               if (e.key === "Enter") {
                 e.currentTarget.blur();
               }

               if (e.key === "Escape") {
                 cancel();
                 e.currentTarget.blur();
               }
             }}
             onBlur={() => {
               if (skipNextBlurCommit.current) {
                 skipNextBlurCommit.current = false;
                 return;
               }

               commit();
             }}/>
      { unit && <span className={s.gainUnit}>{unit}</span>}
    </div>
  );
};

export default NumericInput;
