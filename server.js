/* express & parsers */
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
/* server */
import http from 'http';
import { port } from './Config/constants.js'; // 80
/* handlers */
import socketHandler from './src/socketHandlers.js';
import handlers from './src/requestHandlers.js';
import cors from 'cors';
const app = express();
const server = http.createServer(app);
socketHandler(server); // socket on '/seatsData' (almost done)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({credentials: true, origin: '*'}));

app.post('/auth', handlers.auth); // Authenticate with 42 oauth2 or cookie (done)
app.post('/book', handlers.book); // Book a seat (done)
app.delete('/book', handlers.unbook); // Unbook a seat (done)
app.post('/report', handlers.report); // Report (done)

app.get('/', (req, res) => {
	res.sendFile('/Users/med/Brahim/1337/index.html'); // temporary to test sockets
});


server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

/* ALL THE DIRTY WORK PART OF THE PROJECT IS DONE, IMPLEMENTING NEW FEATURES FROM NOW ON WILL BE FASTER */