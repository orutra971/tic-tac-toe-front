import { get } from "database/axios";
import { NextApiRequest, NextApiResponse } from "next";


const all = async (request: NextApiRequest, response: NextApiResponse) => {  
  const accessToken = request.headers["x-access-token"] as string;
  await get('/games', accessToken)
    .then(async (res) => {
      response.statusCode = 200;
      response.setHeader('Content-type', 'application/json');
      response.end(JSON.stringify({data: res.data}));
    })
    .catch(() => {
      response.statusCode = 500;
      response.setHeader('Content-type', 'application/json');
      response.end(JSON.stringify({message: 'Fail getting the games'}));
    });
}

export default all;