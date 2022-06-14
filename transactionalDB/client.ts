import io from "socket.io-client";

// Must be executed after DOM is ready (TODO: confirm?)
const socket = io({port: 3000});

export default socket;