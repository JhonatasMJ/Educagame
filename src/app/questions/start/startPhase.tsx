import React, {useState} from 'react'
import {Text, View, Modal, SafeAreaView} from 'react-native';
import CustomButton from '@/src/components/CustomButton';


interface StartPhaseProps {
    title: string;
    subTitle?: string;
    description?: string;
    additionalFeature?: React.ReactNode;
  }

{/* <Video
  source={{ uri: 'https://exemplo.com/meuVideo.mp4' }} OU source={require('./assets/meuVideo.mp4')}
  style={{ width: 320, height: 200 }}
  useNativeControls
  resizeMode={ResizeMode.CONTAIN}
  isLooping
  onPlaybackStatusUpdate={status => console.log(status)}
/> */}

const StartPhase = ({ title, subTitle, description, additionalFeature}: StartPhaseProps) => {
    

    return(
        <SafeAreaView style={{flex:1, alignItems: 'center', justifyContent: 'space-around'}}>
            <View style={{position: 'relative', top: 0, alignItems: 'center', justifyContent: 'space-between', height: 170, width: '100%'}}>
                <View style={{backgroundColor: '#223AD2', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 30, textAlign: 'center'}}>{title}</Text>
                </View>
                <View style={{backgroundColor: '#31C7ED', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 20, textAlign: 'center'}}>{subTitle}</Text>
                </View>
                
            </View>

            <View style={{ paddingHorizontal: 50, width: '100%', justifyContent: 'space-around', alignItems: 'center'}}>
                {additionalFeature || null}
                <Text style={{fontSize: 20, textAlign: 'left'}}>{description}</Text>
            </View>
            
            <CustomButton title="CONTINUAR!" nextStep="/questions/trueORfalse" />
        </SafeAreaView>
    )
}

export default StartPhase


