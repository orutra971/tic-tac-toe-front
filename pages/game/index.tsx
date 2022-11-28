import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';


const Game = () => {
  const { query, replace } = useRouter()

  useEffect(() => {
    if (!query.id) {
      replace('/');
      return;
    }
  }, []);

  return (
    <>
    </>
  )
}


Game.auth = true // For testing, to avoid redirect to signIn

export default Game;

