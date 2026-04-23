import { io } from "socket.io-client";

let rawApiUrl = import.meta.env.VITE_API_URL;
if (rawApiUrl && rawApiUrl.startsWith('VITE_API_URL=')) {
  rawApiUrl = rawApiUrl.replace('VITE_API_URL=', '');
}
const SOCKET_URL = rawApiUrl ? rawApiUrl.replace('/api', '') : "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
