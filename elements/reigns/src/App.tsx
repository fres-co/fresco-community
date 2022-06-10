import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { initializeGame } from "./features/game/gameSlice";
import { Loading } from "./constants";
import { useFresco } from "./useFresco";
import { AppState } from "./store";
import { useOnFrescoStateUpdate } from "./features/voting/useOnFrescoStateUpdate";
import { Game } from "./Game";

export default function App() {
  const loading = useSelector((state: AppState) => state.game.loading);

  const gameUrl = useSelector((state: AppState) => state.game.gameUrl);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!gameUrl) {
      return;
    }
    dispatch(initializeGame(gameUrl) as any);
  }, [gameUrl]);

  const onFrescoStateUpdate = useOnFrescoStateUpdate();

  const { sdkLoaded } = useFresco(onFrescoStateUpdate);

  if (!sdkLoaded || loading === Loading.InProgress) {
    return <div className='game-half first-half'><div className="death">Loading...</div></div>;
  }

  if (loading === Loading.Error) {
    return <div className='game-half first-half'><div className="death">ERROR :(</div></div>;
  }

  return <Game />;
}
