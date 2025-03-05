import { MOBILE_WIDTH } from "@/PlataformWrapper";
import { StyleSheet } from "react-native";



export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingBottom: 70,
    },
    header: {
      padding: 20,
      paddingTop: 35,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 999
    },
    backButton: {
      backgroundColor: '#56A6DC',
      width: 30,
      height: 30,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center'
    },
    searchBar: {
      flexDirection: 'row',
      width: '90%',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      paddingHorizontal: 15
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      fontSize: 16,
      color: '#000'
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      width: MOBILE_WIDTH * 0.85,
      alignItems: 'center'
    },
    primaryButton: {
      backgroundColor: '#56A6DC',
      paddingVertical: 12,
      alignItems: 'center',
      paddingHorizontal: 30,
      borderRadius: 8,
      marginTop: 20
    },
    outlineButton: {
      borderColor: '#56A6DC',
      borderWidth: 2,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      marginTop: 20
    },
    bottomButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20
    }
  });
  
  