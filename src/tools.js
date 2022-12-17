import { busSchedules } from '../Config/constants.js';
import moment from 'moment';
import firebase from 'firebase';

const database = firebase.database();

const getScheduleData = async (schedule) => {
	let res;
	const scheduleDB = database.ref(`Schedules/${schedule}`);
	await scheduleDB.get().then(snapshot => {
		res = snapshot.val();
	});
	return res;
}

const getBookableBusSchedule = () => {
	busSchedules.forEach(busSchedule => {
		let hours = parseInt(busSchedule.time.split(':')[0]);
		let minutes = parseInt(busSchedule.time.split(':')[1]);
		let currentHours = parseInt(moment().format("HH"));
		let currentMinutes = parseInt(moment().format("mm"));
		let currentSeconds = parseInt(moment().format("ss"));
		if (JSON.stringify(busSchedule).includes('PM'))
			hours += 12;
		let delta = (hours * 60 + minutes) * 60 - ((currentHours * 60 + currentMinutes) * 60 + currentSeconds);
		if (delta >= 0)
			busSchedule.delta = delta;
	})
	busSchedules.sort((a, b) => a.delta - b.delta);
	return busSchedules[0].delta <= 60 * 60 ? busSchedules[0] : null;
};

export {
	getBookableBusSchedule,
	getScheduleData
};