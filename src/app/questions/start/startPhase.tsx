import React from "react"
import { Text, View, SafeAreaView, Image, ScrollView } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { Video, ResizeMode } from "expo-av"
import { useLocalSearchParams } from "expo-router"

interface StartPhaseProps {
  title?: string
  subTitle?: string
  description?: string
  image?: string
  video?: string
  additionalFeature?: React.ReactNode
  nextStep?: string
}

const StartPhase = ({
  title: propTitle,
  subTitle,
  description: propDescription,
  image,
  video,
  additionalFeature,
  nextStep = "/question/trueOrfalse",
}: StartPhaseProps) => {
  // Get params from the URL
  const params = useLocalSearchParams()

  // Use props or params
  const title = propTitle || (params.title as string)
  const description = propDescription || (params.description as string)
  const phaseId = params.phaseId as string

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f7" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "space-between", paddingBottom: 20 }}>
          {/* Header Section */}
          <View style={{ width: "100%", alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                backgroundColor: "#223AD2",
                width: "100%",
                paddingVertical: 15,
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 3,
                borderBottomColor: "#1a2db0",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                {title}
              </Text>
            </View>

            {subTitle && (
              <View
                style={{
                  backgroundColor: "#31C7ED",
                  width: "100%",
                  paddingVertical: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: 2,
                  borderBottomColor: "#28a8c9",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "white",
                    textAlign: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  {subTitle}
                </Text>
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={{ flex: 1, paddingHorizontal: 25, width: "100%", alignItems: "center", marginBottom: 20 }}>
            {image && (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  marginBottom: 20,
                  borderRadius: 12,
                  overflow: "hidden",
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: "100%", height: 200, borderRadius: 12 }}
                  resizeMode="cover"
                />
              </View>
            )}

            {video && (
              <View style={{ width: "100%", marginBottom: 20 }}>
                <Video
                  source={{ uri: video }}
                  style={{ width: "100%", height: 200, borderRadius: 12 }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>
            )}

            {additionalFeature}

            {description && (
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 12,
                  width: "100%",
                  marginBottom: 20,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 26,
                    color: "#333",
                    textAlign: "left",
                  }}
                >
                  {description}
                </Text>
              </View>
            )}
          </View>

          {/* Button Section */}
          <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 25 }}>
            <CustomButton
              title="CONTINUAR!"
              nextStep={`../trueOrfalse/trueOrfalse?phaseId=${phaseId}`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
export default StartPhase

