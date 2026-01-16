import React, { useState } from 'react';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { mean, min, max } from 'lodash';
import useLocalStorage from './useLocalStorage';
import {markdownTable} from 'markdown-table'
import { toast } from 'react-toastify';
import { DragDropContainer, DropTarget } from 'react-drag-drop-container';
import { useNode, AspotWrapper, useAspotContext, useNodeList} from '@aspot/react';
import { aspot, has, PredicateNode, StoreNode, SubjectNode, TermType, watcher  } from '@aspot/core';
import webSocketConnector from '@aspot/websocket';
import copyToClipBoard from 'copy-to-clipboard';
import CopyIcon from './CopyIcon'
import MdIcon from './MdIcon';
import DateSelector from './DateSelector';
import { WrappedBuildError } from 'next/dist/server/next-server';

const formatDate = (date:number) => {
  return new Date(date).toLocaleDateString('us-EN',{month:'short',day:'2-digit'});
}
const getWeeksFromToday = (date:number) => {
  const today = Date.now();
  const diffInMs = date - today;
  const diffInWeeks = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 7));
  return diffInWeeks;
}
const formatDateWithWeeks = (date:number, offset:number = 0) => {
  const dateStr = formatDate(date + offset);
  const weeks = getWeeksFromToday(date);
  return `${dateStr} (${weeks}w)`;
}
const offsetDate = (deadline:number, delta:number) => {
	const change = delta < 0 ?
	  Math.max(Math.min((deadline -Date.now())*delta, - 604800000), - 2592000000) :
	  Math.min(Math.max((deadline -Date.now())*delta, + 604800000), + 2592000000);
  return deadline + change;
}

const parseLocalDate = (date:string) =>(
	Date.parse(date) + (new Date(date).getTimezoneOffset() * 60*1000)

)
const UserForm = (props:{userId:string, currentNode:PredicateNode<StoreNode>}) => {
	const { currentNode, userId } = props;
	const db = useAspotContext();
	const deadline = useNode(db.node('current').s('date') as any) + ' UTC';
	const name = useNode(currentNode.s('name') as any)  as string || '';
	const b = parseInt(useNode(currentNode.s('b') as any))  || 0;
	const o = parseInt(useNode(currentNode.s('o') as any))  || 0;
	const a = parseInt(useNode(currentNode.s('a') as any))  || 0;
	const t = parseInt(useNode(currentNode.s('t') as any))  || 0;
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
  type DotAddProps = {
		increase: () => void;
	}
	const DotAdd = (props:DotAddProps) => {
		const { increase } = props;
		return <span className="w-6 text-blue-500 border-blue-500 hover:border-blue-800 cursor-pointer rounded-full m-1 inline-block text-center font-bold"onClick={increase}>+</span>
	}
  type DotProps = {
		decrease: () => void;
	}
	const DotRemove = (props:DotProps) => {
		const { decrease } = props;
		return <span className="w-6 text-blue-500 border-blue-500 hover:border-blue-800 cursor-pointer rounded-full m-1 inline-block text-center font-bold" onClick={decrease}>-</span>
	}
	const Dot = (props:DotProps) => {
		const { decrease } = props;
	  return (
			<DragDropContainer targetKey="points" onDrop={decrease}  dragClass="cursor-grabbing">
				<span className="w-6 text-transparent bg-blue-500 hover:bg-blue-800 cursor-grab rounded-full m-1 inline-block">a</span>
			</DragDropContainer>
		);
	}
	const Pcomp = (props:{label:string, max:number, setTemp:(n:number)=>void, temp:number, desc:string}) => {
		const {label, max, setTemp, temp,	desc, ...rest} = props;
		const values = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
		const options = values.filter((v,i) => i <= max);
		const optionsThatSteal = values.filter((v,i) => i > max);
		return (
		<div {...rest} className ="flex flex-wrap" title={desc}>
			<label htmlFor={label} title={desc} className="lg:w-3/12 block text-lg w-1/2">
				<span className="font-bold text-2xl">{label.substring(0,1)}</span>
				{label.substring(1)} 
				<div className="text-sm inline-block lg:block">{desc}</div>
			</label>
			<select title={desc} className="form-select form-select-lg mb-3
      appearance-none
			lg:w-1/6
			w-1/2
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
			block
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id={label} value = {temp} onChange={e => setTemp(parseInt(e.currentTarget.value))} >
				{options.map((v,i) => <option key={v} value={i}>{v}</option>)}
			</select>
		  <div className="w-full lg:w-7/12 block">
				<DropTarget highlightClassName="bg-blue-800 border" targetKey="points" onHit={() => setTemp(temp+1)}>
					<div className='w-full'>
            {temp>0? <DotRemove decrease={() => setTemp(temp-1)} /> : <></>}
						{values.filter((v,i) => i < temp).map((v, i) => <Dot decrease={() => setTemp(temp-1)} key={i+max}/>)}{JSON.stringify((new Array(temp)).keys)}
            {temp<max? <DotAdd increase={() => setTemp(temp+1)} /> : <></>}
						{max===0 ? <span className="text-transparent">Empty</span> :<></>}
					</div>

				</DropTarget>
				
			</div>
			
		</div>
		);
	}
	const aDeadline = Date.parse(deadline) + (new Date(deadline).getTimezoneOffset() * 60*1000)
	const before = formatDateWithWeeks(offsetDate(aDeadline, -.1)) 
	const ontime = formatDateWithWeeks(aDeadline);
	const after = formatDateWithWeeks(aDeadline, 60*60*24*1000) 
	const terrible = formatDateWithWeeks(offsetDate(aDeadline, .1))  
	const bDesc = `before ${before}`;
	const oDesc = `${before} to ${ontime}`;
	const aDesc = `${after} to ${terrible}`;
	const tDesc = `after ${terrible}`;
	return (
		<>
		  <input autoFocus
      className = "text-center border border-red w-full p-2 text-lg placeholder-gray-600 border-gray-600 placeholder-italic" 
      placeholder="Enter your name" 
			onChange={e => setTempName(e.target.value)}
      defaultValue = {name}
      ></input>	
			<Pcomp label="Before" desc={bDesc} max ={10 - total + tempB} setTemp={setTempB} temp={tempB} />
			<Pcomp label="Ontime" desc={oDesc}  max ={10 - total + tempO} setTemp={setTempO} temp={tempO} />
			<Pcomp label="After" desc={aDesc}  max = {10 - total + tempA} setTemp={setTempA} temp={tempA} />
			<Pcomp label="Terrible" desc={tDesc}  max ={10 - total + tempT} setTemp={setTempT} temp={tempT} />
      <button 
			className={`w-full border border-gray-600 p-2 text-lg  ${(isChange && (total === 10)) ? 'bg-blue-300 rounded hover:bg-blue-500 hover:text-white' : ''}`}
			onClick={update}
			>{name ? 'Resubmit' : 'Submit and See Results'}</button>
		</>

	)
};
const markdownResults = (data:SubjectNode<StoreNode>) => {
	const dataList = data.list();
	const rows = dataList.map(d => [
		d.s('name').value(),
		`${parseInt(d.s('b').value() || '0')*10}%`,
		`${parseInt(d.s('o').value() || '0')*10}%`,
		`${parseInt(d.s('a').value() || '0')*10}%`,
		`${parseInt(d.s('t').value() || '0')*10}%`,
	]);
	
	// Calculate averages
	const avgB = mean(dataList.map((node) => parseInt(node.s('b').value() || '0')))*10;
	const avgO = mean(dataList.map((node) => parseInt(node.s('o').value() || '0')))*10;
	const avgA = mean(dataList.map((node) => parseInt(node.s('a').value() || '0')))*10;
	const avgT = mean(dataList.map((node) => parseInt(node.s('t').value() || '0')))*10;
	
	return markdownTable([
		['name', 'before', 'ontime', 'after', 'terrible'],
		...rows,
		['**Average**', `${avgB}%`, `${avgO}%`, `${avgA}%`, `${avgT}%`],
	]);
}
const ResultRow = (props:{data:PredicateNode<StoreNode>, removeItem:() => void}) => {
	const {data, removeItem } = props;
	const name = useNode(data.s('name') as any);
	const b = useNode(data.s('b') as any);
	const o = useNode(data.s('o') as any);
	const a = useNode(data.s('a') as any);
	const t = useNode(data.s('t') as any);

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
	const getMean =() => ({
		t: mean(data.map((node) => parseInt(node.s('t').value() || '')))*10,
		b: mean(data.map((node) => parseInt(node.s('b').value() || '')))*10,
		o: mean(data.map((node) => parseInt(node.s('o').value() || '')))*10,
		a: mean(data.map((node) => parseInt(node.s('a').value() || '')))*10,
	})
	const [means, setMeans] = useState(getMean());
	const db = useAspotContext();
	db.watch((s) => {
		// t is the past one that gets written
		if(s && s.predicate === 't') {
		  setMeans(getMean())
		};
	});
	

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
			<tfoot>
				<tr>
					<th>Average</th>
					<th>{means.b}%</th>
					<th>{means.o}%</th>
					<th>{means.a}%</th>
					<th>{means.t}%</th>
				</tr>
			</tfoot>
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
const RatingAppInner = (props:{userId:string, id:string, date:string}) => {
  const {userId, id} = props;
  const db = useAspotContext();
	const date = useNode(db.node('current').s('date') as any);
  const scoresNode = db.node('scores');
  const currentScoreNode = db.node('scores').s(userId);
  const scores = useNodeList(scoresNode);
  // const scores = scoresNode.list()
	const name = useNode(currentScoreNode.s('name') as any) as string;

	return (
		<>
		  <DateSelector />	
		  {date ? <>
	    	<div className='w-2/3 text-center mx-auto my-12'>Please estimate <strong>{id}</strong> using the form below. <div className='italic font-light'>The data is only used for the purposes of this estimation and is not saved.</div></div>
		  	<UserForm userId = {userId} currentNode={currentScoreNode} />
			</> : <></> }
			{name ? <ResultsWrapper id={id} date ={date} /> : <></>}
    </>
	)
}
const ResultsWrapper = (props:{id:string, date:string}) => {
  const {id} = props;
  const db = useAspotContext();
	const date = useNode(db.node('current').s('date') as any)
	const dateId = useNode(db.node('scores').s(date) as any)
  const scoresNode = db.node(dateId);
  const scores = useNodeList(db.node('scores'));

	const deleteItem = (key:string) => {
		const name = scoresNode.s(key).s('name').value();
    scoresNode.s(key).del(1);
		toast.success(`Delete record for ${name}`,{autoClose: 2000, hideProgressBar: true},)
	}
	return (
    <>
	    <h2 className='mx-auto w-50 text-3xl text-center font-bold my-12'>
				Results for {new Date(parseLocalDate(date)).toDateString()} 
				
				<span title='Copy Results to clipboard'>
					<CopyIcon className='cursor-pointer inline' onClick={e => copy('results')}/>
				</span>
				<span title='Copy Results to clipboard as Markdown'>
					<MdIcon className='cursor-pointer inline w-8' onClick={e => {copyToClipBoard(markdownResults(scoresNode)); 	toast.success('Copy Result table to Clipboard as Markdown',{autoClose: 2000, hideProgressBar: true})}} />
				</span>
			</h2>
			<Results data={scores} deleteItem={deleteItem} />
	  </>
	)
}
const RatingApp = (props:{id:string}) => {
	const {id} = props;
	const [userId, setUserId ] = useLocalStorage('meetingUserId2', v4());
  const node = aspot();
	const date = '1655091094684';
	webSocketConnector('wss://meetingappwebsocket.herokuapp.com/', id)(node);
	return (
		<AspotWrapper node={node as any} >
      <RatingAppInner userId={userId} id={id} date={date}/>
	  </AspotWrapper>
	)
}
export default RatingApp;