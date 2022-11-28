import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "types/next";


const room = async (request: NextApiRequest, response: NextApiResponseServerIO) => { 
  response.setHeader('Content-type', 'application/json');

  // dispatch to channel
  response?.socket?.server?.io?.emit("Empty", "");

  // return message
  response.status(201).json({});
};

export default room;