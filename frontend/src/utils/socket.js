import { io } from "socket.io-client";

let rawApiUrl = import.meta.env.VITE_API_URL;
if (rawApiUrl && rawApiUrl.startsWith('VITE_API_URL=')) {
  rawApiUrl = rawApiUrl.replace('VITE_API_URL=', '');
}
const SOCKET_URL = rawApiUrl ? rawApiUrl.replace('/api', '') : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true
});

export default socket;
