import { io } from "socket.io-client";

let rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();
if (rawApiUrl.includes("VITE_API_URL=")) {
  rawApiUrl = rawApiUrl.split("VITE_API_URL=").pop().trim();
}
const SOCKET_URL = rawApiUrl ? rawApiUrl.replace('/api', '') : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true
});

export default socket;
