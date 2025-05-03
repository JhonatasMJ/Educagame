/**
 * Configurações globais do aplicativo
 * Este arquivo contém variáveis de configuração que controlam o comportamento do app
 */

// Controla qual fluxo de login/cadastro será utilizado
// true = fluxo simplificado (apenas nome e avatar)
// false = fluxo tradicional completo
export const USE_SIMPLIFIED_ONBOARDING = true

// Configurações do cadastro simplificado
export const SIMPLIFIED_ONBOARDING_CONFIG = {
  // Número mínimo de caracteres para o nome
  MIN_NAME_LENGTH: 3,

  // Domínio para emails gerados automaticamente
  AUTO_EMAIL_DOMAIN: "educagame.temp",

  // Valores padrão para campos não preenchidos
  DEFAULT_VALUES: {
    phone: "",
    birthDate: "",
    lgpdAccepted: true,
    termsAccepted: true,
  },
}
