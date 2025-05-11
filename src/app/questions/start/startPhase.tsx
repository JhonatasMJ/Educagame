"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Text, View, SafeAreaView, Image, ScrollView, Animated, Dimensions, StatusBar, Platform } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { Video, ResizeMode } from "expo-av"
import YoutubeIframe from "react-native-youtube-iframe"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Info,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react-native"
import ArrowBack from "@/src/components/ArrowBack"
import { MOBILE_WIDTH } from "@/PlataformWrapper"

interface StartPhaseProps {
  title?: string
  subTitle?: string
  description?: string
  image?: string
  video?: string
  additionalFeature?: React.ReactNode
  nextStep?: string
}

// Helper function to extract Vimeo ID from URL
const extractVimeoId = (url: string): string | null => {
  const regex = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to add or update parameters in a URL
const updateUrlParameters = (url: string, params: Record<string, string | number | boolean>): string => {
  const urlObj = new URL(url)
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, String(value))
  })
  return urlObj.toString()
}

// Declare Vimeo Player type
declare global {
  interface Window {
    Vimeo?: {
      Player: any
    }
  }
}

const StartPhase = ({
  title: propTitle,
  subTitle,
  description: propDescription,
  image: propImage,
  video: propVideo,
  additionalFeature,
}: StartPhaseProps) => {
  const params = useLocalSearchParams()
  const videoRef = useRef<Video>(null)
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [vimeoPlayer, setVimeoPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false)
  const [isVimeoVideo, setIsVimeoVideo] = useState(false)
  const [youtubeId, setYoutubeId] = useState<string | null>(null)
  const [vimeoId, setVimeoId] = useState<string | null>(null)
  const [vimeoFullUrl, setVimeoFullUrl] = useState<string | null>(null)
  const [showCustomControls, setShowCustomControls] = useState(false)
  const router = useRouter()

  // Use props or params
  const title = propTitle || (params.title as string)
  const description = propDescription || (params.description as string)
  const phaseId = params.phaseId as string
  const trailId = params.trailId as string
  const stageId = params.stageId as string
  const image = propImage || (params.image as string)
  const video = propVideo || (params.video as string)
  const tempo_estimado = params.tempo_estimado as string
  const youtubePlayerRef = useRef<any>(null);

  // Add tips parameter handling
  const tips_str = params.tips as string
  const [tips, setTips] = useState<{ title: string; content: string } | null>(null)

  // Parse pontos_chave from JSON string
  const pontos_chave_str = params.pontos_chave as string
  const [keyPoints, setKeyPoints] = useState<string[]>([])

  useEffect(() => {
    if (pontos_chave_str) {
      try {
        const parsedPoints = JSON.parse(pontos_chave_str)
        if (Array.isArray(parsedPoints) && parsedPoints.length > 0) {
          setKeyPoints(parsedPoints)
        }
      } catch (error) {
        console.error("Error parsing pontos_chave:", error)
      }
    }
  }, [pontos_chave_str])

  // Parse tips from JSON string
  useEffect(() => {
    if (tips_str) {
      try {
        const parsedTips = JSON.parse(tips_str)
        if (parsedTips && typeof parsedTips === "object") {
          setTips(parsedTips)
        }
      } catch (error) {
        console.error("Error parsing tips:", error)
      }
    }
  }, [tips_str])

  // Determine video type
  useEffect(() => {
    if (video) {
      if (video.includes("youtube.com") || video.includes("youtu.be")) {
        setIsYoutubeVideo(true)
        setIsVimeoVideo(false)

        // Extract YouTube ID
        let id = null
        if (video.includes("v=")) {
          id = video.split("v=")[1]?.split("&")[0] || ""
        } else if (video.includes("youtu.be/")) {
          id = video.split("youtu.be/")[1]?.split("?")[0] || ""
        }
        setYoutubeId(id)
      } else if (video.includes("vimeo.com")) {
        setIsYoutubeVideo(false)
        setIsVimeoVideo(true)
        setShowCustomControls(true)

        // Extract the ID for fallback purposes
        const id = extractVimeoId(video)
        setVimeoId(id)

        // For Vimeo, modify the URL to simplify the player interface
        if (video) {
          // Add parameters to simplify the player interface
          const simplifiedUrl = updateUrlParameters(video, {
            autoplay: 1,
            muted: 0,
            playsinline: 1,
            controls: 0, // Hide native controls
            title: 0,
            byline: 0,
            portrait: 0,
            badge: 0,
            autopause: 0,
            dnt: 1,
            background: 0,
            transparent: 0,
            color: "ffffff",
          })
          setVimeoFullUrl(simplifiedUrl)
        }
      } else {
        setIsYoutubeVideo(false)
        setIsVimeoVideo(false)
      }
    }
  }, [video])

  const pauseAllVideos = () => {
    // Pausar vídeo do Vimeo
    if (isVimeoVideo && vimeoPlayer) {
      vimeoPlayer.pause().catch((error: any) => {
        console.error("Error pausing Vimeo video:", error);
      });
    }

    // Pausar vídeo do YouTube
    if (isYoutubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo?.();
    }

    // Pausar vídeo MP4
    if (videoRef.current) {
      videoRef.current.pauseAsync().catch((error) => {
        console.error("Error pausing video:", error);
      });
    }
  };

  // Initialize Vimeo Player API
  useEffect(() => {
    if (Platform.OS === "web" && isVimeoVideo && vimeoIframeRef.current) {
      // Load Vimeo Player API script if not already loaded
      if (!window.Vimeo) {
        const script = document.createElement("script")
        script.src = "https://player.vimeo.com/api/player.js"
        script.async = true
        script.onload = initVimeoPlayer
        document.body.appendChild(script)
      } else {
        initVimeoPlayer()
      }
    }

    return () => {
      // Cleanup Vimeo player
      if (vimeoPlayer) {
        vimeoPlayer.destroy?.()
      }
    }
  }, [isVimeoVideo, vimeoIframeRef.current])

  useEffect(() => {
    // Inicialização...

    return () => {
      // Pausar e limpar todos os vídeos ao desmontar o componente
      pauseAllVideos();

      // Destruir o player do Vimeo
      if (vimeoPlayer) {
        vimeoPlayer.destroy?.();
      }

      // Limpar referências
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current = null;
      }
    };
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleFullscreenChange = () => {
        const isDocumentFullscreen =
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement

        setIsFullscreen(!!isDocumentFullscreen)
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange)
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.addEventListener("mozfullscreenchange", handleFullscreenChange)
      document.addEventListener("MSFullscreenChange", handleFullscreenChange)

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
        document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
        document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
      }
    }
  }, [])

  // Initialize Vimeo Player
  const initVimeoPlayer = () => {
    if (window.Vimeo && vimeoIframeRef.current) {
      try {
        const player = new window.Vimeo.Player(vimeoIframeRef.current)
        setVimeoPlayer(player)

        // Set initial state
        player.getVolume().then((volume: number) => {
          setIsMuted(volume === 0)
        })

        // Listen for play/pause events
        player.on("play", () => setIsPlaying(true))
        player.on("pause", () => setIsPlaying(false))
        player.on("ended", () => setIsPlaying(false))

        // Start playing
        player
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error: any) => {
            console.error("Error playing video:", error)
          })
      } catch (error) {
        console.error("Error initializing Vimeo player:", error)
      }
    }
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (vimeoPlayer) {
      if (isPlaying) {
        vimeoPlayer
          .pause()
          .then(() => {
            setIsPlaying(false)
          })
          .catch((error: any) => {
            console.error("Error pausing video:", error)
          })
      } else {
        vimeoPlayer
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error: any) => {
            console.error("Error playing video:", error)
          })
      }
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (vimeoPlayer) {
      if (isMuted) {
        vimeoPlayer
          .setVolume(1)
          .then(() => {
            setIsMuted(false)
          })
          .catch((error: any) => {
            console.error("Error unmuting video:", error)
          })
      } else {
        vimeoPlayer
          .setVolume(0)
          .then(() => {
            setIsMuted(true)
          })
          .catch((error: any) => {
            console.error("Error muting video:", error)
          })
      }
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (Platform.OS !== "web") return

    if (!isFullscreen) {
      // Enter fullscreen
      const container = videoContainerRef.current
      if (!container) return

      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if ((container as any).webkitRequestFullscreen) {
        /* Safari */
        ; (container as any).webkitRequestFullscreen()
      } else if ((container as any).msRequestFullscreen) {
        /* IE11 */
        ; (container as any).msRequestFullscreen()
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        /* Safari */
        ; (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        /* IE11 */
        ; (document as any).msExitFullscreen()
      }
    }
  }

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(50))[0]

  const screenWidth = Dimensions.get("window").width

  // Estimated time to complete (mock data)
  const estimatedTime = tempo_estimado

  // Phase number (mock data - could be derived from phaseId)
  const phaseNumber = Number.parseInt(phaseId) || 1
  const totalPhases = 5

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Render Vimeo video based on platform
  const renderVimeoVideo = () => {
    if (!vimeoFullUrl) return null

    if (Platform.OS === "web") {
      // For web platform, use the exact HTML structure provided by Vimeo
      return (
        <View className="w-full overflow-hidden">
          <div
            ref={videoContainerRef}
            style={{
              padding: "56.25% 0 0 0",
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            className={isFullscreen ? "fullscreen-container" : ""}
          >
            <iframe
              ref={vimeoIframeRef}
              src={vimeoFullUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "12px",
              }}
              title={title || "Vimeo Video"}
            />

            {/* Custom controls overlay - always visible */}
            {showCustomControls && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "10px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomLeftRadius: "12px",
                  borderBottomRightRadius: "12px",
                  zIndex: 10, // Ensure controls are above the iframe
                }}
              >
                {/* Play/Pause button */}
                <button
                  onClick={togglePlayPause}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  {isPlaying ? <Pause color="#fff" size={24} /> : <Play color="#fff" size={24} />}
                </button>

                {/* Volume button */}
                <button
                  onClick={toggleMute}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  {isMuted ? <VolumeX color="#fff" size={24} /> : <Volume2 color="#fff" size={24} />}
                </button>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  {isFullscreen ? <Minimize color="#fff" size={24} /> : <Maximize color="#fff" size={24} />}
                </button>
              </div>
            )}
          </div>

          {/* Add CSS for fullscreen mode */}
          <style  >{`
            .fullscreen-container {
              border-radius: 0 !important;
            }
            .fullscreen-container iframe {
              border-radius: 0 !important;
            }
          `}</style>
        </View>
      )
    } else {
      // For native platforms, use a fallback message with the video ID
      return (
        <View className="w-full h-52 rounded-xl bg-gray-200 items-center justify-center">
          <Text className="text-gray-600 text-center px-4">
            Vídeo do Vimeo não disponível nesta visualização. Por favor, acesse no navegador.
          </Text>
          {vimeoId && <Text className="text-blue-500 mt-2">ID do vídeo: {vimeoId}</Text>}
        </View>
      )
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle={"dark-content"} backgroundColor="#F6A608" translucent={false} />
      <View className="flex-1">
        {/* Header Section */}
        <View className="w-full">
          <View className="w-full bg-secondary py-10 border-b-4 border-tertiary items-center justify-center">
            <ArrowBack color="#fff" size={20} className="absolute bg-tertiary top-2 left-2" />

            <Text className="text-3xl font-bold text-white text-center pt-2 px-5">{title}</Text>
          </View>

          {subTitle && (
            <View className="w-full bg-[#31C7ED] py-3 items-center justify-center border-b-2 border-[#28a8c9]">
              <Text className="text-xl font-semibold text-white text-center px-5">{subTitle}</Text>
            </View>
          )}

          {/* Time estimate */}
          <View className="w-full flex-row items-center justify-center py-3 bg-white border-b border-gray-200 shadow">
            <Clock size={18} color="#666" />
            <Text className="text-sm text-gray-700 ml-2">Tempo estimado: {estimatedTime}</Text>
          </View>
        </View>
        <ScrollView className="flex-1 pb-20" showsVerticalScrollIndicator={true}>
          <Animated.View
            className="flex-1 items-center justify-between"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Content Section */}
            <View className="flex-1 w-full px-6 items-center my-4">
              {description && (
                <View className="w-full bg-white p-5 rounded-xl mb-5 shadow-sm border border-gray-100">
                  <View className="flex-row items-center mb-3">
                    <Info size={20} color="#56A6DC" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Descrição</Text>
                  </View>
                  <Text className="text-base text-gray-800 leading-6">{description}</Text>
                </View>
              )}

              {/* Dicas da fase */}
              {tips && (
                <View className="w-full bg-[#FFF8E1] p-5 rounded-xl mb-5 border border-[#FFE082]">
                  <Text className="text-lg font-bold text-[#F57C00] mb-2">{tips.title}</Text>
                  <Text className="text-base text-[#795548]">{tips.content}</Text>
                </View>
              )}

              {keyPoints.length > 0 && (
                <View className="w-full bg-[#f8f9fa] p-5 rounded-xl mb-5 border border-gray-200">
                  <View className="flex-row items-center mb-3">
                    <Star size={20} color="#FFD700" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Pontos-chave</Text>
                  </View>
                  {keyPoints.map((point, index) => (
                    <View key={index} className="flex-row items-start mt-2">
                      <CheckCircle size={18} color="#56A6DC" className="mt-0.5" />
                      <Text className="text-base text-gray-700 ml-2 flex-1">{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              {image && (
                <View className="w-full items-center mb-5 rounded-xl overflow-hidden shadow-lg">
                  <Image source={{ uri: image }} className="w-full rounded-xl h-52" resizeMode="cover" />
                </View>
              )}

              {video && (
                <View className="w-full mb-5 rounded-xl overflow-hidden shadow-lg">
                  {isYoutubeVideo && youtubeId ? (
                    <YoutubeIframe
                      height={208}
                      videoId={youtubeId}
                      width={MOBILE_WIDTH - 48}
                      play={false}
                      onChangeState={(state) => console.log("YouTube player state:", state)}
                      onError={(e) => console.log("YouTube player error:", e)}
                    />
                  ) : isVimeoVideo ? (
                    renderVimeoVideo()
                  ) : (
                    <Video
                      source={{ uri: video }}
                      className="w-full h-52 rounded-xl"
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                      onError={(e) => console.log("Video error:", e)}
                      onReadyForDisplay={() => console.log("Video ready")}
                    />
                  )}
                </View>
              )}
              {additionalFeature}
            </View>
          </Animated.View>
        </ScrollView>
        {/* Fixed Button Section at the bottom */}
        <View className="bottom-0 left-0 right-0 px-6 py-4 bg-primary border-t border-gray-200">
          <View className="relative">
            <CustomButton
              title="CONTINUAR"
              onPress={() => {
                // Pausar todos os tipos de vídeo antes de navegar
                pauseAllVideos();

                router.push({
                  pathname: "/questions/game",
                  params: {
                    phaseId,
                    trailId,
                    stageId,
                  },
                });
              }}
              className="bg-secondary shadow-md"
              textClassName="tracking-wide"
            />
            <View className="absolute right-10 top-0 h-full flex justify-center items-center">
              <ArrowRight size={24} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default StartPhase
