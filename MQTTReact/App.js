import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { env } from 'react-native-dotenv'
import MQTTService from './src/services/mqttServices.js';
import StatusModal from './src/components/StatusModal.js';
import LightControl from './src/components/LightControl.js';
import Gauges from './src/components/Gauges.js';

import api from './src/axios/api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);

  const [dados, setdados] = useState();
  const [refluz, setrefluz] = useState(false);
  const [reftemp, setreftemp] = useState(0);
  const [refhum, setrefhum] = useState(0);

  const mqttConfig = {  
    host: process.env.EXPO_PUBLIC_MQTT_HOST,
    port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
    path: "/mqtt",
    user: process.env.EXPO_PUBLIC_MQTT_USER,
    pass: process.env.EXPO_PUBLIC_MQTT_PASS,
    clientId: 'RN_App_' + Math.random()
  };

  const envia = async () => {
    let coiso = {
      luz: isLightOn,
      temperatura: temp,
      umidade: hum
    }

    if((coiso.temperatura!=reftemp)||(coiso.umidade!=refhum)||(coiso.luz!=refluz)){
      api.post('/salva', coiso)
        .then((data) => {
          console.log(data.data);
        })

      setrefluz(coiso.luz);
      setreftemp(coiso.temperatura);
      setrefhum(coiso.umidade);

      await AsyncStorage.setItem('dadosAnt', JSON.stringify(coiso));
    }

    let uhhhh = await api.get('/get');
    setdados(uhhhh.data);
  }

  useEffect(() => {
    startConnection();

    api.get('/get')
      .then(async (resposta) => {
        setdados(resposta.data);

        let tuca = await AsyncStorage.getItem('dadosAnt');

        if(tuca){
          let donka = JSON.parse(tuca);

          setrefluz(donka.luz);
          setreftemp(donka.temperatura);
          setrefhum(donka.umidade);

          setIsLightOn(donka.luz);
          setTemp(donka.temperatura);
          setHum(donka.umidade);
        };

      })
      .catch((erro) => {console.log('dumbass error: ' + erro)})

    envia();

  }, [isLightOn, temp, hum]);

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if(topic === 'casa/temp') setTemp(parseFloat(message));
        if(topic === 'casa/umid') setHum(parseFloat(message));
        if(topic === 'casa/luz') setIsLightOn(message === '1');
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },
      (err) => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  };

  return (
    <View style={styles.container}>
      <View style={[{width: '30%'}]}>
        <Text style={styles.header}>Smart Home IoT</Text>

        <LightControl isLightOn={isLightOn} onToggle={toggleLight} />

        <Gauges temp={temp} hum={hum} />

        <StatusModal visible={showError} onRetry={startConnection} onLater={() => setShowError(false)} />
      </View>

      <View style={[{width: '30%'}]}>
        <FlatList 
          data={dados} 
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={[{flexDirection: 'column', backgroundColor: 'rgb(151, 185, 219)', marginBottom: 2}]}>
              <Text>
                Luz: {item.luz ? 'Ligado' : 'Desligado'}
              </Text>

              <Text>
                Temperatura: {item.temperatura}º C
              </Text>

              <Text>
                Umidade: {item.umidade}%
              </Text>

              <Text>
                Horário: {new Date(item.createdAt).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
          style={[{backgroundColor: 'rgb(44, 55, 66)', height: window.innerHeight*0.7}]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '2%'
  },

  header: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20
  }
});
