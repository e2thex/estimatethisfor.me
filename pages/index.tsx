import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router';
import React, {  } from 'react';
import 'rc-slider/assets/index.css';
import copyToClipBoard from 'copy-to-clipboard';
import Rating from '../components/Rating';
import Selector from '../components/Selector';
import { NextPage } from 'next';
import ShareIcon from '../components/ShareIcon';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactGA from 'react-ga4';
import DateSelector from '../components/DateSelector';

const Home: NextPage = () => {
  ReactGA.initialize('G-Z0HYBDVSH4');
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  ReactGA.send('pageview');
  const copyUrl = () => {
    copyToClipBoard(window.location.href)
    toast.success('Copy url to clipboard',{autoClose: 2000, hideProgressBar: true})
  }
  const MeetingBody = id ? Rating : Selector
    return (
    <div className="container max-w-2xl mx-auto">
      <Head>
        <title>Estimate {id ? id : 'this for me!'}!</title>
        <meta name="description" content={id ? `rate ${id}` : "A app that lets you quick request a group of people to do a BOAT estimate of something"} />
        { id ? <></> : <meta property="og:image" content="/ratingbaseball.png" /> }
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className="text-5xl text-center m-10">
          { id ? <>Estimate <em>{id}</em> <ShareIcon  className="inline cursor-pointer" xlinkTitle="Copy share url to clipboard" onClick={copyUrl}/></> : <>Estimate this for me!</> }
        </h1>
        <div className="text-xs text-center mb-5 italic">For more instruction see the <a className="underline" href="https://e2thex.org/projects/estimatethisforme">Estimate this for me Project page</a>.  For more info on the BOAT Estimate process see the essay <a className="underline" href="https://e2thex.org/forkthesystem/boatestimate/">BOAT Estimate</a>.</div>
          <MeetingBody id={id || ''}/>
      </main>
      <ToastContainer />

      <footer className="text-center m-12"> 
        Created by <a className="underline" href="https://www.e2thex.org/projects/ratethisforme/">e2thex</a>
      </footer>
    </div>
  )
}

export default Home
