import { useLanguageContext } from "../../i18n/LanguageProvider";
interface ControlPanelProps {
  readonly onExit: () => void;
  readonly onUndo: () => void;
  readonly twoPlayers: boolean;
  readonly onlineMode?: boolean;
}
export default function ControlPanel({ onExit, onUndo, twoPlayers, onlineMode = false }: ControlPanelProps) {
  const { t } = useLanguageContext();

  return (
    <div className="controls">
      {twoPlayers && !onlineMode && <button id="undo-button" onClick={onUndo}>{t("game.undo")}</button>}
      <button id="exit-button" onClick={onExit}>{t("game.exit")}</button>
    </div>
  );
}