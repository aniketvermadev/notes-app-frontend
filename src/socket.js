import { io } from 'socket.io-client';

const socket = io('https://notes-app-backend-435q.onrender.com');

export default socket;