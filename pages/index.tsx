import React, { useEffect, useState } from 'react';
import {  signOut, useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import { Avatar, Card, Layout } from '@components';
import { styled } from '@stitches/react';
import { violet, blackA, mauve } from '@radix-ui/colors';
import * as Separator from '@radix-ui/react-separator';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'
import { del } from 'database/axios';
import { IGame, ILeaderboard, IPlayerDictionary, ISocketStatus, Status } from 'types/app';
import Dialog, { IAlertDialog } from 'components/Dialog';
import { io } from "socket.io-client";
import { ProgressIndeterminate } from './_app';

const Home = () => {
  const { data: session } = useSession();
  const { replace } = useRouter();
  // players active
  const [players, setPlayers] = useState<ILeaderboard[]>([]);
  // dictionary of players active
  const [playersDictionary, setPlayersDictionary] = useState<IPlayerDictionary>({});
  // match refused
  const [refused, setRefused] = useState<IGame[]>([]);
  // match waiting to accept
  const [lastGameRefused, setLastGameRefused] = useState<IGame>();
  // match waiting to accept
  const [accept, setAccept] = useState<IGame[]>([]);
  // top players
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);
  // active and pending games
  const [games, setGames] = useState<IGame[]>([]);
  // active and pending games
  const [receivedStatus, setReceivedStatus] = useState<ISocketStatus>();
  // dialog for status
  const [dialog, setDialog] = useState<IAlertDialog>({
    opened: false,
    title: "",
    description: "",
    accept: async () => {
      console.log("empty");
    },
    cancel: async () => {
      console.log("empty");
    }
  });

  useEffect(() => {
    if (!session.user || !session.user.id) return;
    const controller = new AbortController();
    const signal = controller.signal;

    fetch('/api/data', 
      {
        headers: {
          "x-access-token" : session.user.accessToken
        },
        signal
      })
      .then((response) => response.json())
      .then(({players, games, leaderboard, message}) => {
        if(message) {
          toast.error(message);
          return;
        }
        setPlayers(players);
        setGames(games);
        setLeaderboard(leaderboard);

        const hasActiveGame = games.find((e) => e.state === 0 && e.player_o === session.user.id|| e.player_x === session.user.id);

        if (hasActiveGame) {
          replace(`/game/${hasActiveGame._id}`);
          return;
        }
      })
      .catch(() => {
        // operation aborted
      });

      return () => {
        controller.abort();
      }
  }, [session.user]);

  useEffect(() => {
    setPlayersDictionary(players.reduce((acc, curr) => (acc[curr.player_id] = curr, acc), {}));
  }, [players])
  
  useEffect(() => { 
    const game = accept.find((e) => e.player_x === session.user.id || e.player_o === session.user.id);
    if (!game) return;
    const myData = playersDictionary[session.user.id];
    if (!myData) return;
    const opponentData = playersDictionary[game.player_x === session.user.id ? game.player_o : game.player_x];
    if (!opponentData) return;

    setDialog({
      opened: true,
      opponent: opponentData,
      title: 'Match found!',
      description: '',
      match: game,
      accept: async () => {
        await fetch(`/api/status/${game._id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'game_start' as Status, data: game})
        });
      },
      cancel: async () => {
        await fetch(`/api/status/${game._id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'start_game_denied' as Status, data: game})
        });
        
      },
    })
  }, [accept]);


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // connect to socket server
    const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
      path: "/api/socketio",
    });
      // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);   
      fetch('/api/status', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token" : session.user.accessToken,
        },
        signal,
        body: JSON.stringify({status: 'player_signin' as Status, data: {
          _id: "",
          image: session.user.image,
          username: session.user.name,
          player_id: session.user.id,
          score: 0,
        } as ILeaderboard}),
      })
      .catch(() => {
        // Abort
      });
    });
    
    // detect other users log in
    socket.on("player_signin", (data: ILeaderboard) => {
      console.log("player_signin");
      setReceivedStatus({id: 'player_signin', data: data});
    });

    // detect other users log out
    socket.on("player_signout", (data: ILeaderboard) => {
      console.log("player_signout");
      setReceivedStatus({id: 'player_signout', data: data});
    });
  
    // detect a game petition
    socket.on("start_game_petition", (data: IGame) => {
      console.log("start_game_petition");
      setReceivedStatus({id: 'start_game_petition', data: data});
    });

    // detect a game petition
    socket.on("start_game_denied", (data: IGame) => {
      console.log("start_game_denied");
      setReceivedStatus({id: 'start_game_denied', data: data});
    });

    // detect a game start
    socket.on("game_start", (data: IGame) => {
      console.log("game_start");
      setReceivedStatus({id: 'game_start', data: data});
    });

    // force automatic a game start
    socket.on("automatic_game_start", (data: IGame) => {
      console.log("automatic_game_start");
      setReceivedStatus({id: 'automatic_game_start', data: data});
    });

    socket.on("disconnect", (reason) => {
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
  }, []);

  useEffect(() => {
    if (!session.user || !session.user.id  || !playersDictionary || !playersDictionary[session.user.id]) return;
    if (!matchMaking(playersDictionary[session.user.id])) return;

    const interval = setTimeout(async () => {
      setRefused([]);
      if (lastGameRefused)  {
        const t = {...lastGameRefused} as IGame;
        setLastGameRefused(null);
        await fetch(`/api/status`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-access-token" : session.user.accessToken
          },
          body: JSON.stringify({status: 'automatic_game_start' as Status, data: t})
        });
        return;
      }   
      
    }, 10000);

    return () => {
      clearInterval(interval);
    }
  }, [playersDictionary, refused]);

  useEffect(() => {
    if (!receivedStatus) return;
    
    const option = {
      player_signin: async () => {
        const player = receivedStatus.data as ILeaderboard;
        if (player.player_id === session.user.id) return;
        const id = players.findIndex((e) => e.player_id === player.player_id);
        if (id === -1) {
          setPlayers([...players, player]);
          return;
        }
        const arr = [...players];
        arr[id] = player;
        setPlayers(arr);
        return;
      },
      player_signout: async () => {
        const player = receivedStatus.data as ILeaderboard;
        const id = players.findIndex((e) => e.player_id === player.player_id);
        if (id === -1) return;
        setPlayers(players.filter((e) => e.player_id !== player.player_id));
      },
      start_game_petition: async () => {
        const game = receivedStatus.data as IGame;

        if (!game._id) return;
        if (!playersDictionary) return;
        setAccept([...accept, game])
        
        if (playersDictionary[game.player_x]) {
          playersDictionary[game.player_x].pendingMatch = true;
          const i = players.findIndex((e) => e.player_id === game.player_x);
          if (i !== -1) players[i].pendingMatch = true;
        }
        if (playersDictionary[game.player_o]) {
          playersDictionary[game.player_o].pendingMatch = true;
          const i = players.findIndex((e) => e.player_id === game.player_o);
          if (i !== -1) players[i].pendingMatch = true;
        }
      },
      start_game_denied: async () => {
        const game = receivedStatus.data as IGame;

        setAccept(accept.filter((e) => e._id !== game._id));
        setRefused([...refused, game]);
        setGames(games.filter((e) => e._id !== game._id));

        if (!game._id) return;
        if (!playersDictionary) return;

        const myGame = game.player_x === session.user.id || game.player_o === session.user.id;
        if (!lastGameRefused && myGame) setLastGameRefused(lastGameRefused);

        if (playersDictionary[game.player_x]) {
          playersDictionary[game.player_x].pendingMatch = false;
          const i = players.findIndex((e) => e.player_id === game.player_x);
          if (i !== -1) players[i].pendingMatch = false;
        }
        if (playersDictionary[game.player_o]) {
          playersDictionary[game.player_o].pendingMatch = false;
          const i = players.findIndex((e) => e.player_id === game.player_o);
          if (i !== -1) players[i].pendingMatch = false;
        }
      },
      automatic_game_start: async () => {
        const game = receivedStatus.data as IGame;
        setAccept(accept.filter((e) => e._id !== game._id));
        if (!game._id) return;
        if (!playersDictionary) return;

        const myGame = game.player_x === session.user.id || game.player_o === session.user.id;

        setGames([...games, game]);
        if (myGame && game.state === 0) {
          replace(`/game/${game._id}`);
          return;
        } else if (myGame) {
          toast.error("The game could not be started");
        }
      },
      game_start: async () => {
        const game = receivedStatus.data as IGame;
        setAccept(accept.filter((e) => e._id !== game._id));
        if (!game._id) return;
        if (!playersDictionary) return;

        const myGame = game.player_x === session.user.id || game.player_o === session.user.id;

        setGames([...games, game]);
        if (myGame && game.state === 0) {
          setRefused([]);
          replace(`/game/${game._id}`);
          return;
        } else if (myGame) {
          toast.error("The game could not be started");
        }
      },
      game_end: async () => {
        const game = receivedStatus.data as IGame;
        if (!game._id) return;
        if (!playersDictionary) return;

        if (playersDictionary[game.player_x]) {
          if (game.state === 1) playersDictionary[game.player_x].score++;
          playersDictionary[game.player_x].pendingMatch = false;
          playersDictionary[game.player_x].playing = false;
          const i = players.findIndex((e) => e.player_id === game.player_x);
          if (i !== -1) {
            players[i].pendingMatch = false;
            players[i].playing = false;
            if (game.state === 1) players[i].score++;
          }
        }
        if (playersDictionary[game.player_o]) {
          if (game.state === 2) playersDictionary[game.player_o].score++;
          playersDictionary[game.player_o].pendingMatch = false;
          playersDictionary[game.player_o].playing = false;
          const i = players.findIndex((e) => e.player_id === game.player_o);
          if (i !== -1) {
            players[i].pendingMatch = false;
            players[i].playing = false;
            if (game.state === 2) players[i].score++;
          }
        }  
        setGames(games.filter((e) => e._id !== game._id));
      },
    };

    option[receivedStatus.id]();
  
  }, [receivedStatus])

 
  const isMatchPossible = (player: ILeaderboard) => playersDictionary && players && !playersDictionary[player.player_id].pendingMatch  && !playersDictionary[player.player_id].playing;
  const freePlayers = (player: ILeaderboard) => players.filter((e) => !e.playing && !e.pendingMatch && e.player_id !== player?.player_id);
  const mathWasRefused = (player: ILeaderboard) => refused.some((e) => e.player_x === player.player_id || e.player_o === player.player_id);
  
  const matchMaking = (player: ILeaderboard) =>{
    if (!isMatchPossible(player)) return false;
    const playersList = freePlayers(player);
    if (!playersList || playersList.length < 1) return false;
    if(playersList.length === 1 && mathWasRefused(playersList[0])) return true;
    const filteredPlayerList = playersList.filter((e) => !mathWasRefused(e) && e.player_id !== player.player_id );
    if(!filteredPlayerList || filteredPlayerList.length === 0) return true;
    const score = player.score;
    const closest = filteredPlayerList.reduce((prev, curr) => {
      return (Math.abs(curr.score - score) < Math.abs(prev.score - score) ? curr : prev)
    });
    if (!closest) return true;
    const gameData: IGame= {
      _id: "",
      player_x: player.player_id,
      name_x: player.username,
      image_x: player.image,
      player_o: closest.player_id,
      name_o: closest.username,
      image_o: closest.image,
      state: -1,
    };

    fetch('/api/status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token" : session.user.accessToken,
      },
      body: JSON.stringify({status: 'start_game_petition' as Status, data: gameData}),
    })
    return false;
  }
  const getStatus = (player: ILeaderboard) => {
    // playersDictionary[e.player_id]?.playing ? "Playing..." : playersDictionary[e.player_id]?.pendingMatch ? "Matching.." : 'Waiting...'}
    if (!playersDictionary) return "Loading data...";
    if (!playersDictionary[player.player_id]) return "Player data missing...";
    if (playersDictionary[player.player_id].pendingMatch) return "Matching...";
    if (playersDictionary[player.player_id].playing) return "Playing...";
    if (playersDictionary[player.player_id].disconected) return "Reconecting...";
    return "Waiting..."
  }

  const handleSignOut = () => {
    const player = {
      _id: "",
      image: session.user.image,
      player_id: session.user.id,
      username: session.user.name,
      score: 0,
      playing: false,
      pendingMatch: false,
    } as ILeaderboard;
    const _id = session.user.id;
   
    del(`/leaderboard/${_id}`, session.user.accessToken)
      .then(async () => {
        return fetch('/api/status', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({status: 'player_signout' as Status, data: player}),
        })
        .catch((error) => {
          console.log({...error.response});
        });
      })
      .then(() => {
        return signOut({redirect: false})
      })
  }

  if (!leaderboard) return <ProgressIndeterminate />

  return (
    <>
      <Layout user={session.user} signOut={handleSignOut}>
        <Dialog opened={dialog.opened} opponent={dialog.opponent} title={dialog.title} description={dialog.description} match={dialog.match} accept={dialog.accept} cancel={dialog.cancel} />
        <ToastContainer />
        <Flex>
          <Card flex={{"@bp1": "full", "@bp2": "leaderboard", "@bp3": "leaderboard"}} alignItems={{"@initial": "start"}}>
            <List>
              <ListTitle>Players</ListTitle>
              <ListTitle>Score</ListTitle>
              <SeparatorRoot css={{ margin: '15px 0' }} />
              
              {
                leaderboard && leaderboard.map((e, i) => (<React.Fragment key={`${i}-${e.username}`}><ListItem>{e.username}</ListItem><ListItem>{e.score}</ListItem></ React.Fragment>))
              }
            </List>
          </Card>
          <Card flex={{"@bp1": "full", "@bp2": "players", "@bp3": "players"}}>
            <ScrollAreaRoot>
              <PlayerListTitle title={'playerName'}>Players</PlayerListTitle>
              <PlayerListTitle title={'playerStatus'}>Status</PlayerListTitle>
              <ScrollAreaViewport>
                <List>
                  {
                    players && players.map((e, i) => (
                      <React.Fragment key={`${i}-${e.username}`}>
                        <PlayerListItem title={'playerName'}>
                          <Avatar src={e.image} username={e.username}/>
                        </PlayerListItem>
                        <PlayerListItem title={'playerStatus'}>
                          {getStatus(e)}
                        </PlayerListItem>
                      </ React.Fragment>
                    ))
                  }
                </List>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
              <ScrollAreaScrollbar orientation="horizontal">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
              <ScrollAreaCorner />
            </ScrollAreaRoot>
          </Card>
        </Flex>
      </Layout>
    </>
  )
}

const Flex = styled('div', { 
  display: 'flex',
  alignItems: 'start',
  flexWrap: 'wrap',
  width: '100%',
  padding: '16px',
  rowGap: '16px',
  columnGap: '16px',
});

const List = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  flexDirection: 'row',
  padding: '12px',
  margin: 0,
});


const ListTitle = styled('div', {
  flex: '50%',
  maxWidth: '250px',
  minWidth: '50px',
  color: violet.violet10,
  fontSize: 15,
  lineHeight: '20px',
});

const ListItem = styled('div', {
  flex: '50%',
  maxWidth: '250px',
  minWidth: '50px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '35px',
  color: 'black',
});

const PlayerListTitle = styled('div', {
  flex: '50%',
  minWidth: '55px',
  maxWidth: '1024px',
  color: violet.violet10,
  fontSize: 15,
  lineHeight: '20px',
  variants: {
    title: {
      playerName: {
        maxWidth: '80%',
      },
      playerStatus: {
        maxWidth: '20%',
      }
    }
  }
});

const PlayerListItem = styled('div', {
  flex: '50%',
  minWidth: '50px',
  maxWidth: '1024px',
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '35px',
  color: 'black',
  variants: {
    title: {
      playerName: {
        maxWidth: '80%',
      },
      playerStatus: {
        maxWidth: '20%',
        height: '100%',
        margin: 'auto',
      }
    }
  }
});


const SeparatorRoot = styled(Separator.Root, {
  width: '100%',
  backgroundColor: violet.violet6,
  '&[data-orientation=horizontal]': { height: 1, width: '100%' },
  '&[data-orientation=vertical]': { height: '100%', width: 1 },
});

const SCROLLBAR_SIZE = 10;

const ScrollAreaRoot = styled(ScrollArea.Root, {
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  flexDirection: 'row',
  padding: '12px',
  maxHeight: '600px',
  margin: 0,
  borderRadius: 6,
  overflow: 'hidden',
});

const ScrollAreaViewport = styled(ScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

const ScrollAreaScrollbar = styled(ScrollArea.Scrollbar, {
  display: 'flex',
  // ensures no selection
  userSelect: 'none',
  // disable browser handling of all panning and zooming gestures on touch devices
  touchAction: 'none',
  padding: 2,
  background: blackA.blackA6,
  transition: 'background 160ms ease-out',
  '&:hover': { background: blackA.blackA8 },
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: SCROLLBAR_SIZE,
  },
});

const ScrollAreaThumb = styled(ScrollArea.Thumb, {
  flex: 1,
  background: mauve.mauve10,
  borderRadius: SCROLLBAR_SIZE,
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: 44,
    minHeight: 44,
  },
});

const ScrollAreaCorner = styled(ScrollArea.Corner, {
  background: blackA.blackA8,
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

Home.auth = true;

export default Home;

