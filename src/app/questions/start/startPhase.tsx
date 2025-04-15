 "use client"

import  React from "react"
import { useState, useEffect, useRef } from "react"
import { Text, View, SafeAreaView, Image, ScrollView, Animated, Dimensions, StatusBar } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av"
import YoutubeIframe from 'react-native-youtube-iframe'
import { useLocalSearchParams } from "expo-router"
import { ArrowRight, BookOpen, CheckCircle, Clock, Info, Star } from "lucide-react-native"
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

// In the component parameter list, add a parameter for the tips
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
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false)
  const [youtubeId, setYoutubeId] = useState<string | null>(null)

  // Use props or params
  const title = propTitle || (params.title as string)
  const description = propDescription || (params.description as string)
  const phaseId = params.phaseId as string
  const trailId = params.trailId as string
  const stageId = params.stageId as string
  const image = propImage || (params.image as string)
  const video = propVideo || (params.video as string)
  const tempo_estimado = (params.tempo_estimado as string) 

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

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle={"dark-content"} backgroundColor="#F6A608" translucent={false} />
      <View className="flex-1">
        <ScrollView 
          className="flex-1 pb-20" 
          showsVerticalScrollIndicator={true} 
        >
          <Animated.View
            className="flex-1 items-center justify-between"
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
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
              <View className="w-full flex-row items-center justify-center py-3 bg-white border-b border-gray-200">
                <Clock size={18} color="#666" />
                <Text className="text-sm text-gray-700 ml-2">Tempo estimado: {estimatedTime}</Text>
              </View>
            </View>



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
                <View className="w-full mb-5 rounded-xl overflow-hidden shadow-lg bg-red-500">
                  {video.includes('youtube.com') ? (
                    <YoutubeIframe
                      height={208}
                      videoId={video.split('v=')[1].split('&')[0]}
                      width={MOBILE_WIDTH - 48}
                      play={true}
                      onChangeState={(state) => console.log('YouTube player state:', state)}
                      onError={(e) => console.log('YouTube player error:', e)}
                    />
                  ) : (
                    <Video
                      source={{ uri: video }}
                      className="w-full h-52 rounded-xl"
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                      onError={(e) => console.log('Video error:', e)}
                      onReadyForDisplay={() => console.log('Video ready')}
                    />
                  )}
                </View>
              )}
              {additionalFeature}

            </View>
          </Animated.View>
        </ScrollView>

         {/* Fixed Button Section at the bottom */}
         <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-primary border-t border-gray-200">
          <View className="relative">
            <CustomButton
              title="CONTINUAR"
              nextStep={`/questions/game?phaseId=${phaseId}${trailId ? `&trailId=${trailId}` : ""}&stageId=${stageId}`}
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
