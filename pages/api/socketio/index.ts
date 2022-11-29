/*
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "types/next";
import { Server as ServerIO } from "socket.io";

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!req.body.player) return;

  if (!res.socket.server.io) {
    
    const { player } = req.body;
    console.log('*First use, starting socket.io');
    const io = new ServerIO(res.socket.server);

    io.on('connection', socket => {
      console.log('Connected socket.io');
      
      socket.on("disconnecting", (reason) => {
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            socket.to(room).emit("player_disconected", player);
          }
        }
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default ioHandler;
*/



import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketio = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log(`New Socket.io server...`);
    // adapt Next's net Server to http Server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      cors: {
        origin: ["https://tic-tac-toe-mx.herokuapp.com", "https://tic-tac-toe-front-9lnq.vercel.app"],
        credentials: true,
      }
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }

  res.end();
};


export default socketio;
