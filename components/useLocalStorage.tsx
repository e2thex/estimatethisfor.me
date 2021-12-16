import { useState } from 'react';
const useLocalStorage = (key:string, defaultValue:string) => {
	const [value, setInternalValue ] = useState(defaultValue);
	if(typeof window !== 'undefined') {
	  if (window.localStorage.getItem(key)) {
	    if (value !== window.localStorage.getItem(key) ) {
	      setInternalValue(window.localStorage.getItem(key) as string)
	    }
	  }
	  else {
	    window.localStorage.setItem(key, value);
	  }
	}
	const setValue = (v:string) => {
	  if(typeof window !== 'undefined') {
	    window.localStorage.setItem(key, v)
	    // setInternalValue(window.localStorage.getItem(key))
	  }
	}
	return [value as string, setValue] as [string, (v:string) => void];
}
export default useLocalStorage;