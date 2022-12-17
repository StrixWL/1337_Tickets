import { Server } from 'socket.io';
import { getBookableBusSchedule } from './tools.js'
import cookie from 'cookie';
import { isAuthorized } from './authentication.js'

const socketHandler = (server) => {
	const io = new Server(server);
	io.of('seatsData').on('connection', async (socket) => {
		if (socket.request.headers.cookie && await isAuthorized(cookie.parse(socket.request.headers.cookie).Authorization)) {
			socket.emit('data', {
				data: getBookableBusSchedule()
			});
		}
		else
			socket.disconnect();
	});
};

export default socketHandler;