import { DatePicker } from "antd";
import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

const DateInTable = forwardRef(function (
  {
    value,
    onChange,
    save,
  }: {
    value?: number;
    onChange?: (value: string | null) => void;
    save: () => void;
  },
  ref: ForwardedRef<any>,
) {
  const [val, setVal] = useState<Dayjs | undefined>();
  useEffect(() => {
    if (value) {
      setVal(dayjs(value));
    }
  }, [value]);
  return (
    <DatePicker
      value={val}
      onChange={(date) => {
        onChange!(date?.toISOString());
      }}
      format={["ll", "L", "l", "DDMMYY"]}
      onOpenChange={(open) => {
        if (!open) {
          save();
        }
      }}
      needConfirm
      autoFocus
    />
  );
});

export default DateInTable;
