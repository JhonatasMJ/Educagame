"use client"
import { useEffect } from "react"
import MainGame from "./MainGame"
import React from "react"

// This is the main entry point for all game types
export default function GameScreen() {
  // Adicione um log para depuração
  useEffect(() => {
    console.log("GameScreen caregado com sucesso")
  }, [])

  return <MainGame />
}
