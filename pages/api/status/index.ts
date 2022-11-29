import { post } from "database/axios";
import { NextApiRequest } from "next";
import { IGame, Status } from "types/app";
import { NextApiResponseServerIO } from "types/next";

type Range = {
  min: number;
  max: number;
}

const ranges: Range[] = [
  {min: 1, max: 500},
  {min: 1000, max: 1500},
  {min: 2000, max: 2500},
];

const getRandomNumber = ({min, max}: Range): number => Math.floor(Math.random() * (max - min + 1)) + min;

const getTimeToSleep = (): number => {
  const id = getRandomNumber({min: 0, max: ranges?.length - 1});
  return getRandomNumber({min: ranges[id].min, max: ranges[id].max})
} 

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const status = async (request: NextApiRequest, response: NextApiResponseServerIO) => { 
  response.setHeader('Content-type', 'application/json');

  if (request.method !== "POST") return response.status(201).json({});
  if (!request.body.data) return response.status(201).json({});
  if (!request.body.status) return response.status(201).json({});

  // get message
  const status = request.body.status as Status;
  const data = request.body.data;

  if (status === 'start_game_petition' || status === 'automatic_game_start') {
    const accessToken = request.headers["x-access-token"] as string;
    const game = data as IGame;
    
    await sleep(getTimeToSleep())
      .then(async () => {
        return await post('/games', {player_x: game.player_x, player_o: game.player_o}, accessToken)
      })
      .then((res) => {
        game._id = res.data._id;
        game.state = 0;
        // dispatch to channel
        response?.socket?.server?.io?.emit(status, game);    
        // return message
        response.status(201).json({});
        
      })
      .catch(() => {
        // console.log({error: error})
        // dispatch to channel
        response?.socket?.server?.io?.emit(status, game);    
        // return message
        response.status(201).json({});
      });
    return;
  }

  // dispatch to channel
  response?.socket?.server?.io?.emit(status, data);

  // return message
  response.status(201).json({});
};

export default status;