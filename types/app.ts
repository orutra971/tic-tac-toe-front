export type Status = "player_signin" | "player_signout" | 'start_game_petition' | 'turn_selection' | 'start_game_denied' | 'game_start' | 'game_movement' | 'game_end' | 'create_room' | 'player_joined_room' | 'player_left_room';

export interface ILeaderboard {
  _id: string;
  image: string;
  player_id: string;
  username?: string;
  score: number;
  pendingMatch?: boolean;
  playing?: boolean;
  disconected?: boolean;
}

export interface IGame {
  _id: string;
  player_x: string;
  name_x?: string;
  image_x?: string;
  player_o: string;
  name_o?: string;
  image_o?: string;
  state: number;
}

export interface IUser {
  _id: string;
  username: string;
  image: string;
}

export interface IPlayerDictionary {
  [id: string]: ILeaderboard;
}

export interface ISocketStatus {
  id: Status, data: IGame | ILeaderboard | GameMovement | string;
}

/// Game

export type CordinatesX = 'x1' | 'x2' | 'x3';

export type CordinatesY = 'y1' | 'y2' | 'y3';

export type CellId = `${CordinatesX}_${CordinatesY}`

export type Turn = 'player_x' | 'player_o';

export type CellSelected = 'not_cell_selected' | `${Turn}_cell_selected`;

export type BoardSelection = {
  [K in CellId] : CellSelected;
}
export type Transform ={
  [K in CellId] : () => CellId;
}

export type GameMovement = {
  player_id: string;
  cell: CellId;
  movement: Exclude<CellSelected, 'not_cell_selected'>,
}