<script>
	import { FirebaseApp } from "sveltefire";
	import firebase from "firebase/app";
	import "firebase/firestore";
	import "firebase/analytics";
	import Router from 'svelte-spa-router'
	import routes from './Routes.js';

	let firebaseConfig = {
		apiKey: "AIzaSyC23eIPugbqaL9095lwpFFYIgl5ewqa8oM",
		authDomain: "belote-bc0ba.firebaseapp.com",
		databaseURL: "https://belote-bc0ba.firebaseio.com",
		projectId: "belote-bc0ba",
		storageBucket: "belote-bc0ba.appspot.com",
		messagingSenderId: "369210581637",
		appId: "1:369210581637:web:134d5a9b205ed4ea2c7fec",
		measurementId: "G-B77B7N9NV2"
	};
	firebase.initializeApp(firebaseConfig);
	firebase.analytics();

	let titleInCorner = false;
	const routeEvent = (event) => {
		titleInCorner = event.detail.titleInCorner;
	};
</script>

<FirebaseApp {firebase}>
	<h1 id="app-name" class:titleInCorner><a href="/">Belote</a></h1>
	<Router {routes} on:routeEvent={routeEvent}/>
</FirebaseApp>
