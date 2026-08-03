import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';

import mapStyles from '../../mapStyles';
import useStyles from './styles.js';

const Map = ({ coords, places, setCoords, setBounds, setChildClicked, setMap, weatherData }) => {
  const matches = useMediaQuery('(min-width:600px)');
  const classes = useStyles();

  return (
    <div className={classes.mapContainer}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAP_API_KEY, libraries: ['places'] }}
        defaultCenter={{ lat: 0, lng: 0 }}
        center={coords}
        defaultZoom={14}
        margin={[50, 50, 50, 50]}
        options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles }}
        onChange={(e) => {
          setCoords({ lat: e.center.lat, lng: e.center.lng });
          setBounds({ ne: e.marginBounds.ne, sw: e.marginBounds.sw });
        }}
        onChildClick={(child) => setChildClicked(child)}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => setMap(map)}
      >
        {places.length > 0 && places.map((place, i) => (
          <div
            className={classes.markerContainer}
            lat={Number(place.geometry?.location?.lat() || place.latitude)}
            lng={Number(place.geometry?.location?.lng() || place.longitude)}
            key={i}
          >
            {!matches
              ? <LocationOnOutlinedIcon color="primary" fontSize="large" />
              : (
                <Paper elevation={3} className={classes.paper}>
                  <Typography className={classes.typography} variant="subtitle2" gutterBottom> {place.name}</Typography>
                  <img
                    className={classes.pointer}
                    src={place.photos ? place.photos[0].getUrl() : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80'}
                    alt={place.name}
                  />
                  <Rating name="read-only" size="small" value={Number(place.rating)} readOnly />
                </Paper>
              )}
          </div>
        ))}
        {weatherData?.weatherCondition && (
          <div lat={coords.lat} lng={coords.lng} style={{ zIndex: 1, position: 'absolute', transform: 'translate(-50%, -50%)' }}>
            <Paper elevation={3} style={{ padding: '5px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <img src={`${weatherData.weatherCondition.iconBaseUri}.png`} alt={weatherData.weatherCondition.description?.text} height="35px" />
              {weatherData.temperature && (
                <Typography variant="subtitle1" style={{ fontWeight: 'bold', paddingRight: '5px' }}>
                  {Math.round(weatherData.temperature.degrees)}°C
                </Typography>
              )}
            </Paper>
          </div>
        )}
      </GoogleMapReact>
    </div>
  );
};

export default Map;
