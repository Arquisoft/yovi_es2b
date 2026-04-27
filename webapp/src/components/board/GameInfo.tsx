import type { GameSettings } from "../gameOptions/GameSettings";
import "./Board.css";
import { useLanguageContext } from "../../i18n/LanguageProvider";

interface Props {
  settings: GameSettings;
  currentPlayer: string;
  gameStatus: string;
  twoPlayers?: boolean;
  onlineMode?: boolean;
  localUsername?: string;
  localPlayerIndex?: number;
}

export default function GameInfo(props: Props) {
  const { t } = useLanguageContext();
  const playerColor = props.localPlayerIndex === 0 ? '#0c55c0' : '#b91c1c';

  return (
    <div className="game-info">
      <h2>{t("game.title")}</h2>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>{t("game.player")} </strong> {props.currentPlayer}</p>}
        {!props.twoPlayers && <p><strong>{t("game.opponent")} </strong> BOT</p>}
        {props.onlineMode && props.localUsername !== undefined && (
          <p><strong>{t("game.player")} </strong><span style={{ color: playerColor }}>{props.localUsername}</span></p>
        )}
      </div>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>{t("game.strategy")} </strong> {t(`game.${props.settings.strategy.toLowerCase()}`)}</p>}
        {!props.twoPlayers && <p><strong>{t("game.difficulty")} </strong> {t(`game.${props.settings.difficulty.toLowerCase()}`)}</p>}
        {props.twoPlayers && <p><strong>{t("game.boardsize")} </strong> {{ EASY: t("game.easy"), MEDIUM: t("game.medium"), HARD: t("game.hard") }[props.settings.difficulty]}</p>}
      </div>
      <div className="info-section">
        {!props.twoPlayers && <p><strong>{t("game.turn")} </strong> {props.currentPlayer}</p>}
        <p><strong>{t("game.status")} </strong> {props.gameStatus}</p>
      </div>
    </div>
  );
}