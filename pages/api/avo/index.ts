import { IncomingMessage, ServerResponse } from "http";
import Database from "../../../database/db";

const allAvos = async (request: IncomingMessage, response: ServerResponse) => {
  const db = new Database();
  const allEntries = await db.getAll();
  const length = allEntries.length;
  response.statusCode = 200; // ok
  response.setHeader('Content-type', 'application/json');
  response.end(JSON.stringify({ data: allEntries, length: length}));
}

export default allAvos;