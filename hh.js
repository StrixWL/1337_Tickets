import moment from 'moment';
import { busSchedules } from './Config/constants.js'

// console.log(moment().format("MM/DD/YYYY"));
// console.log(busSchedules);
let bookableBusSchedule;

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

if (busSchedules[0].delta <= 60 * 60)
	bookableBusSchedule = busSchedules[0];
else
	bookableBusSchedule = null;
console.log(bookableBusSchedule);