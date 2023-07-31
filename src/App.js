import React, {useRef, useState} from 'react';
import './App.css';
import image from './google-logo.png'

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
  measurementId: process.env.REACT_MEASUREMENT_ID
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌸 💬 Let's Chat! 💬 🌸</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in"onClick={signInWithGoogle}><img src={image} alt='Google Logo'/>Sign in with Google</button>
      <div className="center">
        Do not violate the community guidelines or you will be banned for life!</div>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className= "sign-out"onClick={() => auth.signOut()}>SIGN OUT</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={dummy}></div>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue|| formValue.replace(/^\s+/, '').replace(/\s+$/, '') === ''}>✉️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL,createdAt } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const datestamp = new Date(createdAt*1000).toDateString().substring(0,10)
  const timestamp = new Date(createdAt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  const datetime = datestamp + " " + timestamp
 console.log(datestamp)

  return (<>
  <div className="center">
    <p className="timestamp">{datetime}</p>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairBob&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light'} alt="User" />
      <p>{text}
      </p>
    </div>
    </div>
  </>)
}

export default App;
