interface PasswordToggleButtonProps {
  showPassword: boolean;
  onToggle: () => void;
  className?: string;
}

export default function PasswordToggleButton({
  showPassword,
  onToggle,
  className = "password-field__toggle",
}: Readonly<PasswordToggleButtonProps>) {
  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      aria-pressed={showPassword}
    />
  );
}