import {findIndex, isEqual, max, update} from 'lodash';
type Item = {
	subject: String,
	object: String,
	predicate: String,
};

type Update = {
  from: Item|null,
  to: Item|null,
  date: string,
};

type Database = Item[];


const Database = (start:Database) => {
  const data = start
  const updates = [] as Update[];
}

const executeUpdate = (data:Database) => (u:Update) => {
  if (u.from !== null) {
    const removeKey = findIndex(data, (i => isEqual(u.from, i)));
    data.splice(removeKey, 1);
  }
  if (u.to !== null) {
    data.push(u.to)
  }
}
const reverseUpdate = (u:Update) => ({ date: u.date, from: u.to, to: u.from});
const splitUpdatesByDate = (updates:Update[]) => (date:string) => {
  const {before, after } = updates.reduce((r, u:Update) => {
    if (u.date > date) {
      r.after.push(u);
    } else {
      r.before.push(u);
    }
    return r;
  }, {before:[] as Update[], after:[] as Update[]});
  return {before, after};
};
const updateData = (data:Database) => (updates:Update[]) => (u:Update) => {
  
}
const getUpdatesDates = (updates:Update[]) => updates.map((u => u.date));