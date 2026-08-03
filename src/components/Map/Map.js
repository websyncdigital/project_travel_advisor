import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';

import mapStyles from '../../mapStyles';
import useStyles from './styles.js';

const Map = ({ coords, places, setCoords, setBounds, setChildClicked, setMap, weatherData, airQuality, timeZoneId, locationName, selectedDestination }) => {
  const matches = useMediaQuery('(min-width:600px)');
  const classes = useStyles();

  const directionsRendererRef = React.useRef(null);
  const [internalMap, setInternalMap] = React.useState(null);
  const [routeError, setRouteError] = React.useState('');

  React.useEffect(() => {
    if (selectedDestination && coords && window.google && window.google.maps && internalMap) {
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(internalMap);
      }

      const directionsService = new window.google.maps.DirectionsService();

      const origin = { lat: coords.lat, lng: coords.lng };
      const destinationLat = typeof selectedDestination.geometry?.location?.lat === 'function'
        ? selectedDestination.geometry.location.lat()
        : (selectedDestination.geometry?.location?.lat || selectedDestination.latitude);

      const destinationLng = typeof selectedDestination.geometry?.location?.lng === 'function'
        ? selectedDestination.geometry.location.lng()
        : (selectedDestination.geometry?.location?.lng || selectedDestination.longitude);

      const destination = {
        lat: Number(destinationLat),
        lng: Number(destinationLng),
      };

      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRendererRef.current.setDirections(result);
            setRouteError('');
          } else {
            // eslint-disable-next-line no-console
            console.error(`Error fetching directions: ${status}`);
            setRouteError(status);
          }
        },
      );
    } else if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
      setRouteError('');
    }
  }, [selectedDestination, coords, internalMap]);

  const getAqiColor = (category) => {
    if (!category) return 'black';
    const cat = category.toLowerCase();
    if (cat.includes('good')) return 'green';
    if (cat.includes('moderate')) return 'orange';
    return 'red';
  };

  return (
    <div className={classes.mapContainer} style={{ position: 'relative' }}>
      {routeError && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, backgroundColor: 'red', color: 'white', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>
          Route Error: {routeError} - Please check if Directions API is enabled in Google Cloud Console!
        </div>
      )}
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAP_API_KEY, libraries: ['places'] }}
        defaultCenter={{ lat: 0, lng: 0 }}
        center={coords}
        defaultZoom={14}
        margin={[50, 50, 50, 50]}
        options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles, maxZoom: selectedDestination ? 15 : undefined }}
        onChange={(e) => {
          setCoords({ lat: e.center.lat, lng: e.center.lng });
          setBounds({ ne: e.marginBounds.ne, sw: e.marginBounds.sw });
        }}
        onChildClick={(child) => setChildClicked(child)}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => {
          setMap(map);
          setInternalMap(map);
        }}
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
        {(weatherData || locationName || timeZoneId) && (
          <div lat={coords.lat} lng={coords.lng} style={{ zIndex: 1, position: 'absolute', transform: 'translate(-50%, -50%)', minWidth: '150px' }}>
            <Paper elevation={3} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.95)' }}>

              {locationName && (
                <Typography variant="subtitle2" style={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Exploring: {locationName}
                </Typography>
              )}

              {timeZoneId && (
                <Typography variant="caption" color="textSecondary">
                  Local Time: {new Date().toLocaleTimeString('en-US', { timeZone: timeZoneId, hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}

              {weatherData?.weatherCondition && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={`${weatherData.weatherCondition.iconBaseUri}.png`} alt={weatherData.weatherCondition.description?.text} height="35px" />
                  {weatherData.temperature && (
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold', paddingRight: '5px' }}>
                      {Math.round(weatherData.temperature.degrees)}°C
                    </Typography>
                  )}
                </div>
              )}

              {airQuality && (
                <Typography variant="caption" style={{ fontWeight: 'bold', color: getAqiColor(airQuality.category) }}>
                  AQI: {airQuality.category}
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
