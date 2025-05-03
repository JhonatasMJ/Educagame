"use client"

import { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
} from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { BRAND_COLORS, TEXT_COLORS, BUTTON_COLORS, UI_COLORS, FORM_COLORS } from "../colors"
import { useQuickRegister } from "../hooks/useQuickRegister"
import { useRequireAuth } from "../hooks/useRequireAuth"

// Importando os avatares SVG
import Avatar1 from "../../assets/images/avatar1.svg"
import Avatar2 from "../../assets/images/avatar2.svg"
import Avatar3 from "../../assets/images/avatar3.svg"
import Avatar4 from "../../assets/images/avatar4.svg"
import React from "react"
import Character from "../components/Character"
import { USE_SIMPLIFIED_ONBOARDING } from "@/config/appConfig"

const avatars = [
    { id: "1", source: Avatar1, sourceName: "avatar1" },
    { id: "2", source: Avatar2, sourceName: "avatar2" },
    { id: "3", source: Avatar3, sourceName: "avatar3" },
    { id: "4", source: Avatar4, sourceName: "avatar4" },
]

const { width } = Dimensions.get("window")
const AVATAR_SIZE = width * 0.16 // Tamanho reduzido dos avatares

export default function QuickStart() {
    const router = useRouter()
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
    const [name, setName] = useState("")
    const { handleQuickRegister, isLoading } = useQuickRegister()

    // Animações
    const fadeIn = useRef(new Animated.Value(0)).current
    const slideUp = useRef(new Animated.Value(50)).current
    const buttonScale = useRef(new Animated.Value(1)).current
    const avatarAnimations = useRef(avatars.map(() => new Animated.Value(0))).current

    useRequireAuth({
        requireAuth: false,
        showToast: false,
    });

    useEffect(() => {
        // Animação de entrada
        Animated.parallel([
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideUp, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            // Animação sequencial dos avatares
            ...avatarAnimations.map((anim, index) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 500,
                    delay: 300 + index * 100,
                    useNativeDriver: true,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
            ),
        ]).start()
    }, [])

    // Animação do botão ao pressionar
    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start()
    }

    const handleRegister = async () => {
        if (!selectedAvatar) {
            Alert.alert("Escolha um avatar", "Por favor, selecione um avatar para continuar")
            return
        }

        if (name.trim().length < 3) {
            Alert.alert("Nome muito curto", "O nome deve ter pelo menos 3 caracteres")
            return
        }

        try {
            await handleQuickRegister(name, selectedAvatar)
        } catch (error) {
            Alert.alert("Erro", "Não foi possível criar sua conta. Tente novamente.")
            console.error(error)
        }
    }

    const handleAvatarSelect = (avatarId: string) => {
        setSelectedAvatar(avatarId)

        // Animação de seleção
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 1.05,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start()
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                    <Text style={styles.title}>Comece sua jornada!</Text>
                    <Text style={styles.description}>Personalize seu perfil para começar a jogar e aprender</Text>

                    <View style={styles.section}>
                        <Text style={styles.subtitle}>Escolha seu avatar</Text>
                        <View style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "space-evenly",
                            width: "100%"
                        }}>
                            {avatars.map((avatar, index) => {
                                return (
                                    <Animated.View
                                        key={avatar.id}
                                        style={{
                                            opacity: avatarAnimations[index],
                                            transform: [
                                                {
                                                    scale: avatarAnimations[index].interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0.5, 1],
                                                    }),
                                                },
                                            ],
                                            width: "35%", // Define a largura para aproximadamente metade do container

                                            alignItems: "center"
                                        }}
                                    >
                                        <Character
                                            source={avatar.source}
                                            id={Number(avatar.id)}
                                            isSelected={selectedAvatar === avatar.id}
                                            onSelect={() => handleAvatarSelect(avatar.id)}
                                        />
                                    </Animated.View>
                                )
                            })}
                        </View>


                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subtitle}>Como podemos te chamar?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            placeholderTextColor={UI_COLORS.PLACEHOLDER}
                            value={name}
                            onChangeText={setName}
                            maxLength={20}
                            autoCapitalize="words"
                        />
                    </View>

                    <Animated.View
                        style={{
                            width: "100%",
                            transform: [{ scale: buttonScale }],
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.button, (!name || !selectedAvatar) && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={!name || !selectedAvatar || isLoading}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={[styles.buttonText, { color: !name || !selectedAvatar ? BRAND_COLORS.PRIMARY : BUTTON_COLORS.SECONDARY_TEXT }]}>{!name || !selectedAvatar ? "Preencha todos os campos" : "JOGAR!"}</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BRAND_COLORS.TERTIARY,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 10,
    },
    content: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: TEXT_COLORS.LIGHT,
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: TEXT_COLORS.LIGHT,
        opacity: 0.8,
        textAlign: "center",
        marginBottom: 6.78,
        maxWidth: "80%",
    },
    section: {
        width: "100%",
        marginVertical: 10,
        alignItems: "center",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: TEXT_COLORS.LIGHT,
        marginBottom: 16,
    },
    avatarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        width: '100%',
    },
    avatarContainer: {
        width: AVATAR_SIZE / 1.85,
        height: AVATAR_SIZE / 1.85,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        margin: 12,
        borderWidth: 2,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedAvatarContainer: {
        borderColor: BRAND_COLORS.SECONDARY,
        borderWidth: 3,
        shadowColor: BRAND_COLORS.SECONDARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarWrapper: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: AVATAR_SIZE / 2,
        overflow: "hidden",
    },
    input: {
        width: "100%",
        height: 56,
        backgroundColor: FORM_COLORS.INPUT_BG,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: TEXT_COLORS.PRIMARY,
        borderWidth: 1,
        borderColor: FORM_COLORS.INPUT_BORDER,
    },
    button: {
        width: "100%",
        height: 56,
        backgroundColor: BRAND_COLORS.PRIMARY,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: BRAND_COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: BUTTON_COLORS.DISABLED_BG,
        shadowOpacity: 0,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1,
    },
})
