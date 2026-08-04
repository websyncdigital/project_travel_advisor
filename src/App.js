import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';
import AIAssistant from './components/AIAssistant/AIAssistant';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({});
  const [bounds, setBounds] = useState(null);

  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [timeZoneId, setTimeZoneId] = useState(null);
  const [locationName, setLocationName] = useState('');

  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setCoords({ lat: latitude, lng: longitude });
    });
  }, []);

  useEffect(() => {
    if (coords.lat && coords.lng) {
      // 1. Weather API
      fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&location.latitude=${coords.lat}&location.longitude=${coords.lng}`)
        .then((response) => response.json())
        .then((data) => setWeatherData(data))
        // eslint-disable-next-line no-console
        .catch((error) => console.error('Weather API error:', error));

      // 2. Air Quality API
      fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { latitude: coords.lat, longitude: coords.lng } }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.indexes && data.indexes.length > 0) {
            setAirQuality(data.indexes[0]);
          }
        })
        // eslint-disable-next-line no-console
        .catch((error) => console.error('Air Quality API error:', error));

      // 3. Time Zone API
      fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${coords.lat},${coords.lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'OK') setTimeZoneId(data.timeZoneId);
        })
        // eslint-disable-next-line no-console
        .catch((error) => console.error('Time Zone API error:', error));

      // 4. Geocoding API (using the loaded Google Maps script)
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results[0]) {
            // Find a locality, sublocality, or neighborhood, avoiding plus codes if possible
            const cityResult = results.find((r) => r.types.includes('locality'))
              || results.find((r) => r.types.includes('sublocality'))
              || results.find((r) => r.types.includes('neighborhood'))
              || results.find((r) => !r.types.includes('plus_code'))
              || results[0];
            setLocationName(cityResult.formatted_address.split(',')[0]);
          }
        });
      }
    }
  }, [coords]);

  useEffect(() => {
    if (rating) {
      const filtered = places.filter((place) => Number(place.rating) >= rating);
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [rating, places]);

  useEffect(() => {
    if (bounds && map && !selectedDestination) {
      setIsLoading(true);

      const service = new window.google.maps.places.PlacesService(map);

      let mappedType = 'restaurant';
      if (type === 'hotels') mappedType = 'lodging';
      if (type === 'attractions') mappedType = 'tourist_attraction';

      const request = {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
          new window.google.maps.LatLng(bounds.ne.lat, bounds.ne.lng),
        ),
        type: mappedType,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Add dummy fields to match the old interface where possible
          const transformedPlaces = results.map((p) => ({
            ...p,
            num_reviews: p.user_ratings_total || 0,
          }));
          setPlaces(transformedPlaces.filter((place) => place.name));
        } else {
          setPlaces([]);
        }
        setIsLoading(false);
      });
    }
  }, [bounds, type, map]);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoords({ lat, lng });
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
      <Grid container spacing={3} style={{ width: '100%' }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            childClicked={childClicked}
            places={rating ? filteredPlaces : places}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
            setSelectedDestination={setSelectedDestination}
            selectedDestination={selectedDestination}
          />
        </Grid>
        <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            places={rating ? filteredPlaces : places}
            setMap={setMap}
            weatherData={weatherData}
            airQuality={airQuality}
            timeZoneId={timeZoneId}
            locationName={locationName}
            selectedDestination={selectedDestination}
          />
        </Grid>
      </Grid>
      <AIAssistant coords={coords} locationName={locationName} places={places} />
    </>
  );
};

export default App;
