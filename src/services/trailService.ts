import { getDatabase, ref, get } from "firebase/database"
import { logSync, LogLevel } from "./syncLogger"

/**
 * Obtém todas as trilhas disponíveis do Firebase
 */
export const getTrails = async () => {
  try {
    logSync(LogLevel.INFO, "Buscando trilhas disponíveis...")

    const db = getDatabase()
    const trailsRef = ref(db, "trilhas")
    const snapshot = await get(trailsRef)

    if (snapshot.exists()) {
      const trailsData = snapshot.val()

      // Converter objeto para array
      const trailsArray = Object.keys(trailsData).map((key) => ({
        id: key,
        ...trailsData[key],
      }))

      logSync(LogLevel.INFO, `Encontradas ${trailsArray.length} trilhas disponíveis`)

      return {
        status: 200,
        message: "Trilhas encontradas com sucesso",
        data: trailsArray,
      }
    } else {
      logSync(LogLevel.WARNING, "Nenhuma trilha encontrada")
      return {
        status: 404,
        message: "Nenhuma trilha encontrada",
        data: [],
      }
    }
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao buscar trilhas:", error)
    return {
      status: 500,
      message: "Erro ao buscar trilhas",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Obtém uma trilha específica pelo ID
 */
export const getTrailById = async (trailId: string) => {
  try {
    logSync(LogLevel.INFO, `Buscando trilha com ID: ${trailId}`)

    const db = getDatabase()
    const trailRef = ref(db, `trilhas/${trailId}`)
    const snapshot = await get(trailRef)

    if (snapshot.exists()) {
      const trailData = snapshot.val()

      logSync(LogLevel.INFO, `Trilha ${trailId} encontrada`)

      return {
        status: 200,
        message: "Trilha encontrada com sucesso",
        data: {
          id: trailId,
          ...trailData,
        },
      }
    } else {
      logSync(LogLevel.WARNING, `Trilha ${trailId} não encontrada`)
      return {
        status: 404,
        message: "Trilha não encontrada",
        data: null,
      }
    }
  } catch (error) {
    logSync(LogLevel.ERROR, `Erro ao buscar trilha ${trailId}:`, error)
    return {
      status: 500,
      message: "Erro ao buscar trilha",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
