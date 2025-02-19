import { Modal } from "react-native";

interface ModalProps {
    state: boolean,
    setState: React.Dispatch<React.SetStateAction<boolean>>,
    children: React.ReactNode,
    styles: any
}

const ModalComponent = ({ state, children, setState,styles}: ModalProps ) =>{

    return(
        <Modal visible={state} style={styles}  transparent={true}
        animationType="slide"  statusBarTranslucent= {true} onRequestClose={() => {setState(false)}}>
            {children}
        </Modal>
    );
}

export default ModalComponent