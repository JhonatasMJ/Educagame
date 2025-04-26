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
        const trailsArray = Array.isArray(data.data) ? data.data : Object.values(data.data)
        console.log("Trilhas carregadas:", trailsArray.length)

        // Process the trails to ensure they have the expected structure
        const processedTrails = trailsArray.map((trail: any) => {
          // Ensure etapas is an array
          const etapas = Array.isArray(trail.etapas) ? trail.etapas : Object.values(trail.etapas || {})

          // Process each etapa to ensure stages is an array
          const processedEtapas = etapas.map((etapa: any) => {
            const stages = Array.isArray(etapa.stages) ? etapa.stages : Object.values(etapa.stages || {})
            
            return {
              ...etapa,
              stages,
            }
          })
          
          return {
            ...trail,
            etapas: processedEtapas,
          }
        })

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
  }, [jwtToken, isTokenLoaded]);

  // Efeito para carregar as trilhas quando o token estiver disponível
  useEffect(() => {
    // Só tenta carregar as trilhas se o token estiver carregado (mesmo que seja null)
    if (isTokenLoaded) {
      fetchTrails();
    }
  }, [isTokenLoaded, fetchTrails]);

  return { 
    trails, 
    isLoading, 
    error, 
    fetchTrails,
    hasLoadedTrails 
  }
}