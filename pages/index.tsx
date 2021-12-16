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

const Home: NextPage = () => {
  ReactGA.initialize('G-HK7G752SEB');
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
        <title>Rate {id ? id : 'this for me!'}!</title>
        <meta name="description" content={id ? `rate ${id}` : "A app that lets you quick request a group of people to rate something"} />
        { id ? <></> : <meta property="og:image" content="/ratingbaseball.png" /> }
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className="text-5xl text-center m-10">
          { id ? <>Rate <em>{id}</em> <ShareIcon  className="inline cursor-pointer" xlinkTitle="Copy share url to clipboard" onClick={copyUrl}/></> : <>Rate this for me!</> }
        </h1>
          <MeetingBody id={id || ''}/>
      </main>
      <ToastContainer />

      <footer className="text-center m-12"> 
        Created by <a href="https://www.e2thex.org/projects/ratethisforme/">e2thex</a>
      </footer>
    </div>
  )
}

export default Home
