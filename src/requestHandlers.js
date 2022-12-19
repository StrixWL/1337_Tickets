import { getNewToken, getStudentData } from './fetchUserData.js'
import { isAuthorized } from './authentication.js'
import { v4 } from 'uuid';
import firebase from 'firebase';
import { verify as verifyCaptcha } from 'hcaptcha';
import { SECRET, SEATS_PER_BUS } from '../Config/constants.js';
import { getBookableBusSchedule, getScheduleData } from './tools.js'
import moment from 'moment';

const database = firebase.database();

const auth =  async (req, res) => {
	let studentData, Authorization;
	console.log(req.body.code);
	if (req.cookies.Authorization)
		Authorization = await isAuthorized(req.cookies.Authorization);
	if (!studentData && !Authorization) {
		if (studentData = await getStudentData(await getNewToken(req.body.code))) {
			console.log(studentData);
			Authorization = {
				authorized: true,
				Authorization: v4(),
				data: {
					login: studentData.login,
					fullName: studentData.usual_full_name,//
					email: studentData.email,
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
	if (Authorization) {
		res.json(Authorization);
	}
	else
		res.status(401).json({
			authorized: false
		});
};

const book = async (req, res) => {
	new Promise(async (resolve, reject) => {
		if (req.cookies && await isAuthorized(req.cookies.Authorization)) {
			if ((await verifyCaptcha(SECRET, req.body["h-captcha-response"])).success) {
				const schedule = getBookableBusSchedule();
				const scheduleData = schedule ? await getScheduleData(schedule.time) : null;
				const takenSeats = scheduleData ? Object.keys(scheduleData).length : 0;
				if (schedule && takenSeats < SEATS_PER_BUS) {
					const userDB = database.ref(`Authorizations/${req.cookies.Authorization}`);
					await userDB.get().then(async snapshot => {
						const userData = snapshot.val().data;
						const scheduleDB = database.ref(`Schedules/${schedule.time}/${userData.fullName}`);
						await scheduleDB.set({
							bookedOn: moment().format('MMMM Do YYYY, h:mm:ss a')
						});
						resolve();
					});
				}
				else {
					res.status(405);
					reject("No available tickets.");
				}
			}
			else {
				res.status(400);
				reject("Invalid captcha solution.");
			}
		}
		else {
			res.status(401);
			reject("Unauthorized.");
		}
	})
		.then(() =>
			res.json({
				success: true
			})
		).catch(reason => res.json({
			success: false,
			reason
		}));
};

const unbook = async (req, res) => {
	new Promise(async (resolve, reject) => {
		if (req.cookies && await isAuthorized(req.cookies.Authorization)) {
			const schedule = getBookableBusSchedule();
			if (schedule) {
				const userDB = database.ref(`Authorizations/${req.cookies.Authorization}`);
				await userDB.get().then(async snapshot => {
					const userData = snapshot.val().data;
					const scheduleDB = database.ref(`Schedules/${schedule.time}/${userData.fullName}`);
					await scheduleDB.set(null);
					resolve();
				});
			}
			else {
				res.status(405);
				reject("Can't do that right now.");
			}
		}
		else {
			res.status(401);
			reject("Unauthorized.");
		}
	})
		.then(() =>
			res.json({
				success: true
			})
		).catch(reason => res.json({
			success: false,
			reason
		}));
}

export default {
	auth,
	book,
	unbook
};