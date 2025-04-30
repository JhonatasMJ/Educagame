/**
 * Utility for logging synchronization events with timestamps
 * This will help us debug the synchronization process
 */

// Enable or disable detailed logging
const ENABLE_DETAILED_LOGGING = true

// Log levels
export enum LogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

// Log entry structure
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

// In-memory log storage
const logs: LogEntry[] = []

/**
 * Add a log entry
 */
export const logSync = (level: LogLevel, message: string, data?: any) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (data !== undefined) {
    entry.data = typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data
  }

  logs.push(entry)

  // Also log to console if detailed logging is enabled
  if (ENABLE_DETAILED_LOGGING) {
    const coloredLevel = getColoredLevel(level)
    console.log(`[SYNC ${coloredLevel}] ${message}`)
    if (data !== undefined) {
      if (level === LogLevel.DEBUG) {
        console.log("Data:", data)
      } else {
        console.log("Data:", typeof data === "object" ? JSON.stringify(data, null, 2) : data)
      }
    }
  }
}

/**
 * Get colored level for console output
 */
const getColoredLevel = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.INFO:
      return "\x1b[32mINFO\x1b[0m" // Green
    case LogLevel.WARNING:
      return "\x1b[33mWARNING\x1b[0m" // Yellow
    case LogLevel.ERROR:
      return "\x1b[31mERROR\x1b[0m" // Red
    case LogLevel.DEBUG:
      return "\x1b[36mDEBUG\x1b[0m" // Cyan
    default:
      return level
  }
}

/**
 * Get all logs
 */
export const getLogs = (): LogEntry[] => {
  return [...logs]
}

/**
 * Clear all logs
 */
export const clearLogs = (): void => {
  logs.length = 0
}

/**
 * Get logs as a formatted string
 */
export const getLogsAsString = (): string => {
  return logs
    .map(
      (log) =>
        `[${log.timestamp}] [${log.level}] ${log.message}${log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ""}`,
    )
    .join("\n\n")
}

/**
 * Save logs to AsyncStorage for later retrieval
 */
export const saveLogs = async (): Promise<void> => {
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default
    await AsyncStorage.setItem("sync_logs", JSON.stringify(logs))
  } catch (error) {
    console.error("Failed to save logs:", error)
  }
}

/**
 * Load logs from AsyncStorage
 */
export const loadLogs = async (): Promise<LogEntry[]> => {
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default
    const savedLogs = await AsyncStorage.getItem("sync_logs")
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs) as LogEntry[]
      logs.push(...parsedLogs)
      return parsedLogs
    }
  } catch (error) {
    console.error("Failed to load logs:", error)
  }
  return []
}
