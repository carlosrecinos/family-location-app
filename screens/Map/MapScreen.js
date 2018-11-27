import React from 'react';
import {
  View, Dimensions, Text, Alert,
} from 'react-native';
import {
  MapView, Permissions, Location, Constants,
} from 'expo';
import _ from 'lodash';
import openSocket from 'socket.io-client';
import UserCircle from './UserCircle';


const clientSocket = openSocket('http://192.168.1.11:5000');
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class App extends React.Component {
  static navigationOptions = {
    title: 'Map',
  }

  state = {
    location: {
      longitude: null,
      latitude: null,
      radius: 500,
    },
    regionLoaded: false,
    locationLoaded: false,
    socket: clientSocket,
    users: {},
    permissionGranted: false,
    gettingLocation: false,
  };

  componentWillMount() {
    this.checkPermissions();
  }


  componentDidMount() {
    setInterval(this.updateLocation, 3000);
    this.subscribeToUsers();
  }

  checkPermissions = async () => {
    const { status } = await Permissions.getAsync(Permissions.LOCATION);
    if (status === 'granted') {
      this.setState({ permissionGranted: true });
      this.setRegion();
    } else {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        this.setState({ permissionGranted: true });
        this.setRegion();
      }
    }
  }

  setRegion = async () => {
    alert('before');
    setTimeout(() => {
      const state = {};
      const location = {
        latitude: 13.6880128,
        longitude: -89.21006080000001,
        accuracy: 60,
      };
      const { latitude, longitude, accuracy } = location;
      const radius = accuracy / 2;
      state.region = {
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      state.location = {
        latitude,
        longitude,
        radius,
      };
      state.locationLoaded = true;
      state.regionLoaded = true;
      this.setState(state);
    }, 1000);
    const location = await Location.getCurrentPositionAsync({ maximumAge: 100000 });
    const state = {};
    const { latitude, longitude, accuracy } = location.coords;
    const radius = accuracy / 2;
    state.region = {
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    state.location = {
      latitude,
      longitude,
      radius,
    };
    state.locationLoaded = true;
    state.regionLoaded = true;
    this.setState(state);
  }

  updateLocation = async () => {
    const { gettingLocation, permissionGranted } = this.state;
    if (gettingLocation || !permissionGranted) return null;
    Location.watchPositionAsync({ }, ({ coords }) => {
      alert('Watcha');
      const state = {};
      const { latitude, longitude, accuracy } = coords;
      const radius = accuracy / 2;
      state.location = {
        latitude,
        longitude,
        radius,
      };
      state.locationLoaded = true;
      this.setState(state, () => {
        this.sendLocation();
      });
    });
  };

  subscribeToUsers = () => {
    const { socket } = this.state;
    socket.on('userJoined', (data) => {
      alert('Someone joined to the app.', JSON.stringify(data));
    });

    socket.on('newLocation', (users) => {
      // console.log('Users:', users)
      this.setState({ users });
    });
  }

  sendLocation = () => {
    const { socket, location } = this.state;
    socket.emit('newLocation', { ...location, device: Constants.deviceName });
  }

  onRegionChange = (region) => {
    this.setState({ region });
  }

  render() {
    const {
      region, location, locationLoaded, users, permissionGranted, regionLoaded,
    } = this.state;
    if (locationLoaded && regionLoaded && permissionGranted) {
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
      );
    }
    return (
      <View>
        <Text>Loading map</Text>
      </View>
    );
  }
}
