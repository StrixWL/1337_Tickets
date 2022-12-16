import { Server } from 'socket.io';

const socketHandler = (server) => {
	const io = new Server(server);
	io.of('seatsData').on('connection', (socket) => {
		socket.emit('data', {
			data: "i can see you are connected"
		});
	});
	
	setInterval(() => { // update data
		io.of('seatsData').emit('data', {
			data: "i can see you are still connected"
		});
	}, 2000);
}

export default socketHandler;