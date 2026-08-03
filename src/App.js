import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({});
  const [bounds, setBounds] = useState(null);

  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setCoords({ lat: latitude, lng: longitude });
    });
  }, []);

  useEffect(() => {
    if (coords.lat && coords.lng) {
      fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&location.latitude=${coords.lat}&location.longitude=${coords.lng}`)
        .then((response) => response.json())
        .then((data) => setWeatherData(data))
        .catch((error) => console.error("Weather API error:", error));
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
    if (bounds && map) {
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
          setFilteredPlaces([]);
          setRating('');
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
            places={filteredPlaces.length ? filteredPlaces : places}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
          />
        </Grid>
        <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            places={filteredPlaces.length ? filteredPlaces : places}
            setMap={setMap}
            weatherData={weatherData}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
