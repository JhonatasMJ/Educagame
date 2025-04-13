import React from "react"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { TouchableOpacity } from "react-native"

const  ArrowBack = ({
    className,
    color,
    onPress,
    size
}: { className?: string; color?: string; size?: number; onPress?: () => void }) => {
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
      className={`z-10 p-2 rounded-full ${className}`}
    >
      <ChevronLeft size={size ? size : 26} color={color ?? "#f2f2f2"} />
    </TouchableOpacity>
  )
}   
export default ArrowBack