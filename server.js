import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const app = express();
import { getNewToken, getStudentData } from './src/fetchUserData.js'
import { v4 } from 'uuid';
import { verify as verifyCaptcha } from 'hcaptcha';
import { SITE_KEY, SECRET } from './Config/constants.js';
import { port, firebaseConfig } from './Config/constants.js';

import firebase from 'firebase';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const test = () => false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const isAuthorized = async (Authorization) => await new Promise (async resolve => {
	if (!Authorization) 
		return resolve(null);
	const userdb = database.ref(`Authorizations/${Authorization}`);
	await userdb.get().then(snapshot => {
		const val = snapshot.val();
		if (val && val.authorized)
			resolve(val);
	});
	resolve(null);
})

app.post('/auth', async (req, res) => {
	let studentData, Authorization;
	if (req.cookies.Authorization) {
		/* check if cookie authorization key is valid */
		const userdb = database.ref(`Authorizations/${req.cookies.Authorization}`);
		await userdb.get().then(snapshot => {
			const val = snapshot.val();
			if (val && val.authorized)
				Authorization = val;
		});
	}
	if (!studentData && !Authorization) {
		/* fetch user data, null if invalid input */
		studentData = await getStudentData(await getNewToken(req.body.code));
		if (studentData) {
			Authorization = {
				authorized: true,
				Authorization: v4(),
				data: {
					login: studentData.login,
					fullName: studentData.usual_full_name,
					campuses: studentData.campuses,
					isStaff: studentData["staff?"]
				}
			}
			res.cookie("Authorization", Authorization.Authorization);
			/* set new authorization key in db and send back to client */
			const userDB = database.ref(`Authorizations/${Authorization.Authorization}`);
			delete Authorization.Authorization;
			await userDB.set(Authorization);
		}
	}
	res.json(Authorization ? Authorization : {
		authorized: false
	});
});


/* still working on this stuff bellow */
app.get('/availableSeats', async (req, res) => {
	const userData = await isAuthorized(req.cookies.Authorization);
	if (userData) {
		res.json({
			success: true
		})
	}
	else
		res.json({
			success: false,
			reason: "Unauthorized."
		})
})

app.post('/book', async (req, res) => {
	if (await isAuthorized(req.cookies.Authorization)) {
		if ((await verifyCaptcha(SECRET, req.body["h-captcha-response"])).success) {
			res.json({
				success: true
			});
		}
		else {
			res.json({
				success: false,
				reason: "Invalid captcha solution."
			});
		}
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
