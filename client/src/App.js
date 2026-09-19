import React, { useState, useEffect, useMemo } from 'react';
import { CssBaseline, Paper } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';

import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Map from './components/Map/Map';
import CategoryChips from './components/CategoryChips/CategoryChips';
import AIAssistant from './components/AIAssistant/AIAssistant';
import theme from './theme';
import { getSilentRecommendations, generateAiSuggestions } from './api/ai';

// AI Travel Plugin Integrations
import { AITravelProvider } from './plugins/aiTravel/context/AITravelContext';
import PreRideLandmarkDrawer from './plugins/aiTravel/components/PreRideLandmarkDrawer';
import IsochronalSearchPanel from './plugins/aiTravel/components/IsochronalSearchPanel';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({ lat: 11.3064, lng: 75.8650 });
  const [, setBounds] = useState(null);

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
  const [childClicked, setChildClicked] = useState(null);
  const [dashboardWidth, setDashboardWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_advisor_dashboard_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed >= 320 && parsed <= 900) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return 400;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleUpdateDashboardWidth = (newWidth) => {
    const minW = 320;
    const maxW = Math.min(850, Math.floor(window.innerWidth * 0.75));
    const clamped = Math.max(minW, Math.min(maxW, Math.round(newWidth)));
    setDashboardWidth(clamped);
  };

  useEffect(() => {
    try {
      localStorage.setItem('travel_advisor_dashboard_width', dashboardWidth.toString());
    } catch (e) {
      // ignore
    }
  }, [dashboardWidth]);

  useEffect(() => {
    if (!isResizing) return () => {};

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (typeof clientX !== 'number') return;
      const minW = 320;
      const maxW = Math.min(850, Math.floor(window.innerWidth * 0.75));
      const clamped = Math.max(minW, Math.min(maxW, clientX));
      setDashboardWidth(clamped);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!navigator.geolocation) return () => {};

    let lastLat = 11.3064;
    let lastLng = 75.8650;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;

        // Ignore inaccurate desktop Wi-Fi IP readings (> 500m) that jump to Arayidathupalam on load
        if (accuracy && accuracy > 500) {
          return;
        }

        // Calculate distance moved in km
        const R = 6371;
        const dLat = (latitude - lastLat) * (Math.PI / 180);
        const dLon = (longitude - lastLng) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
          + Math.cos(lastLat * (Math.PI / 180)) * Math.cos(latitude * (Math.PI / 180))
          * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // When location moves dynamically (> 30 meters) or vehicle speed is detected:
        if (distanceKm > 0.03 || (speed && speed > 0.5)) {
          lastLat = latitude;
          lastLng = longitude;
          setCoords({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.warn('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
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
            const getDistanceKm = (lat1, lon1, lat2, lon2) => {
              const R = 6371;
              const dLat = (lat2 - lat1) * (Math.PI / 180);
              const dLon = (lon2 - lon1) * (Math.PI / 180);
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            const distFromKunnamangalam = getDistanceKm(coords.lat, coords.lng, 11.3064, 75.8650);

            let cityName = '';
            // If within 2km of Kunnamangalam, prioritize Kunnamangalam over micro-landmarks like 'Polpaya Mana'
            if (distFromKunnamangalam < 2) {
              for (let i = 0; i < results.length; i += 1) {
                const km = results[i].address_components?.find((c) => c.long_name && c.long_name.toLowerCase().includes('kunnamangalam'));
                if (km) {
                  cityName = 'Kunnamangalam';
                  break;
                }
              }
            }

            // Otherwise as the location moves, dynamically extract the new locality / sublocality / city
            if (!cityName) {
              for (let i = 0; i < results.length; i += 1) {
                const loc = results[i].address_components?.find(
                  (c) => (c.types.includes('locality') || c.types.includes('sublocality_level_1') || c.types.includes('neighborhood') || c.types.includes('administrative_area_level_2'))
                    && !c.types.includes('plus_code')
                    && !c.long_name.toLowerCase().includes('mana'),
                );
                if (loc) {
                  cityName = loc.long_name;
                  break;
                }
              }
            }

            if (!cityName && results[0]?.address_components?.[0]?.long_name) {
              cityName = results[0].address_components[0].long_name;
            }

            if (!cityName) {
              cityName = 'Kunnamangalam';
            }
            setLocationName(cityName);
          }
        });
      }
    }
  }, [coords, map]);

  useEffect(() => {
    if (rating) {
      const filtered = places.filter((place) => Number(place.rating) >= rating);
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [rating, places]);

  useEffect(() => {
    if (coords && map && !selectedDestination) {
      setIsLoading(true);

      const service = new window.google.maps.places.PlacesService(map);

      const categoryTypeMapping = {
        restaurants: 'restaurant',
        restaurant: 'restaurant',
        hotels: 'lodging',
        lodging: 'lodging',
        attractions: 'tourist_attraction',
        tourist_attraction: 'tourist_attraction',
        'things to do': 'tourist_attraction',
        pharmacies: 'pharmacy',
        pharmacy: 'pharmacy',
        atms: 'atm',
        atm: 'atm',
        gas: 'gas_station',
        'gas stations': 'gas_station',
        gas_station: 'gas_station',
        museums: 'museum',
        museum: 'museum',
        transit: 'transit_station',
        transit_station: 'transit_station',
        bars: 'bar',
        bar: 'bar',
        coffee: 'cafe',
        cafe: 'cafe',
        groceries: 'grocery_or_supermarket',
        grocery_or_supermarket: 'grocery_or_supermarket',
        parking: 'parking',
        'parking lots': 'parking',
        banks: 'bank',
        bank: 'bank',
        hospitals: 'hospital',
        hospital: 'hospital',
        'post offices': 'post_office',
        post_office: 'post_office',
      };

      const mappedType = categoryTypeMapping[type] || type;

      const request = {
        location: new window.google.maps.LatLng(coords.lat, coords.lng),
        radius: 5000,
        type: mappedType,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
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
  }, [type, map, coords, selectedDestination]);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setActiveTab('all');
  }, [type]);

  const currentPlaces = rating ? filteredPlaces : places;

  const suggestedPlaces = useMemo(() => (
    generateAiSuggestions(currentPlaces, type, locationName || 'Kunnamangalam', aiRecommendations)
  ), [currentPlaces, type, locationName, aiRecommendations]);

  const mapPlaces = useMemo(() => (
    activeTab === 'suggestions' ? suggestedPlaces : currentPlaces
  ), [activeTab, suggestedPlaces, currentPlaces]);

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
            places={mapPlaces}
            setMap={setMap}
            weatherData={weatherData}
            airQuality={airQuality}
            timeZoneId={timeZoneId}
            locationName={locationName}
            selectedDestination={selectedDestination}
            setChildClicked={setChildClicked}
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
              width: `${dashboardWidth}px`,
              height: '100vh',
              pointerEvents: 'auto',
              overflowY: 'hidden',
              transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: isResizing ? 'none' : 'transform 0.3s ease-in-out, width 0.2s ease-out',
              zIndex: 10,
            }}
          >
            <Paper elevation={0} style={{ width: '100%', height: '100%', borderRadius: 0, position: 'relative' }}>
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
                places={currentPlaces}
                suggestedPlaces={suggestedPlaces}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                type={type}
                childClicked={childClicked}
                dashboardWidth={dashboardWidth}
                setDashboardWidth={handleUpdateDashboardWidth}
              />

              {/* Vertical Resize Splitter on right edge */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
                onTouchStart={() => setIsResizing(true)}
                onDoubleClick={() => handleUpdateDashboardWidth(400)}
                title="Drag to resize Trip Dashboard width (Double-click to reset)"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '12px',
                  height: '100%',
                  cursor: 'col-resize',
                  zIndex: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isResizing ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  borderRight: isResizing ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
              >
                {/* Visual grab pill */}
                <div
                  style={{
                    width: '4px',
                    height: '36px',
                    borderRadius: '2px',
                    backgroundColor: isResizing ? '#38bdf8' : 'rgba(255, 255, 255, 0.3)',
                    boxShadow: isResizing ? '0 0 8px #38bdf8' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            </Paper>
          </div>

          {/* Fullscreen drag overlay to ensure seamless mouse movement tracking across map iframes */}
          {isResizing && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                cursor: 'col-resize',
                zIndex: 99999,
                userSelect: 'none',
                pointerEvents: 'all',
              }}
            />
          )}

          {/* Floating Top Overlays (Search & Chips) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: isDrawerOpen ? `${dashboardWidth + 20}px` : '20px',
              maxWidth: isDrawerOpen ? `calc(100vw - ${dashboardWidth + 40}px)` : 'calc(100vw - 40px)',
              pointerEvents: 'auto',
              transition: isResizing ? 'none' : 'left 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
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
