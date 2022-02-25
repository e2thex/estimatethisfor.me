import React, { useState } from 'react';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { mean, min, max } from 'lodash';
import useLocalStorage from './useLocalStorage';
import {markdownTable} from 'markdown-table'
import { toast } from 'react-toastify';
import { useNode, AspotWrapper, useAspotContext, useNodeList} from '@aspot/react';
import { aspot, PredicateNode, StoreNode, SubjectNode  } from '@aspot/core';
import webSocketConnector from '@aspot/websocket';
import copyToClipBoard from 'copy-to-clipboard';
import CopyIcon from './CopyIcon'
import MdIcon from './MdIcon';

const UserForm = (props:{currentNode:PredicateNode<StoreNode>}) => {
	const { currentNode  } = props;
	const name = useNode(currentNode.s('name'))  as string || '';
	const b = parseInt(useNode(currentNode.s('b')))  || 0;
	const o = parseInt(useNode(currentNode.s('o')))  || 0;
	const a = parseInt(useNode(currentNode.s('a')))  || 0;
	const t = parseInt(useNode(currentNode.s('t')))  || 0;
	const [tempName, setTempName] = useState('');
	const [tempB, setTempB] = useState(b);
	const [tempO, setTempO] = useState(o);
	const [tempA, setTempA] = useState(a);
	const [tempT, setTempT] = useState(t);
	const isChange = !(tempName === name && tempB === b && tempO === o && tempA === a && tempT ===t)
	let total = tempB + tempO + tempA + tempT
	const node = useAspotContext();
	const update = () => {
		if (!isChange) {
		  toast.error('You Did not enter anything to set.', {autoClose: 2000, hideProgressBar: true})
      return;
		}
		if (!tempName) {
		  toast.error('Please enter a name.', {autoClose: 2000, hideProgressBar: true})
      return;
		}
		if (total < 10) {
		  toast.error('Your Total must add up to 100%.', {autoClose: 2000, hideProgressBar: true})
      return;
		}
    if (tempName) currentNode.s('name').is(tempName);
		currentNode.s('b').is(tempB.toString())
		currentNode.s('o').is(tempO.toString())
		currentNode.s('a').is(tempA.toString())
		currentNode.s('t').is(tempT.toString())
		toast.success('Set/Update Score! Thank you.', {autoClose: 2000, hideProgressBar: true})
	}
	const Dot = () => <span className="w-6 text-transparent bg-blue-500 hover:bg-blue-800 cursor-grab rounded-full m-1 inline-block">a</span>;
	const Pcomp = (props:{label:string, max:number, setTemp:(n:number)=>void, temp:number}) => {
		const {label, max, setTemp, temp,	 ...rest} = props;
		const values = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
		const options = values.filter((v,i) => i <= max);
		const optionsThatSteal = values.filter((v,i) => i > max);
		console.log({values, options, optionsThatSteal})
		return (
		<div {...rest}>
			<label htmlFor={label} className="w-32 inline-block text-lg"><span className="font-bold text-2xl">{label.substring(0,1)}</span>{label.substring(1)}</label>
			<select className="form-select form-select-lg mb-3
      appearance-none
      px-4
      py-2
      text-xl
      font-normal
      text-gray-700
      bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300
      rounded
      transition
      ease-in-out
      m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id={label} value = {temp} onChange={e => setTemp(parseInt(e.currentTarget.value))} >
				{options.map((v,i) => <option key={v} value={i}>{v}</option>)}
			</select>
			{values.filter((v,i) => i < temp).map((v, i) => <Dot key={i+max}/>)}{JSON.stringify((new Array(temp)).keys)}
		</div>
		);
	}
	return (
		<>
		  <input autoFocus
      className = "text-center border border-red w-full p-2 text-lg placeholder-gray-600 border-gray-600 placeholder-italic" 
      placeholder="Enter your name" 
			onChange={e => setTempName(e.target.value)}
      defaultValue = {name}
      ></input>	
			<Pcomp label="Before" max ={10 - total + tempB} setTemp={setTempB} temp={tempB} />
			<Pcomp label="Ontime" max ={10 - total + tempO} setTemp={setTempO} temp={tempO} />
			<Pcomp label="After" max = {10 - total + tempA} setTemp={setTempA} temp={tempA} />
			<Pcomp label="Terrible" max ={10 - total + tempT} setTemp={setTempT} temp={tempT} />
      <button 
			className={`w-full border border-gray-600 p-2 text-lg  ${(isChange && (total === 10)) ? 'bg-blue-300 rounded hover:bg-blue-500 hover:text-white' : ''}`}
			onClick={update}
			>{name ? 'Resubmit' : 'Submit and See Results'}</button>
		</>

	)
};
const markdownResults = (data:SubjectNode<StoreNode>) => {
	const rows = data.list().map(d => [
		d.s('name').value(),
		d.s('score').value(),
		d.s('reason').value(),
	]);
	return markdownTable([
		['name', 'score', 'reason'],
		...rows,
	]);
}
const ResultRow = (props:{data:PredicateNode<StoreNode>, removeItem:() => void}) => {
	const {data, removeItem } = props;
	const name = useNode(data.s('name'));
	const b = useNode(data.s('b'));
	const o = useNode(data.s('o'));
	const a = useNode(data.s('a'));
	const t = useNode(data.s('t'));
	
	return (
	  <tr className="border-t">
	    <td className="p-2 text-center">{name}</td>
	    <td className="text-center">{parseInt(b)*10}%</td>
	    <td className="text-center">{parseInt(o)*10}%</td>
	    <td className="text-center">{parseInt(a)*10}%</td>
	    <td className="text-center">{parseInt(t)*10}%</td>
	    <td className="text-center" >
	      <div className ="cursor-pointer p-2 rounded-full border-red-700 text-red-700 hover:font-bold" onClick={removeItem} >X</div>
	    </td>
	  </tr>
	)
}
const copy = (id:string) => {
	const content = window.document.getElementById(id)?.outerHTML || ''
	copyToClipBoard(content, {format:"text/html"});
	toast.success('Copy Result table to Clipboard',{autoClose: 2000, hideProgressBar: true})
}
const Results = (props:{data:PredicateNode<StoreNode>[], deleteItem:(i:string) => void}) => {
	const { data, deleteItem } = props;

	//const stuff = useContextGun()(data, 'data');
	return (
		<>
	  <table id ='results' className="table-fixed w-full my-12">
	    <thead>
	      <tr>
          <th className="w-2/6">Name</th>
          <th className="w-1/6">Before</th>
          <th className="w-1/6">Ontime</th>
          <th className="w-1/6">After</th>
          <th className="w-1/6">Terrible</th>
	      </tr>
	    </thead>
	    <tbody>
	    {data.map((node) => {
        const id=node.predicate()
	      return (<ResultRow key={id} removeItem={() => deleteItem(id)} data={node} />)
	    })}
	    </tbody>
	  </table>
		</>
	)
}
type DataItem = {
  name: string,
  score: string,
  reason: string,
}
type Data = {
  [key:string] : DataItem,
}
const Summary = (props:{ data:PredicateNode<StoreNode>[]}) => {
  const {data} = props;
  const db = useAspotContext();
  const getA = () => db.node('a').list().map(n => parseInt(n.s('a').value() || '')).filter(n => n);
  const getB = () => db.node('b').list().map(n => parseInt(n.s('b').value() || '')).filter(n => n);
  const [As, setAs] =  useState(getA());
  const [Bs, setBs] =  useState(getB());
	// const score = useNodeList(db.node('scores'), 1).map(n => parseInt(n.score) || '').finter(n => n);n

  // db.watch((...sentences) => { if(sentences.filter(s => s.predicate === 'b').length) setBs(getB())})
  // db.watch((...sentences) => { if(sentences.filter(s => s.predicate === 'a').length) setAs(getA())})
  return (
    <table className="w-full text-lg mx-auto my-12">
      <caption className="font-bold text-2xl">Summary Data</caption>
      <tbody>
        <tr>
          <th className="text-left p-2 w-2/6">Max bob</th>
          <td  className="text-center w-1/6">{max(As)}</td>
          <td  className="text-center w-1/6">{max(Bs)}</td>
          <td  className="text-center w-1/6">{max(As)}</td>
          <td  className="text-center w-1/6">{max(As)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2 w-2/6">Mean</th>
	        <td  className="text-center w-1/6">{mean(Bs).toPrecision(3)}</td>
	        <td  className="text-center w-1/6">{mean(Bs).toPrecision(3)}</td>
	        <td  className="text-center w-1/6">{mean(Bs).toPrecision(3)}</td>
	        <td  className="text-center w-1/6">{mean(Bs).toPrecision(3)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2 w-2/6">Min</th>
          <td className="text-center w-1/6">{min(Bs)}</td>
          <td className="text-center w-1/6">{min(Bs)}</td>
          <td className="text-center w-1/6">{min(Bs)}</td>
          <td className="text-center w-1/6">{min(Bs)}</td>
        </tr>
      </tbody>
    </table>
  )
}
const RatingAppInner = (props:{userId:string, id:string}) => {
  const {userId, id} = props;
  const db = useAspotContext();
  const scoresNode = db.node('scores')
  const currentScoreNode = scoresNode.s(userId);
  const scores = useNodeList(scoresNode);
  // const scores = scoresNode.list()
	const name = useNode(currentScoreNode.s('name')) as string;

	const deleteItem = (key:string) => {
		const name = scoresNode.s(key).s('name').value();
    scoresNode.s(key).del(1);
		toast.success(`Delete record for ${name}`,{autoClose: 2000, hideProgressBar: true},)
	}
	return (
		<>
		  <div className='w-2/3 text-center mx-auto my-12'>Please rate <strong>{id}</strong> using the form below. <div className='italic font-light'>The data is only used for the purposes of this rating and is not saved.</div></div>
			<UserForm currentNode={currentScoreNode} />
	    { name ? <><h2 className='mx-auto w-50 text-3xl text-center font-bold my-12'>Results <span title='Copy Results to clipboard'><CopyIcon className='cursor-pointer inline' onClick={e => copy('results')}/></span><span title='Copy Results to clipboard as Markdown'><MdIcon className='cursor-pointer inline w-8' onClick={e => {copyToClipBoard(markdownResults(scoresNode)); 	toast.success('Copy Result table to Clipboard as Markdown',{autoClose: 2000, hideProgressBar: true})}} /></span>
			</h2><Results data={scores} deleteItem={deleteItem} /> <Summary data={scores} /></> : <></> }
     
    </>
	)
}
const RatingApp = (props:{id:string}) => {
	const {id} = props;
	const [userId, setUserId ] = useLocalStorage('meetingUserId2', v4());
  const node = aspot();
	webSocketConnector('wss://meetingappwebsocket.herokuapp.com/', id)(node);
	return (
		<AspotWrapper node={node} >
      <RatingAppInner userId={userId} id={id}/>
	  </AspotWrapper>
	)
}
export default RatingApp;