import React from "react"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { TouchableOpacity } from "react-native"

const  ArrowBack = ({
    className,
    color,
    onPress,
}: { className?: string; color?: string; onPress?: () => void }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={
        onPress
          ? onPress
          : () => {
              router.back()
            }
      }
      className={`absolute top-3 left-3 z-10 p-2 rounded-full shadow ${className}`}
    >
      <ChevronLeft size={26} color={color ?? "#f2f2f2"} />
    </TouchableOpacity>
  )
}   
export default ArrowBack