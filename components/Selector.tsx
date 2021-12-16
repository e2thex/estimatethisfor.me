import React, { useState } from "react";
const Selector = () => {
	const [newId, setNewId ] = useState('');
	// const history = useHistory();
	return (
	  <form onSubmit={(e) => {
      e.preventDefault();
      window.location.replace(`?id=${encodeURI(newId)}`)
    }}>
	    <input className = "text-center border w-5/6 p-2  border-gray-600 placeholder-gray-600 text-lg" placeholder="Enter name of what is being rated" value = {newId} onChange = {(e) => setNewId(e.currentTarget.value)} />
	    <input className = "w-1/6 text-lg border  p-2 bg-blue-300 hover:bg-blue-500 hover:text-white" type="submit" value = "Submit" />  
	  </form>
	)
}
export default Selector
