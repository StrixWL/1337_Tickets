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

const app = express();
const server = http.createServer(app);
socketHandler(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/auth', handlers.auth);

app.get('/seatsData', handlers.seatsData)

app.post('/book', handlers.book);

app.get('/', (req, res) => {
	res.sendFile('/Users/med/Brahim/1337/index.html');
});

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
})
