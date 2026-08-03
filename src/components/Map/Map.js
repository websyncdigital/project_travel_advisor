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

  const polylineRef = React.useRef(null);
  const [internalMap, setInternalMap] = React.useState(null);
  const [routeError, setRouteError] = React.useState('');
  const [routeInfo, setRouteInfo] = React.useState(null);

  const errorBannerStyle = {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    backgroundColor: 'red',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    fontWeight: 'bold',
  };

  const infoBannerStyle = {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  React.useEffect(() => {
    if (selectedDestination && coords && window.google && window.google.maps && internalMap) {
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
            if (polylineRef.current) polylineRef.current.setMap(null);

            polylineRef.current = new window.google.maps.Polyline({
              path: result.routes[0].overview_path,
              strokeColor: '#2196F3',
              strokeOpacity: 0.8,
              strokeWeight: 6,
            });
            polylineRef.current.setMap(internalMap);
            internalMap.fitBounds(result.routes[0].bounds, 150); // Add 150px padding so markers don't get clipped!

            setRouteInfo(result.routes[0].legs[0].distance.text);
            setRouteError('');
          } else {
            // eslint-disable-next-line no-console
            console.error(`Error fetching directions: ${status}`);
            setRouteError(status);
          }
        },
      );
    } else if (polylineRef.current) {
      polylineRef.current.setMap(null);
      setRouteInfo(null);
      setRouteError('');
    }
  }, [selectedDestination, internalMap]);

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
        <div style={errorBannerStyle}>
          Route Error: {routeError} - Please check if Directions API is enabled in Google Cloud Console!
        </div>
      )}
      {routeInfo && (
        <div style={infoBannerStyle}>
          Route Distance: {routeInfo}
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
        {/* Moving the Exploring widget OUTSIDE of GoogleMapReact so it acts as an absolute overlay instead of a map marker */}
      </GoogleMapReact>

      {(weatherData || locationName || timeZoneId) && (
        <div style={{ position: 'absolute', bottom: '40px', left: '20px', zIndex: 5, minWidth: '150px' }}>
          <Paper elevation={3} style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>

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
    </div>
  );
};

export default Map;
