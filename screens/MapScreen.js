import React from 'react';
import { Platform, View, Dimensions } from 'react-native';
import { MapView, Constants, Permissions, Location } from 'expo';
import _ from 'lodash'

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 13.670318;
const LONGITUDE = -89.2392;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;


export default class App extends React.Component {
  static navigationOptions = {
    title: 'Mis contactos'
  }
  state = {
    location: {},
    region: {
      longitude: LONGITUDE,
      latitude: LATITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    errorMessage: '',
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    const state = {};
    console.log(location)
    const { latitude, longitude } = location.coords;
    state.region = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta:LONGITUDE_DELTA,
    }
    state.location = {
      latitude: latitude,
      longitude: longitude,
    }
    this.setState(state)
  };

  onRegionChange = (region) => {
    this.setState({ region });
  }
  circle = {
    center: {
      latitude: LATITUDE + SPACE,
      longitude: LONGITUDE + SPACE,
    },
    radius: 20,
  }
  render() {
    const { region, location } = this.state;
    const locationLoaded = !_.isEmpty(location);
    
    return (
      <MapView
        style={{ flex: 1 }}
        region={region}
      >
        {
          locationLoaded
          && <MapView.Circle
                center={this.circle.center}
                radius={this.circle.radius}
                fillColor="rgba(7,149,204, 1)"
                strokeColor="rgba(81,180,219,0.7)"
                strokeWidth={20}
                lineCap="round"
                lineJoin="round"
                zIndex={2}
              />
        }
      </MapView>
    )
  }

}