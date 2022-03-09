import { and, emptyContext, has, or, TermType } from "@aspot/core";
import { useAspotContext, useNode } from "@aspot/react";
import { identity } from "lodash";
import { ChangeEvent, useState } from "react";

const DateSelector = () => {
  const db = useAspotContext();
  const date = useNode(db.node('current').s('date'));
  // const [date, setD] = useState(db.node('current').s('date').value())
	const [tempDate, setTempDate] = useState(date); 
  const change = (e:ChangeEvent<HTMLInputElement>) => {
    db.node('current').s('date').is(e.currentTarget.value);
    console.log({v:e.currentTarget.value,date});

  }
  return (
    <div className="flex justify-center text-xl">
      <label htmlFor="date" className="p-2">Target Date</label>
      <input className="border ml-2 p-2" value={date || ''} name="date" type='date'
        onChange={change}
       />
    </div>
  )
}
export default DateSelector;