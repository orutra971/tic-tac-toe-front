import { patch } from "database/axios";
import { NextApiRequest } from "next";
import { GameMovement, IGame, Status } from "types/app";
import { NextApiResponseServerIO } from "types/next";


const status = async (request: NextApiRequest, response: NextApiResponseServerIO) => { 
  response.setHeader('Content-type', 'application/json');  

  if (request.method !== "POST") return response.status(201).json({});
  if (!request.body.data) return response.status(201).json({});
  if (!request.body.status) return response.status(201).json({});
  if (!request.query || !request.query.id) return response.status(201).json({});

  // get message
  const status = request.body.status as Status;
  const data = request.body.data;
  const id = request.query.id;
  
  if (status === 'create_room') {
    console.log(`socketsJoin(${id})`);    
    
    response?.socket?.server?.io?.socketsLeave(id);
    response?.socket?.server?.io?.socketsJoin(id);

    response?.socket?.server?.io?.to(id).emit('player_joined_room', data); 

    
    // return message
    response.status(201).json({}); 
    return;
  }

  if (status === 'player_joined_room') {
    response?.socket?.server?.io?.to(id).emit(status, data);   
    // return message
    response.status(201).json({}); 
    return;
  }

  if (status === 'player_left_room') {
    response?.socket?.server?.io?.to(id).emit(status, data);   
    // return message
    response.status(201).json({}); 
    return;
  }

  if (status === 'game_movement') {
    const movemet = data as GameMovement;
    response?.socket?.server?.io?.to(id).emit(status, movemet);   
    // return message
    response.status(201).json({}); 
    return;
  }

  if (status === 'game_end') {
    const accessToken = request.headers["x-access-token"] as string;
    const game = data as IGame;

    await patch(`/games/${id}`, {state: game.state}, accessToken)
      .then(async () => {
        // const player_id = game.state === 1 ? game.player_x : game.player_o;
        // await patch(`/leaderboard`, {player_id}, accessToken)

        // dispatch to channel
        response?.socket?.server?.io?.emit(status, game); 
        // dispatch to room
        response?.socket?.server?.io?.to(id).emit(status, game);
        // return message

        response?.socket?.server?.io?.socketsLeave(id);  
        response.status(201).json({});
      })
      .catch(() => {
        game.state = 0;
        // dispatch to channel
        response?.socket?.server?.io?.emit(status, game); 
        // dispatch to room
        response?.socket?.server?.io?.to(id).emit(status, game);
        response.status(201).json({});
      });
    return;
  }

  // dispatch to room
  response?.socket?.server?.io?.to(id).emit(status, data);

  // return message
  response.status(201).json({});
};

export default status;