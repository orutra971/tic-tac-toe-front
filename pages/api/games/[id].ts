import { get } from "database/axios";
import { NextApiRequest, NextApiResponse } from "next";
import { IUser } from "types/app";


const game = async (request: NextApiRequest, response: NextApiResponse) => {  
  const accessToken = request.headers["x-access-token"] as string;  
  const id = request.query.id;

  const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/users`, {headers:  {"x-access-token": accessToken}}).then((res) => res.json());

  if (!accessToken || !id || !usersResponse) {
    response.statusCode = 200;
    response.setHeader('Content-type', 'application/json');
    response.end(JSON.stringify({message: 'Fail getting the games'}));
    return;
  }



  await get(`/games/${id}`, accessToken)
    .then(async (res) => {
      let t = {...res.data};
      const dataPlayerX = (usersResponse as IUser[]).find((e) => e._id === t.player_x);
      const dataPlayerO = (usersResponse as IUser[]).find((e) => e._id === t.player_o);
      if (dataPlayerX) t = {...t, name_x: dataPlayerX.username, image_x: dataPlayerX.image};
      if (dataPlayerO) t = {...t, name_o: dataPlayerO.username, image_o: dataPlayerO.image};
      // console.log({t, dataPlayerX, dataPlayerO});
      
      response.statusCode = 200;
      response.setHeader('Content-type', 'application/json');
      response.end(JSON.stringify({data: t}));
    })
    .catch((err) => {
      console.log({gameData: {...err.response}});
      response.statusCode = 200;
      response.setHeader('Content-type', 'application/json');
      response.end(JSON.stringify({message: 'Fail getting the games'}));
    });
}

export default game;