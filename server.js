/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */
/* CODE STILL NOT ORGANIZED YET */

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const app = express();
import http from 'http';
import { port } from './Config/constants.js';
const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);
import { getNewToken, getStudentData } from './src/fetchUserData.js'
import { isAuthorized } from './src/authentication.js'
import { v4 } from 'uuid';
import { verify as verifyCaptcha } from 'hcaptcha';
import { SECRET } from './Config/constants.js';
import firebase from 'firebase';
const database = firebase.database();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/auth', async (req, res) => {
	let studentData, Authorization;
	if (req.cookies.Authorization)
		Authorization = await isAuthorized(req.cookies.Authorization);
	if (!studentData && !Authorization) {
		if (studentData = await getStudentData(await getNewToken(req.body.code))) {
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
			const userDB = database.ref(`Authorizations/${Authorization.Authorization}`);
			delete Authorization.Authorization;
			await userDB.set(Authorization);
		}
	}
	res.json(Authorization ? Authorization : {
		authorized: false
	});
});

app.get('/seatsData', async (req, res) => {
	const userData = await isAuthorized(req.cookies.Authorization);
	if (userData) {
		res.json({
			success: true
		});
	}
	else
		res.json({
			success: false,
			reason: "Unauthorized."
		});
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

app.get('/', (req, res) => {
	res.sendFile('/Users/med/Brahim/1337/index.html');
});

io.of('seatsData').on('connection', (socket) => {
	console.log("user connected");
	socket.emit('data', {
		data: "i can see you are connected"
	});
});

setInterval(() => {
	io.of('seatsData').emit('data', {
		data: "i can see you are still connected"
	});
}, 2000);

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
})
