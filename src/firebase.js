import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyAiB9wKOMeWAXbN6CBIZq6pt2c8rOuymKw",
    authDomain: "fooddelivery-d9c7a.firebaseapp.com",
    databaseURL: "https://fooddelivery-d9c7a-default-rtdb.firebaseio.com",
    projectId: "fooddelivery-d9c7a",
    storageBucket: "fooddelivery-d9c7a.appspot.com",
    messagingSenderId: "46228344043",
    appId: "1:46228344043:web:a3a3d8d5fbd6762b7782ae",
    measurementId: "G-Q7MG5YQBPS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const functions = getFunctions(app);  // Initialize functions

const requestForToken = async () => {
    try {
        const currentToken = await getToken(messaging, { vapidKey: 'BNHTM8VddjWUeTw6hYvF9EP1yd0LmvsQ3kOg2BZPp0459wE3rdpxP-0nhe1OsksEVRY5Sn1ZVrtJlccJiD1NGYk' });
        if (currentToken) {
            console.log('Current token for client: ', currentToken);
            // Send the token to your server and update the UI if necessary
            // ...
        } else {
            console.warn('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
    }
};

onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // Customize notification here
    alert(payload.notification.title + ": " + payload.notification.body);
});

export { app, auth, database, db, messaging, requestForToken , functions};
