import { io } from 'socket.io-client';

// const socket = io('http://localhost:5000');
const socket = io('https://notes-app-backend-435q.onrender.com');

export default socket;