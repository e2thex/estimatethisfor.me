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
	const reason = useNode(currentNode.s('reason'))  as string || '';
	const score = useNode(currentNode.s('score')) as string || '';
	const [tempName, setTempName] = useState('');
	const [tempReason, setTempReason] = useState(reason);
	const [tempScore, setTempScore] = useState(score);
	const node = useAspotContext();
	const update = () => {
		if (tempName === name && tempScore === score && tempReason === reason) {
		  toast.error('You Did not enter anything to set.', {autoClose: 2000, hideProgressBar: true})
      return;
		}
    if (tempName) currentNode.s('name').is(tempName);
    if (tempScore) currentNode.s('score').is(tempScore);
    if (tempReason) currentNode.s('reason').is(tempReason);
		toast.success('Set/Update Score! Thank you.', {autoClose: 2000, hideProgressBar: true})
	}
	return (
		<>
		   <input autoFocus
      className = "text-center border border-red w-full p-2 text-lg placeholder-gray-600 border-gray-600 placeholder-italic" 
      placeholder="Enter your name" 
			onChange={e => setTempName(e.target.value)}
      defaultValue = {name}
     ></input>	
		 <label htmlFor="score" className="sr-only">Meeting Score between 1 and 10</label>
		 <input id="score" className ="mt-4 w-full cursor-pointer" type ='range' max='10' min='1' step='1' list='tickmarks' onChange={v => setTempScore(v.target.value.toString())} value ={parseInt(tempScore) || 1} defaultValue={parseInt(tempScore || score || '1')}/>
			<datalist id="tickmarks" className="flex flex-row justify-between w-full text-center text-gray-600 mb-4 cursor-pointer">
				<option value="1" label="1" onClick={e=> setTempScore("1")}></option>
				<option value="2" label="2" onClick={e=> setTempScore("2")}></option> 
				<option value="3" label="3" onClick={e=> setTempScore("3")}></option>  
				<option value="4" label="4" onClick={e=> setTempScore("4")}></option> 
				<option value="5" label="5" onClick={e=> setTempScore("5")}></option> 
				<option value="6" label="6" onClick={e=> setTempScore("6")}></option> 
				<option value="7" label="7" onClick={e=> setTempScore("7")}></option> 
				<option value="8" label="8" onClick={e=> setTempScore("8")}></option> 
				<option value="9" label="9" onClick={e=> setTempScore("9")}></option> 
				<option value="10" label="10" onClick={e=> setTempScore("10")}></option>  
			</datalist>
		<textarea 
		  className = "max-w-full border w-full p-2 text-lg placeholder-gray-600 border-gray-600 " 
			placeholder ="Reason for Score" 
			onChange={e => setTempReason(e.target.value)}
			defaultValue={reason}
			></textarea>
    <button 
			className={`w-full border border-gray-600 p-2 text-lg  ${tempName !== name || tempScore !== score || tempReason !== reason ? 'bg-blue-300 rounded hover:bg-blue-500 hover:text-white' : ''}`}
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
	const score = useNode(data.s('score'));
	const reason = useNode(data.s('reason'));
	
	return (
	  <tr className="border-t">
	    <td className="p-2 text-center">{name}</td>
	    <td className="text-center">{score}</td>
	    <td className="text-center w-7/12">{reason}</td>
	    <td className="text-center w-1/12" >
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
          <th className="w-1/6">Name</th>
          <th className="w-1/6">Score</th>
          <th className="w-7/12">Reason</th>
          <th className="w-1/12"></th>
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
  const [scoreNodes, setScoreNodes] =  useState(db.node('scores').list());
  const getScores = () => db.node('scores').list().map(n => parseInt(n.s('score').value() || '')).filter(n => n);
  const [scores, setScores] =  useState(getScores());
	// const score = useNodeList(db.node('scores'), 1).map(n => parseInt(n.score) || '').finter(n => n);n

  db.watch((...sentences) => { if(sentences.filter(s => s.predicate === 'score').length) setScores(getScores())})
  return (
    <table className="w-1/4 text-lg mx-auto my-12">
      <caption className="font-bold text-2xl">Summary Data</caption>
      <tbody>
        <tr>
          <th className="text-left p-2">Max</th>
          <td  className="text-center">{max(scores)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2">Mean</th>
	        <td  className="text-center">{mean(scores).toPrecision(3)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2">Min</th>
          <td className="text-center">{min(scores)}</td>
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