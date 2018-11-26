import React from 'react';
import { Platform, View, Dimensions, Text } from 'react-native';
import { MapView, Permissions, Location, Constants } from 'expo';
import _ from 'lodash'
import openSocket from 'socket.io-client';
import UserCircle from './UserCircle';


const clientSocket = openSocket('http://192.168.1.16:5000');
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 13.670318;
const LONGITUDE = -89.2392;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;


export default class App extends React.Component {
  static navigationOptions = {
    title: 'Map'
  }
  state = {
    initialRegion: {
      longitude: null,
      latitude: null,
      latitudeDelta: null,
      longitudeDelta: null,
    },
    location: {
      longitude: null,
      latitude: null,
      radius: 500,
    },
    errorMessage: '',
    regionLoaded: false,
    locationLoaded: false,
    socket: clientSocket,
    users: {},
  };

  componentWillMount() {
    if (Platform.OS === 'android') {
    this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this.updateLocation();
    }
  }

  componentDidMount(){
    this.setRegion();
    setInterval(this.updateLocation, 1000);
    this.subscribeToUsers();
  }

  setRegion = async () => {
    let location = await Location.getCurrentPositionAsync({});
    const state = {};
    const { latitude, longitude } = location.coords;
    state.region = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta:LONGITUDE_DELTA,
    }
    state.regionLoaded = true;
    this.setState(state);
  }

  updateLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
    this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    const state = {};
    const { latitude, longitude, accuracy } = location.coords;
    const radius = accuracy / 2; 
    state.location = {
      latitude: latitude,
      longitude: longitude,
      radius,
    }
    state.locationLoaded = true;
    this.setState(state, () => {
      this.sendLocation();
    });
  };

  subscribeToUsers = () => {
    const { socket } = this.state
    socket.on('userJoined', (data) => {
      alert('Someone joined to the app.', JSON.stringify(data));
    })

    socket.on('newLocation', (users) => {
      this.setState({users})
    })
  }

  sendLocation = () => {
    const { socket, location } = this.state
    socket.emit('newLocation', {...location, device: Constants.deviceName})
  }

  onRegionChange = (region) => {
    this.setState({ region });
  }

  render() {
    const { region, location, locationLoaded , users} = this.state;
    if(locationLoaded) {
      return (
        <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChange={this.onRegionChange}
      >
        <UserCircle location={location} isMyLocation />
        {
          _.map(users, user => <UserCircle key={user.id} location={user.location} />)
        }
      </MapView>
      )
    } else {
      return (
        <View>
          <Text>Loading map</Text>
        </View>
      )
    }
  }

}