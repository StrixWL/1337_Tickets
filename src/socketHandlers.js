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
			socket.emit('data', {
				data: {
					nextBus: bookableBusSchedule,
					availableSeats: bookableBusSchedule ? SEATS_PER_BUS - Object.keys((await getScheduleData(bookableBusSchedule.time))).length : 0
				}
			});
		}
		else
			socket.disconnect();
	});
};

/* TODO: UPDATE CLIENT WHENEVER ANOTHER CLIENT BOOKS A SEAT */

export default socketHandler;