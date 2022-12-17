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
};

const book = async (req, res) => {
	new Promise(async (resolve, reject) => {
		if (req.cookies && await isAuthorized(req.cookies.Authorization)) {
			if ((await verifyCaptcha(SECRET, req.body["h-captcha-response"])).success) {
				const schedule = getBookableBusSchedule();
				if (Object.keys((await getScheduleData(schedule.time))).length < SEATS_PER_BUS && schedule) {
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
				else
					reject("No available tickets.");
			}
			else
				reject("Invalid captcha solution.");
		}
		else
			reject("Unauthorized.");
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

export default {
	auth,
	book
};