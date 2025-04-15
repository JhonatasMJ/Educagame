import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { MOBILE_WIDTH } from "@/PlataformWrapper";


const {width} = Dimensions.get("window")


interface UnsavedChangesModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const UnsavedChangesModal = ({
  visible,
  onCancel,
  onConfirm,
}: UnsavedChangesModalProps) => {

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={32} color="#f59e0b" />
          </View>

          <Text style={styles.title}>Alterações não salvas</Text>

          <Text style={styles.message}>
            Você tem alterações não salvas no seu perfil. Se sair agora, essas
            alterações serão perdidas.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Continuar editando</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Descartar alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: width < MOBILE_WIDTH ? "80%" : "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#3185BE",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default UnsavedChangesModal;
