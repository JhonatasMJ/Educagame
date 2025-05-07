"use client"

import { useState, useEffect, useCallback } from "react"
import { getTrails } from "../services/apiService"
import { useAuth } from "../context/AuthContext"

export const useTrails = () => {
  // Estado para os dados das trilhas
  const [trails, setTrails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Novo estado para controlar se as trilhas já foram carregadas pelo menos uma vez
  const [hasLoadedTrails, setHasLoadedTrails] = useState(false)

  // Obter o token JWT do contexto de autenticação
  const { jwtToken, isTokenLoaded } = useAuth()

  // Implementar fetchTrails como useCallback para evitar recriações desnecessárias
  const fetchTrails = useCallback(async () => {
    console.log("Fetching trails...")

    console.log("Token JWT:", jwtToken)

    // Verificar se o token JWT está carregado
    if (!isTokenLoaded) {
      console.log("Token JWT ainda não foi carregado, aguardando...")
      return
    }

    setIsLoading(true)
    console.log("Requisição de trilhas iniciada com token válido")

    try {
      const data = await getTrails()
      console.log("Requisição de trilhas concluída", data)

      // Check if data exists and has the expected structure
      if (data && data.data) {
        // Make sure we're getting an array
        const trailsArray = Array.isArray(data.data) ? data.data : Object.values(data.data || {})
        console.log("Trilhas carregadas:", trailsArray.length)

        // Process the trails to ensure they have the expected structure
        const processedTrails = trailsArray
          .map((trail: any) => {
            // Skip invalid trails
            if (!trail || typeof trail !== "object") return null

            // Ensure etapas is an array
            let etapas = []
            try {
              if (trail.etapas) {
                if (Array.isArray(trail.etapas)) {
                  etapas = trail.etapas
                } else if (typeof trail.etapas === "object") {
                  etapas = Object.values(trail.etapas)
                }
              }
            } catch (err) {
              console.error("Erro ao processar etapas:", err)
              etapas = []
            }

            // Process each etapa to ensure stages is an array
            const processedEtapas = etapas.map((etapa: any) => {
              // Ensure etapa is an object
              if (!etapa || typeof etapa !== "object") {
                return {
                  id: `generated-${Math.random().toString(36).substr(2, 9)}`,
                  descricao: "Etapa sem descrição",
                  stages: [],
                }
              }

              let stages = []
              try {
                if (etapa.stages) {
                  if (Array.isArray(etapa.stages)) {
                    stages = etapa.stages
                  } else if (typeof etapa.stages === "object") {
                    stages = Object.values(etapa.stages)
                  }
                }
              } catch (err) {
                console.error("Erro ao processar stages:", err)
                stages = []
              }

              return {
                ...etapa,
                id: etapa.id || `etapa-${Math.random().toString(36).substr(2, 9)}`,
                descricao: etapa.descricao || "Sem descrição",
                stages: stages,
              }
            })

            return {
              ...trail,
              id: trail.id || `trail-${Math.random().toString(36).substr(2, 9)}`,
              nome: trail.nome || "Trilha sem nome",
              descricao: trail.descricao || "Sem descrição",
              etapas: processedEtapas.filter(Boolean), // Remove any null/undefined etapas
            }
          })
          .filter(Boolean) // Remove any null/undefined trails

        setTrails(processedTrails)
        setError(null)
      } else {
        setTrails([])
        setError("Formato de dados inválido ou nenhuma trilha disponível")
        console.log("Formato de dados inválido ou nenhuma trilha disponível")
      }
    } catch (err: any) {
      console.error("Erro ao buscar trilhas:", err)

      // Tratamento de erros mais específico
      if (err.message?.includes("401")) {
        setError("Sessão expirada. Por favor, faça login novamente.")
      } else if (err.message?.includes("Network")) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.")
      } else {
        setError(err.message || "Não foi possível carregar as trilhas. Tente novamente mais tarde.")
      }

      setTrails([])
    } finally {
      console.log("Encerrou a requisição de trilhas")
      setIsLoading(false)
      // Marcar que as trilhas foram carregadas pelo menos uma vez
      setHasLoadedTrails(true)
    }
  }, [jwtToken, isTokenLoaded])

  // Efeito para carregar as trilhas quando o token estiver disponível
  useEffect(() => {
    // Só tenta carregar as trilhas se o token estiver carregado (mesmo que seja null)
    if (isTokenLoaded) {
      fetchTrails()
    }
  }, [isTokenLoaded, fetchTrails])

  return {
    trails,
    isLoading,
    error,
    fetchTrails,
    hasLoadedTrails,
  }
}
