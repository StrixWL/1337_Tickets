import { getNewToken, getStudentData } from './fetchUserData.js'
import { isAuthorized } from './authentication.js'
import { v4 } from 'uuid';
import firebase from 'firebase';
import { verify as verifyCaptcha } from 'hcaptcha';
import { SECRET } from '../Config/constants.js';

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
}

const seatsData = async (req, res) => {
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
};

const book = async (req, res) => {
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
};

export default {
	auth,
	seatsData,
	book
};