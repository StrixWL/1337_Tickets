import { Server } from 'socket.io';
import { getBookableBusSchedule, getScheduleData } from './tools.js'
import cookie from 'cookie';
import { isAuthorized } from './authentication.js'
import { SEATS_PER_BUS } from '../Config/constants.js';

const socketHandler = (server) => {
	const io = new Server(server);
	io.of('seatsData').on('connection', async (socket) => {
		if (socket.request.headers.cookie && await isAuthorized(cookie.parse(socket.request.headers.cookie).Authorization)) {
			const bookableBusSchedule = getBookableBusSchedule();
			const scheduleData = bookableBusSchedule ? await getScheduleData(bookableBusSchedule.time) : null;
			socket.emit('data', {
				data: {
					nextBus: bookableBusSchedule,
					availableSeats: bookableBusSchedule ? SEATS_PER_BUS - (scheduleData ? Object.keys(scheduleData).length : 0) : 0
				}
			});
		}
		else
			socket.disconnect();
	});
};

/* TODO: UPDATE CLIENT WHENEVER ANOTHER CLIENT BOOKS A SEAT */

export default socketHandler;