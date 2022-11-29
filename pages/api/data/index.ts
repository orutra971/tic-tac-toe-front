import console from "console";
import { get } from "database/axios";
import { NextApiRequest, NextApiResponse } from "next";
import { IGame, ILeaderboard, IUser } from "types/app";

const all = async (request: NextApiRequest, response: NextApiResponse) => {
  const accessToken = request.headers["x-access-token"] as string;

  if (!accessToken) {
    response.statusCode = 200;
    response.setHeader('Content-type', 'application/json');
    response.end(JSON.stringify({message: 'Failed getting the data'}));
    return;
  }

  const leaderboardResponse = await get('/leaderboard', accessToken);
  const usersResponse = await fetch('/users', {headers:  {"x-access-token": accessToken}}).then((res) => res.json());
  const gamesResponse = await get('/games', accessToken);


  console.log({usersResponse});

  if (!leaderboardResponse.data || !usersResponse.data || !gamesResponse.data) {
    response.statusCode = 200;
    response.setHeader('Content-type', 'application/json');
    response.end(JSON.stringify({message: 'Failed getting the data'}));
    return;
  }

  const _users = usersResponse.data as IUser[];
  const _games = gamesResponse.data as IGame[];

  const filledLeaderboard: ILeaderboard[] = leaderboardResponse.data.map((e: ILeaderboard) => {
    let t: ILeaderboard = {...e, playing: false, pendingMatch: false};
    const user = _users.find ? _users.find((v: IUser) => v._id === e.player_id) : undefined;
    const game = _games.find ? _games.find((v: IGame) => v.player_x === e.player_id || v.player_o === e.player_id) : undefined;
    if (user) t =  {...t, username: user.username, image: user.image};
    if (game) t =  {...t, playing: game.state === 0, pendingMatch: game.state === -1};
    return t;
  })

  
  const leaderboard = [...filledLeaderboard].sort((a, b) => (a.score > b.score ? -1 : 1)).filter((_e, id) => id < 10);

  response.statusCode = 200;
  response.setHeader('Content-type', 'application/json');
  response.end(JSON.stringify({players: filledLeaderboard, games: _games, leaderboard}));
}

export default all;