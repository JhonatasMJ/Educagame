import AsyncStorage from "@react-native-async-storage/async-storage"

// Configuração base da API
const API_BASE_URL = "http://localhost:3000/api"

// Interface para o token de autenticação
interface AuthToken {
  token: string
  expiresAt: number // timestamp de expiração
}

// Função para obter o token JWT armazenado
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const tokenData = await AsyncStorage.getItem("auth_token")
    if (!tokenData) return null

    const { token, expiresAt } = JSON.parse(tokenData) as AuthToken

    // Verificar se o token expirou
    if (Date.now() > expiresAt) {
      await AsyncStorage.removeItem("auth_token")
      return null
    }

    return token
  } catch (error) {
    console.error("Erro ao obter token de autenticação:", error)
    return null
  }
}

// Função para salvar o token JWT
export const saveAuthToken = async (token: string, expiresIn = 86400): Promise<void> => {
  try {
    const expiresAt = Date.now() + expiresIn * 1000 // Converter segundos para milissegundos
    await AsyncStorage.setItem("auth_token", JSON.stringify({ token, expiresAt }))
  } catch (error) {
    console.error("Erro ao salvar token de autenticação:", error)
  }
}

// Função para remover o token JWT
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("auth_token")
  } catch (error) {
    console.error("Erro ao remover token de autenticação:", error)
  }
}

// Função para fazer login na API e obter token JWT
export const loginApi = async (email: string, password: string): Promise<{ token: string; user: any } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Falha na autenticação")
    }

    const data = await response.json()

    // Salvar o token
    if (data.token) {
      await saveAuthToken(data.token)
    }

    return data
  } catch (error) {
    console.error("Erro ao fazer login na API:", error)
    return null
  }
}

// Função para fazer requisições autenticadas
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    const token = await getAuthToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      // Se o token expirou (401), podemos tentar renovar o token aqui
      if (response.status === 401) {
        await removeAuthToken()
        // Aqui poderíamos implementar uma lógica para renovar o token
      }

      const errorData = await response.json()
      throw new Error(errorData.message || `Erro ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro na requisição:", error)
    throw error
  }
} // Funções específicas para interagir com endpoints da API

// Obter todas as trilhas
export const getTrails = async (): Promise<any> => {
  return fetchWithAuth("/trails")
}

// Obter progresso do usuário
export const getUserProgress = async (userId: string): Promise<any> => {
  return fetchWithAuth(`/trails/users/${userId}/progress/`)
}

// Atualizar progresso do usuário
export const updateUserProgress = async (userId: string, trailId: string, progressData: any): Promise<any> => {
  return fetchWithAuth(`/trails/users/${userId}/trails/${trailId}`, {
    method: "PUT",
    body: JSON.stringify(progressData),
  })
}

// Corrigir a URL da rota de iniciar fase (remover o duplo slash)
export const startPhase = async (userId: string, trailId: string, phaseId: string): Promise<any> => {
  return fetchWithAuth(`/trails/users/${userId}/trails/${trailId}/phases/${phaseId}/start`, {
    method: "POST",
  })
}

// Corrigir a função answerQuestion para enviar o corpo da requisição corretamente
export const answerQuestion = async (
  userId: string,
  trailId: string,
  phaseId: string,
  questionId: string,
  isCorrect: boolean,
): Promise<any> => {
  return fetchWithAuth(`/trails/users/${userId}/trails/${trailId}/phases/${phaseId}/questions/${questionId}/answer`, {
    method: "POST",
    body: JSON.stringify({ correct: isCorrect }),
  })
}

// Corrigir a função completePhase para enviar o corpo da requisição corretamente
export const completePhase = async (
  userId: string,
  trailId: string,
  phaseId: string,
  timeSpent: number,
): Promise<any> => {
  return fetchWithAuth(`/trails/users/${userId}/trails/${trailId}/phases/${phaseId}/complete`, {
    method: "POST",
    body: JSON.stringify({ timeSpent }),
  })
}
