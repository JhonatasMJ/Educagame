import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>Mudar Avatar</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nome</Text>
          <Text style={styles.inputValue}>Nome</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sobrenome</Text>
          <Text style={styles.inputValue}>Sobrenome</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>E-mail</Text>
          <Text style={styles.inputValue}>email@exemplo.com</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Data Nascimento</Text>
          <Text style={styles.inputValue}>01/01/1990</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Celular</Text>
          <Text style={styles.inputValue}>(00) 00000-0000</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Senha</Text>
          <Text style={styles.inputValue}>********</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.buttonText}>FECHAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingVertical: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  inputValue: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;