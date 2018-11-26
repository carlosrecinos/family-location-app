import React, {Fragment} from 'react'
import { MapView } from 'expo';

const colors = {
  blue: {
    overlay: {
      strokeColor: '#1A66FF',
      fillColor: 'rgba(117, 163, 255, 0.5)'
    },
    center: {
      strokeColor: '#E8EFFF',
      fillColor: '#1A66FF'
    }
  },
  purple: {
    overlay: {
      strokeColor: '#3C156A',
      fillColor: 'rgba(82, 45, 124, 0.3)',
    },
    center: {
      strokeColor: '#F4F1F6',
      fillColor: 'rgb(145, 123, 171)'
    }
  }
}

export default function UserCircle({location, isMyLocation}) {
  const color = isMyLocation ? colors.blue : colors.purple;
  const {overlay, center} = color;
  return (
    <Fragment>
      <MapView.Circle
          center={location}
          radius={location.radius}
          strokeWidth={1}
          strokeColor={overlay.strokeColor}
          fillColor={overlay.fillColor}
          lineCap="round"
          lineJoin="round"
          zIndex={2}
        />
        <MapView.Circle
          center={location}
          radius={3}
          strokeWidth={2}
          strokeColor={center.strokeColor}
          fillColor={center.fillColor}
          lineCap="round"
          lineJoin="round"
          zIndex={2}
        />
    </Fragment>
  )
}
