"use client"

import React, { useState, useEffect } from "react"
import { getTrails } from "../services/apiService"
import { useAuth } from "../context/AuthContext"

export const useTrails = () => {
  // Update the useState type to match the expected data structure
  const [trails, setTrails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { jwtToken } = useAuth()

  // Update the fetchTrails function to handle the API response format
  const fetchTrails = async () => {
    if (!jwtToken) {
      // Se não tiver token, não tenta buscar as trilhas
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await getTrails()

      // Check if data exists and has the expected structure
      if (data && data.data) {
        // Make sure we're getting an array
        const trailsArray = Array.isArray(data.data) ? data.data : Object.values(data.data)

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
        setError("Formato de dados inválido")
      }
    } catch (err: any) {
      console.error("Erro ao buscar trilhas:", err)
      setError(err.message || "Não foi possível carregar as trilhas. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrails()
  }, [jwtToken]) // Recarregar quando o token mudar

  return { trails, isLoading, error, refetch: () => fetchTrails() }
}
