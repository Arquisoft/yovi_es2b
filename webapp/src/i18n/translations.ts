export type SupportedLocale = "es" | "en";

export const translations: Record<SupportedLocale, Record<string, any>> = {
  es: {
    common: {
      language: "Idioma",
      spanish: "Español",
      english: "English",
    },
    initial: {
      welcome: "Bienvenido de nuevo, inicia sesión aquí",
      subtitle: "Escriba su usuario y contraseña para iniciar sesión.",
      usernameLabel: "Usuario",
      passwordLabel: "Contraseña",
      loginButton: "Iniciar sesión",
      loadingButton: "Cargando usuario...",
      signupPrompt: "¿No tienes usuario? Haz click aquí para crear uno.",
      signupButton: "Regístrate",
      logoAlt: "Logo YOVI",
      errorUsername: "Escriba el usuario.",
      errorPassword: "Escriba la contraseña.",
      serverError: "Error del servidor.",
      networkError: "Error de red.",
    },
  },
  en: {
    common: {
      language: "Language",
      spanish: "Español",
      english: "English",
    },
    initial: {
      welcome: "Welcome back, sign in here",
      subtitle: "Enter your username and password to sign in.",
      usernameLabel: "Username",
      passwordLabel: "Password",
      loginButton: "Sign in",
      loadingButton: "Loading user...",
      signupPrompt: "Don't have a user? Click here to create one.",
      signupButton: "Sign up",
      logoAlt: "YOVI logo",
      errorUsername: "Enter your username.",
      errorPassword: "Enter your password.",
      serverError: "Server error.",
      networkError: "Network error.",
    },
  },
};
