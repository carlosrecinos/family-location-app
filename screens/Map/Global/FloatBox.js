import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Icon } from 'expo';
import styled from 'styled-components';

export default class FloatBox extends Component {
  render() {
    return (
      <Box>
        <Icon.Ionicons
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
      </Box>
    )
  }
}

const Box = styled(View)`


`;