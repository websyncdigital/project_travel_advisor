import React, { useState, useEffect } from 'react';
import { CssBaseline, Paper } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';

import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Map from './components/Map/Map';
import CategoryChips from './components/CategoryChips/CategoryChips';
import AIAssistant from './components/AIAssistant/AIAssistant';
import theme from './theme';
import { getSilentRecommendations } from './api/ai';

// AI Travel Plugin Integrations
import { AITravelProvider } from './plugins/aiTravel/context/AITravelContext';
import PreRideLandmarkDrawer from './plugins/aiTravel/components/PreRideLandmarkDrawer';
import IsochronalSearchPanel from './plugins/aiTravel/components/IsochronalSearchPanel';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({ lat: 11.3064, lng: 75.8650 });
  const [bounds, setBounds] = useState(null);

  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [timeZoneId, setTimeZoneId] = useState('Asia/Calcutta');
  const [locationName, setLocationName] = useState('Kunnamangalam');

  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
      },
      () => {
        // Default coordinates (Kunnamangalam)
        setCoords({ lat: 11.3064, lng: 75.8650 });
      },
    );
  }, []);

  useEffect(() => {
    if (coords.lat && coords.lng) {
      // 1. Weather API (Google Weather with Open-Meteo fallback)
      fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&location.latitude=${coords.lat}&location.longitude=${coords.lng}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && (data.temperature || data.currentConditions)) {
            setWeatherData(data);
          } else {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`)
              .then((res) => res.json())
              .then((om) => {
                if (om?.current_weather) {
                  setWeatherData({
                    temperature: { degrees: om.current_weather.temperature, unit: 'CELSIUS' },
                    weatherCondition: { type: 'PARTLY_CLOUDY' },
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`)
            .then((res) => res.json())
            .then((om) => {
              if (om?.current_weather) {
                setWeatherData({
                  temperature: { degrees: om.current_weather.temperature, unit: 'CELSIUS' },
                  weatherCondition: { type: 'PARTLY_CLOUDY' },
                });
              }
            })
            .catch(() => {});
        });

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
          } else {
            setAirQuality({ category: 'Moderate air quality', aqi: 52 });
          }
        })
        .catch(() => {
          setAirQuality({ category: 'Moderate air quality', aqi: 52 });
        });

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
          if (status === 'OK' && results && results.length > 0) {
            let cityName = '';
            // Priority 1: Check across all results if address mentions Kunnamangalam
            for (let i = 0; i < results.length; i += 1) {
              const km = results[i].address_components?.find((c) => c.long_name && c.long_name.toLowerCase().includes('kunnamangalam'));
              if (km) {
                cityName = 'Kunnamangalam';
                break;
              }
            }

            // Priority 2: Look for locality or sublocality, avoiding micro-landmarks like 'Mana'
            if (!cityName) {
              for (let i = 0; i < results.length; i += 1) {
                const loc = results[i].address_components?.find(
                  (c) => (c.types.includes('locality') || c.types.includes('sublocality_level_1'))
                    && !c.types.includes('plus_code')
                    && !c.long_name.toLowerCase().includes('mana'),
                );
                if (loc) {
                  cityName = loc.long_name;
                  break;
                }
              }
            }

            // Fallback default to Kunnamangalam
            if (!cityName) {
              cityName = 'Kunnamangalam';
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

  const [aiRecommendations, setAiRecommendations] = useState([]);

  useEffect(() => {
    if (places && places.length > 0 && weatherData) {
      getSilentRecommendations({ coords, locationName, weatherData, places }).then((recs) => {
        setAiRecommendations(recs);
      });
    }
  }, [places, weatherData, locationName]);

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
    <ThemeProvider theme={theme}>
      <AITravelProvider>
        <CssBaseline />

        {/* Background Map Layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
          <Map
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

          {/* Left Side Dashboard Panel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '400px',
              height: '100vh',
              pointerEvents: 'auto',
              overflowY: 'hidden',
              transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-in-out',
              zIndex: 10,
            }}
          >
            <Paper elevation={0} style={{ width: '100%', height: '100%', borderRadius: 0 }}>
              <Dashboard
                isLoading={isLoading}
                startingLocationName={locationName || 'Kunnamangalam'}
                destinationName={selectedDestination ? (selectedDestination.name || selectedDestination.formatted_address) : (locationName || 'Kunnamangalam')}
                locationName={locationName || 'Kunnamangalam'}
                weatherData={weatherData}
                airQuality={airQuality}
                timeZoneId={timeZoneId}
                aiRecommendations={aiRecommendations}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
              />
            </Paper>
          </div>

          {/* Floating Top Overlays (Search & Chips) */}
          <div style={{ position: 'absolute', top: '20px', left: isDrawerOpen ? '420px' : '20px', pointerEvents: 'auto', transition: 'left 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)} />
            <CategoryChips type={type} setType={setType} rating={rating} setRating={setRating} />
          </div>

        </div>

        <AIAssistant coords={coords} locationName={locationName} places={places} />

        {/* AI Travel Guide Components */}
        <PreRideLandmarkDrawer />
        <IsochronalSearchPanel />
      </AITravelProvider>
    </ThemeProvider>
  );
};

export default App;
