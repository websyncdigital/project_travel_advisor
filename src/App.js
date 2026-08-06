import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@material-ui/core';

import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';
import AIAssistant from './components/AIAssistant/AIAssistant';
import CategoryChips from './components/CategoryChips/CategoryChips';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

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
            let cityName = '';
            // Try to find the exact name from address components to avoid plus codes
            results.some((result) => {
              const neighborhood = result.address_components.find((c) => c.types.includes('neighborhood'));
              if (neighborhood) { cityName = neighborhood.long_name; return true; }

              const sublocality = result.address_components.find((c) => c.types.includes('sublocality'));
              if (sublocality) { cityName = sublocality.long_name; return true; }

              const locality = result.address_components.find((c) => c.types.includes('locality'));
              if (locality) { cityName = locality.long_name; return true; }
              return false;
            });

            // Fallback if no specific component was found
            if (!cityName) {
              const fallback = results.find((r) => !r.types.includes('plus_code')) || results[0];
              const parts = fallback.formatted_address.split(',');
              const [firstPart, secondPart] = parts;
              cityName = firstPart;
              // If the first part looks like a plus code (contains '+'), use the second part
              if (cityName.includes('+') && secondPart) {
                cityName = secondPart.trim();
              }
            }
            setLocationName(cityName);
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

      let mappedType = type;
      if (type === 'restaurants') mappedType = 'restaurant';
      else if (type === 'hotels') mappedType = 'lodging';
      else if (type === 'attractions') mappedType = 'tourist_attraction';
      else if (type === 'bars') mappedType = 'bar';
      else if (type === 'coffee') mappedType = 'cafe';
      else if (type === 'banks') mappedType = 'bank';
      else if (type === 'gas stations') mappedType = 'gas_station';
      else if (type === 'parking lots') mappedType = 'parking';
      else if (type === 'groceries') mappedType = 'supermarket';
      else if (type === 'post offices') mappedType = 'post_office';
      else if (type === 'hospitals') mappedType = 'hospital';

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

      {/* Background Map Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
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
      </div>

      {/* Floating UI Overlays */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>

        {/* Left Side List Panel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: 'white',
            pointerEvents: 'auto',
            boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
            overflowY: 'auto',
            transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
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
        </div>

        {/* Floating Top Overlays (Search & Chips) */}
        <div style={{ position: 'absolute', top: '20px', left: isDrawerOpen ? '420px' : '20px', pointerEvents: 'auto', transition: 'left 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)} />
          <CategoryChips type={type} setType={setType} rating={rating} setRating={setRating} />
        </div>

      </div>

      <AIAssistant coords={coords} locationName={locationName} places={places} />
    </>
  );
};

export default App;
