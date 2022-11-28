import { del, get } from "database/axios";
import { NextApiRequest } from "next";
import { Status } from "types/app";
import { NextApiResponseServerIO } from "types/next";

const status = async (request: NextApiRequest, response: NextApiResponseServerIO) => {
  // get message
  const status = request.body.status as Status;
  const data = request.body.data;
  
  if (request.method === "POST") {
    if (!status) {

      response.status(201).json({});
      return;
    }

    if (status === 'game_start') {
      console.log("game_start")
      const accessToken = request.headers["x-access-token"] as string;
      const { id } = request.query;
      const game = {...data};

      await get(`/games/${id}`, accessToken)
        .then(() => {
          game.state = 0;
          // dispatch to channel
          response?.socket?.server?.io?.emit(status, game);      
          // return message
          response.status(201).json({});
        })
        .catch((err) => {
          console.log("_game_start_denied", {...err.response})
          // dispatch to channel
          response?.socket?.server?.io?.emit(status, game);
          response.status(201).json({});
        })
      return;
    }


    if (status === 'start_game_denied') {
      console.log("_start_game_denied")
      const accessToken = request.headers["x-access-token"] as string;
      const { id } = request.query;
      const game = {...data};

      await del(`/games/${id}`, accessToken)
        .then(() => {
          game.state = -2;
          console.log("start_game_denied", game.state)
          // dispatch to channel
          response?.socket?.server?.io?.emit(status, game);
          // return message
          response.status(201).json({});
        })
        .catch(() => {
          console.log("start_game_denied", game.state)
          // dispatch to channel
          response?.socket?.server?.io?.emit(status, game);    
          // return message
          response.status(201).json({});
        })
      return;
    }
    // dispatch to channel
    response?.socket?.server?.io?.emit(status, status);

    // return message
    response.status(201).json({});
    return
  }

  // dispatch to channel
  response?.socket?.server?.io?.emit(status, status);

  // return message
  response.status(201).json({});
};

export default status;