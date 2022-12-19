import firebase from 'firebase';

/* auth */
export const CLIENT_ID = "u-s4t2ud-b8392d8b5b09f5657d42f07a056f9c85d68c1f941659276cf87972b7ee2b1467";
export const CLIENT_SECRET = "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";
export const REDIRECT_URI = "http://localhost:2000/";
export const firebaseConfig = {
	apiKey: "AIzaSyDdlafikBwxDnOLDxBTd38qjrzpQ2km6HY",
	authDomain: "project-7080878404266037565.firebaseapp.com",
	databaseURL: "https://project-7080878404266037565-default-rtdb.firebaseio.com",
	projectId: "project-7080878404266037565",
	storageBucket: "project-7080878404266037565.appspot.com",
	messagingSenderId: "93657078395",
	appId: "1:93657078395:web:b97bb0059b7b6f9354e0de",
	measurementId: "G-F0T26X8JNT"
};
if (!firebase.apps.length)
	firebase.initializeApp(firebaseConfig);

/* configs */
export const port = 80;
export const ALLOWED_CAMPUS = 16; // khouribga
export const SEATS_PER_BUS = 20;
export const busSchedules = [
	{
		destination: "Martil",
		time: "3:05 AM"
	},
	{
		destination: "Tetouan",
		time: "10:10 AM"
	},
	{
		destination: "Berkan",
		time: "06:40 PM"
	}
];

/* captcha */
export const SITE_KEY = "7220b247-0334-4f36-89bc-b53a683bc488";
export const SECRET = "0xe780255930eDb519d160d0d7ee78c922E96eB6d8";
