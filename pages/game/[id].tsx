import React, { useEffect, useState } from 'react';
import {  signOut, useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import { Avatar, Card, Layout } from '@components';
import { styled } from '@stitches/react';
import { violet, whiteA, gray, red, yellow } from '@radix-ui/colors';
import { io } from "socket.io-client";
import { ILeaderboard, IGame, GameMovement, Status, ISocketStatus, BoardSelection, CellId, CellSelected, Transform, Turn } from 'types/app';
import { Cross1Icon, CircleIcon } from '@radix-ui/react-icons'
import Dialog, { IAlertDialog } from 'components/Dialog';
import { ProgressIndeterminate } from 'pages/_app';
import { del } from 'database/axios';


const Gameplay = () => {
  const { data: session } = useSession();
  const { query, replace } = useRouter()
  // active game
  const [game, setGame] = useState<IGame>();
  // block board when when ends
  const [gameFinish, isGameFinish] = useState<boolean>(false);
  // game status
  const [receivedStatus, setReceivedStatus] = useState<ISocketStatus>();
  // player turn
  const [turn, setTurn] = useState<Turn>('player_x');
  // my turn player_x or player_o
  const [myTurn, setMyTurn] = useState<Turn>();
  // my data for vicory dialog
  const [myData, setMyData] = useState<ILeaderboard>();
  // my opponed data for vicory dialog
  const [myOpponentData, setMyOpponentData] = useState<ILeaderboard>();
  // boeard status for the game and css style 
  const [boardState, setBoardState] = useState<BoardSelection>({
    x1_y1: 'not_cell_selected',
    x1_y2: 'not_cell_selected',
    x1_y3: 'not_cell_selected',
    x2_y1: 'not_cell_selected',
    x2_y2: 'not_cell_selected',
    x2_y3: 'not_cell_selected',
    x3_y1: 'not_cell_selected',
    x3_y2: 'not_cell_selected',
    x3_y3: 'not_cell_selected',
  })
  // dialog for vicotry alert
  const [victoryDialog, setVictoryDialog] = useState<IAlertDialog>({
    opened: false,
    time: 5000,
    isMatchVictory: true,
    title: "",
    description: "",
    accept: async () => {
      // Sin acciones
    },
    cancel: async () => {
      // Sin acciones
    }
  });

  useEffect(() => {
    if (!query.id) {
      replace('/');
      return;
    }
  }, []);

  useEffect(() => {
    if (!session.user || !session.user.id) return;
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(`/api/games/${query.id}`, 
      {
        headers: {
          "x-access-token" : session.user.accessToken
        },
        signal
      })
      .then((response) => response.json())
      .then(({data, message}: {data: any, message: string}) => {
        if (message) {
          replace('/');
          return;
        }

        setGame(data);
        setMyTurn((prev) => {
          const myGame = data.player_x === session.user.id || data.player_o === session.user.id;
          if (!myGame) {
            replace('/');
            return;
          }
          const myTurn = data.player_x === session.user.id ? 'player_x' : 'player_o';
          if (myTurn === 'player_x') {
            setMyData({
              _id: '',
              player_id: data.player_x,
              username: data.name_x,
              image: data.image_x,
              score: 0,
              disconected: false,
            });
            setMyOpponentData({
              _id: '',
              player_id: data.player_o,
              username: data.name_o,
              image: data.image_o,
              score: 0,
              disconected: false,
            });
          } else {
            setMyOpponentData({
              _id: '',
              player_id: data.player_x,
              username: data.name_x,
              image: data.image_x,
              score: 0,
              disconected: false,
            });
            setMyData({
              _id: '',
              player_id: data.player_o,
              username: data.name_o,
              image: data.image_o,
              score: 0,
              disconected: false,
            });
          }

          return myTurn;
        });
      })
      .catch(() => {
        // operation aborted
      });

      return () => {
        controller.abort();
      }

    
  }, [session.user]);

  
  useEffect(() => {
    if (!session.user || !session.user.id) return;
    if (!game || !game._id) return 
    if (game.state !== 0) {
      replace("/");
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    // connect to socket server
    const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
      path: `/api/socketio`,
      
    },);

    // log socket connection
    socket.on("connect", () => {
      // creating the room      
      fetch(`/api/status/room/${game._id}`, 
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token" : session.user.accessToken
        },
        body: JSON.stringify({status: 'create_room' as Status, data: session.user.id}),
        signal,
      })
      .catch(() => {
        // operation aborted
      });
      
    });
    
    // player join room
    socket.on('subscribe', (room) => {
      // creating the room
      fetch(`/api/status/room/${game._id}`, 
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token" : session.user.accessToken
        },
        body: JSON.stringify({status: 'player_joined_room' as Status, data: session.user.id}),
        signal,
      })
      .catch(() => {
        // operation aborted
      });
    });

    // player left room
    socket.on('unsubscribe', (room) => {
      // creating the room
      fetch(`/api/status/room/${game._id}`, 
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token" : session.user.accessToken
        },
        body: JSON.stringify({status: 'player_left_room' as Status, data: session.user.id}),
        signal,
      })
      .catch(() => {
        // operation aborted
      });
    });

    // log socket player_joined
    socket.on("game_movement", (data: GameMovement) => {
      console.log("game_movement");
      setReceivedStatus({id: 'game_movement', data: data});
    });

    // log socket game_end
    socket.on("game_end", (data: IGame) => {
      console.log("game_end");
      setReceivedStatus({id: 'game_end', data: data});
    });

    // log socket player_joined_room
    socket.on("player_joined_room", (data: string) => {
      console.log("player_joined_room");
      setReceivedStatus({id: 'player_joined_room', data: data});
    });

    // log socket player_left_room
    socket.on("player_left_room", (data: string) => {
      console.log("player_left_room");
      setReceivedStatus({id: 'player_left_room', data: data});
    });

    // detect other players log out
    socket.on("player_signout", (data: ILeaderboard) => {
      console.log("player_signout");
      setReceivedStatus({id: 'player_signout', data: data});
    });

    socket.on("disconnect", (reason) => {
      console.log("disconnect");
      fetch(`/api/status/room/${game._id}`, 
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token" : session.user.accessToken
        },
        body: JSON.stringify({status: 'player_left_room' as Status, data: session.user.id}),
        signal,
      })
      .catch(() => {
        // operation aborted
      });
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
      // else the socket will automatically try to reconnect
    });
    // socket disconnet onUnmount if exists
    if (socket) return () => {
      controller.abort();
      socket.disconnect();
    }
  }, [game]);

  useEffect(() => {
    if (!receivedStatus) return;
    
    const option = {
      player_joined_room: async () => {
        const player = receivedStatus.data as string;
        if (myData.player_id === player) return;
        myOpponentData.disconected = false;
      },
      player_left_room: async () => {
        const player = receivedStatus.data as string;
        if (myData.player_id === player) return;
        myOpponentData.disconected = true;
      },
      game_movement: async () => {
        const movement = receivedStatus.data as GameMovement;
        if (movement.player_id === session.user.id) return;
        transformCellReceivedFromOpponent(movement.cell);
      },
      game_end: async () => {
        const game = receivedStatus.data as IGame;
        if (game.state === 0) return;
        replace('/');
      },
      player_signout: async () => {
        const player = receivedStatus.data as ILeaderboard;
        if (player.player_id === myData._id) return;

        setVictoryDialog((prevDialog) => ({
          ...prevDialog,
          opened: true,
          title: 'Victory :) (Opponent disconnected)',
          match: game,
          description: "Winner",
          opponent: myOpponentData,
          accept: async () => {
           fetch(`/api/status/room/${game._id}`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "x-access-token" : session.user.accessToken
            },
            body: JSON.stringify({status: 'game_end' as Status, data: {
              ...game,
              state: myTurn === 'player_x' ? 1 : 2,
            } as IGame}),
           })
           .then(() => {
            replace('/');
           });
          }
        }));


      },
    };

    option[receivedStatus.id]();
  
  }, [receivedStatus])



  const handleSignOut = () => {   
    del(`/leaderboard/${myData.player_id}`, session.user.accessToken)
      .then(async() => {
        // sending signOut to room
        await fetch(`/api/status/room/${game._id}`, 
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "x-access-token" : session.user.accessToken
            },

          })
          .catch(() => {
            // operation aborted
          });
        // sending signOut to all
        await fetch('/api/status', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'player_signout' as Status, data: myData}),
        });
        return;
      })
      .then(() => {
        return signOut({redirect: false})
      })
  }

  const getPlayerStatus = (player: ILeaderboard) => {
    if (player.disconected === undefined) return 'Connecting...';
    if (player.disconected) return 'Reconnecting...';
    return 'Connected';
  }

  const shouldSendGameEndDialog = (prev: Turn, state: CellSelected) => {
    if (state !== 'not_cell_selected') {
      setVictoryDialog((prevDialog) => ({
        ...prevDialog,
        opened: true,
        title: prev === myTurn ? 'Victory :)' : 'Defeat :(',
        match: game,
        description: "Winner",
        opponent: prev === myTurn ? myData : myOpponentData,
        accept: async () => {
         fetch(`/api/status/room/${game._id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'game_end' as Status, data: {
            ...game,
            state: prev === 'player_x' ? 1 : 2,
          } as IGame}),
         })
         .then(() => {
          replace('/');
         });
        }
      }));
      return;
    }

    if (allCellsSelected()) {
      setVictoryDialog((prevDialog) => ({
        ...prevDialog,
        opened: true,
        title: 'Draw :S',
        match: game,
        opponent: myData,
        accept: async () => {

         fetch(`/api/status/room/${game._id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'game_end' as Status, data: {
            ...game,
            state: 3,
          } as IGame}),
         })
         .then(() => {
          replace('/');
         });
        }
      }));
      return;
    }
  }

  const sendMyMovement = (cell: CellId, movement: CellSelected) => {
    
    fetch(`/api/status/room/${game._id}`, 
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "x-access-token" : session.user.accessToken
      },
      body: JSON.stringify({status: 'game_movement' as Status, data: {player_id: session.user.id, cell, movement} as GameMovement}),
    })
    .catch(() => {
      // operation aborted
    });
  }

  const selectCell = (cell: CellId, cellRecieved?: CellId) => {
    if (gameFinish) return;
    if (!cellRecieved &&  turn !== myTurn) return;
    if (boardState[cell] !== "not_cell_selected") return;

    setTurn((prev) => {
      boardState[cell] = `${prev}_cell_selected`;
      sendMyMovement(cell, boardState[cell]);
      shouldSendGameEndDialog(prev, checkVictory());

      if (prev === 'player_x') return 'player_o';
      return 'player_x';
    });
  }

  const transformCellReceivedFromOpponent = (cell: CellId) => {
    const tramsform: Transform = {
      'x1_y1': () => 'x3_y3',
      'x1_y2': () => 'x3_y2',
      'x1_y3': () => 'x3_y1',
      'x2_y1': () => 'x2_y3',
      'x2_y2': () => 'x2_y2',
      'x2_y3': () => 'x2_y1',
      'x3_y1': () => 'x1_y3',
      'x3_y2': () => 'x1_y2',
      'x3_y3': () => 'x1_y1',
    }
    const movement = tramsform[cell]();
    selectCell(movement, movement);
  }

  const checkVictory = (): CellSelected => {
    // Checking for draw


    /**
     * Checking victory in
     * 
     *     ⟍   |   ⟋
     *       ⟍ | ⟋
     *    --- ----  ---
     *       ⟋ | ⟍
     *     ⟋   |   ⟍
     */
    if (boardState.x2_y2 !== 'not_cell_selected' && cellsAreSelectedAndEqual(boardState.x1_y1, boardState.x2_y2, boardState.x3_y3)
      || cellsAreSelectedAndEqual(boardState.x1_y3, boardState.x2_y2, boardState.x3_y1)
      || cellsAreSelectedAndEqual(boardState.x1_y2, boardState.x2_y2, boardState.x3_y2)
      || cellsAreSelectedAndEqual(boardState.x2_y1, boardState.x2_y2, boardState.x2_y3))
          return boardState.x2_y2;

    /**
     * Checking victory in
     * 
     *    --- ---- ----
     *    |
     *    |
     *    |
     *    |
     *    |
     */
    if (boardState.x1_y1 !== 'not_cell_selected' && cellsAreSelectedAndEqual(boardState.x1_y1, boardState.x1_y2, boardState.x1_y3)
      || cellsAreSelectedAndEqual(boardState.x1_y1, boardState.x2_y1, boardState.x3_y1))
          return boardState.x1_y1;

    /**
     * Checking victory in
     * 
     *                |
     *                |
     *                |
     *                |
     *                |
     *    --- ----  ---
     */
    if (boardState.x3_y3 !== 'not_cell_selected' && cellsAreSelectedAndEqual(boardState.x3_y3, boardState.x2_y3, boardState.x1_y3)
      || cellsAreSelectedAndEqual(boardState.x3_y3, boardState.x3_y2, boardState.x3_y1))
          return boardState.x3_y3;

    return 'not_cell_selected';
  }

  const allCellsSelected = () => Object.values(boardState).every((e) => e !== 'not_cell_selected') ;
  
  const cellsAreSelected = (cellA: CellSelected, cellB: CellSelected, cellC: CellSelected) => cellA !== "not_cell_selected" && cellB !== "not_cell_selected" && cellC !== "not_cell_selected" ;
  
  const cellsAreEqual = (cellA: CellSelected, cellB: CellSelected, cellC: CellSelected) => new Set([cellA, cellB, cellC]).size === 1;

  const cellsAreSelectedAndEqual = (cellA: CellSelected, cellB: CellSelected, cellC: CellSelected) => cellsAreSelected(cellA, cellB, cellC) && cellsAreEqual(cellA, cellB, cellC);

  const checkCellStyle = (cell: CellSelected): Turn | CellSelected => {
    return cell === 'not_cell_selected' && turn === myTurn ? turn : cell
  }

  if (!game || !myData || !myOpponentData) return <ProgressIndeterminate />

  return (
    <>
      <Layout user={session.user} signOut={handleSignOut}>
        <Dialog opened={victoryDialog.opened} opponent={victoryDialog.opponent} title={victoryDialog.title} time={victoryDialog.time} isMatchVictory={victoryDialog.isMatchVictory} description={victoryDialog.description} match={victoryDialog.match} accept={victoryDialog.accept} cancel={victoryDialog.cancel} />
        <Flex>
          <Card flex={{"@bp1": "opponent", "@bp2": "opponent", "@bp3": "opponent"}} justifyContent={{"@initial": "center"}}>
            <List>
              {
                myTurn === 'player_x' ?
                  <PlayerTurn variant={'player_o'}>
                    <CircleIcon color='white' strokeWidth={'20px'} />
                  </PlayerTurn>
                  :
                  <PlayerTurn variant={'player_x'}>
                    <Cross1Icon color='white' strokeWidth={'20px'} />
                  </PlayerTurn>
              }
              <PlayerListItem title={'player'}>
                <Avatar src={myOpponentData.image} variant={"player"}/>
                <div>{myOpponentData.username}</div>
                <div>{getPlayerStatus(myOpponentData)}</div>
              </PlayerListItem>
            </List>
          </Card>
          <Card flex={{"@bp1": "board", "@bp2": "board", "@bp3": "board"}}>
            <List>
              <Board>
                <Cell variant={checkCellStyle(boardState.x1_y1)} onClick={() => selectCell('x1_y1')}/>
                <Cell variant={checkCellStyle(boardState.x1_y2)} onClick={() => selectCell('x1_y2')}/>
                <Cell variant={checkCellStyle(boardState.x1_y3)} onClick={() => selectCell('x1_y3')}/>
                <Cell variant={checkCellStyle(boardState.x2_y1)} onClick={() => selectCell('x2_y1')}/>
                <Cell variant={checkCellStyle(boardState.x2_y2)} onClick={() => selectCell('x2_y2')}/>
                <Cell variant={checkCellStyle(boardState.x2_y3)} onClick={() => selectCell('x2_y3')}/>
                <Cell variant={checkCellStyle(boardState.x3_y1)} onClick={() => selectCell('x3_y1')}/>
                <Cell variant={checkCellStyle(boardState.x3_y2)} onClick={() => selectCell('x3_y2')}/>
                <Cell variant={checkCellStyle(boardState.x3_y3)} onClick={() => selectCell('x3_y3')}/>
              </Board>
            </List>
          </Card>
          <Card flex={{"@bp1": "player", "@bp2": "player", "@bp3": "player"}}>
            <List>
              {
                myTurn === 'player_x' ?
                  <PlayerTurn variant={'player_x'}>
                    <Cross1Icon color='white' strokeWidth={'20px'} />
                  </PlayerTurn>
                  :
                  <PlayerTurn variant={'player_o'}>
                    <CircleIcon color='white' strokeWidth={'20px'} />
                  </PlayerTurn>
              }
              <PlayerListItem title={'player'}>
                <Avatar src={myData.image} variant={"player"}/>
                <div>{myData.username}</div>
                
                <div>{getPlayerStatus(myData)}</div>
              </PlayerListItem>
            </List>
          </Card>
        </Flex>
      </Layout>
    </>
  )
}

const Flex = styled('div', { 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: 'calc(100% - 65px)',
  padding: '16px',
  columnGap: '16px',
});

const List = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  padding: '12px',
});

const PlayerListItem = styled('div', {
  flex: '50%',
  minWidth: '50px',
  maxWidth: '1024px',
  textAlign: 'center',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '35px',
  color: 'black',
  variants: {
    title: {
      player: {
        maxWidth: 100,
      },
    }
  }
});

const PlayerTurn = styled('div', {
  backgroundColor: whiteA.whiteA10,
  width: 31,
  height: 31,
  padding: '8px',
  margin: 'auto',
  borderRadius: 5,
  variants: {
    variant: {
      player_x: {
        backgroundColor: red.red10,
      },
      player_o: {
        backgroundColor: yellow.yellow10,
      },
    }
  }
});

const Board = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '34vh',
  height: '34vh',
  minWidth: 60,
  minHeight: 60,
  maxWidth: 450,
  maxHeight: 450,
  rowGap: '2px',
  columnGap: '4px',
});


const Cell = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  background: violet.violet9,
  width: '32%',
  height: '32%',
  minWidth: 20,
  minHeight: 20,
  margin: 0,
  borderRadius: '5px',
  padding: '10px',
  variants: {
    variant: {
      not_cell_selected: {
        userSelect: 'none',
      },
      player_x_cell_selected: {
        backgroundColor: red.red10,
        content: `url("data:image/svg+xml,%3Csvg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z' fill='${whiteA.whiteA12}' fill-rule='evenodd' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E%0A")`,
        userSelect: 'none',
      },
      player_o_cell_selected: {
        backgroundColor: yellow.yellow10,
        content: `url("data:image/svg+xml,%3Csvg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z' fill='${whiteA.whiteA12}' fill-rule='evenodd' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
        userSelect: 'none',
      },
      player_x: {
        '&:hover': { 
          backgroundColor: gray.gray10,
          cursor: 'pointer',
          content: `url("data:image/svg+xml,%3Csvg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z' fill='${gray.gray8}' fill-rule='evenodd' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E%0A")`,
        },
        userSelect: 'none',
      },
      player_o: {
        '&:hover': { 
          backgroundColor: gray.gray10,
          cursor: 'pointer',
          content: `url("data:image/svg+xml,%3Csvg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z' fill='${gray.gray8}' fill-rule='evenodd' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
        },
        userSelect: 'none',
      },
    }
  }
});



export async function getServerSideProps(context) {
  return {
    props: {
      session: await unstable_getServerSession(
        context.req,
        context.res,
        authOptions
      ),
    },
  }
}

Gameplay.auth = true // For testing, to avoid redirect to signIn

export default Gameplay;

