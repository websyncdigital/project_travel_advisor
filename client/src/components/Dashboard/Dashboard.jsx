import React, { useState, useEffect, createRef } from 'react';
import { Typography, Paper, CircularProgress, Card, CardContent, Divider, Box } from '@material-ui/core';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@material-ui/lab';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import CloudIcon from '@material-ui/icons/Cloud';
import ExploreIcon from '@material-ui/icons/Explore';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import EcoIcon from '@material-ui/icons/Eco';
import PlaceDetails from '../PlaceDetails/PlaceDetails';

const getAqiColor = (category) => {
  if (typeof category !== 'string') return '#facc15';
  const cat = category.toLowerCase();
  if (cat.includes('good')) return '#4ade80';
  if (cat.includes('moderate')) return '#facc15';
  if (cat.includes('unhealthy')) return '#f87171';
  return '#facc15';
};

const categoryTitles = {
  restaurants: 'Restaurants',
  restaurant: 'Restaurants',
  hotels: 'Hotels',
  lodging: 'Hotels',
  attractions: 'Things to do',
  tourist_attraction: 'Things to do',
  'things to do': 'Things to do',
  pharmacies: 'Pharmacies',
  pharmacy: 'Pharmacies',
  atms: 'ATMs',
  atm: 'ATMs',
  gas: 'Gas',
  'gas stations': 'Gas',
  gas_station: 'Gas',
  museums: 'Museums',
  museum: 'Museums',
  transit: 'Transit',
  transit_station: 'Transit',
  bars: 'Bars',
  bar: 'Bars',
  coffee: 'Coffee',
  cafe: 'Coffee',
  groceries: 'Groceries',
  grocery_or_supermarket: 'Groceries',
  parking: 'Parking',
  'parking lots': 'Parking',
  banks: 'Banks',
  bank: 'Banks',
  hospitals: 'Hospitals',
  hospital: 'Hospitals',
  'post offices': 'Post Offices',
  post_office: 'Post Offices',
};

const Dashboard = ({
  isLoading,
  startingLocationName,
  destinationName,
  locationName,
  weatherData,
  airQuality,
  timeZoneId,
  aiRecommendations,
  selectedDestination,
  setSelectedDestination,
  places,
  type,
  childClicked,
}) => {
  const [elRefs, setElRefs] = useState([]);

  useEffect(() => {
    setElRefs((refs) => Array(places?.length || 0).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  useEffect(() => {
    if (childClicked && places && places.length > 0) {
      const selectedIndex = places.findIndex((p, idx) => (
        childClicked === idx
        || String(childClicked) === String(idx)
        || (typeof childClicked === 'object' && childClicked.index === idx)
        || (p.place_id && (childClicked === p.place_id || childClicked?.id === p.place_id))
        || (p.name && (childClicked === p.name || childClicked?.name === p.name || String(childClicked).toLowerCase() === String(p.name).toLowerCase()))
      ));

      if (selectedIndex !== -1 && elRefs[selectedIndex]?.current) {
        elRefs[selectedIndex].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [childClicked, elRefs, places]);
  const [localTime, setLocalTime] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: timeZoneId || weatherData?.timeZone?.id || undefined,
      }).format(new Date());
    } catch (e) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        setLocalTime(new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: timeZoneId || weatherData?.timeZone?.id || undefined,
        }).format(new Date()));
      } catch (e) {
        setLocalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [timeZoneId, weatherData]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size="5rem" />
      </div>
    );
  }

  // Extract Temperature safely
  let temp = null;
  if (weatherData?.temperature?.degrees != null && !Number.isNaN(Number(weatherData.temperature.degrees))) {
    temp = Math.round(Number(weatherData.temperature.degrees));
  } else if (weatherData?.currentConditions?.temperatureC != null && !Number.isNaN(Number(weatherData.currentConditions.temperatureC))) {
    temp = Math.round(Number(weatherData.currentConditions.temperatureC));
  } else if (typeof weatherData?.main?.temp === 'number' && !Number.isNaN(weatherData.main.temp)) {
    temp = Math.round(weatherData.main.temp);
  }

  // Extract Condition safely with type guards
  let condition = 'clear skies';
  if (typeof weatherData?.weatherCondition?.description === 'string' && weatherData.weatherCondition.description) {
    condition = weatherData.weatherCondition.description.toLowerCase();
  } else if (typeof weatherData?.weatherCondition?.description?.text === 'string' && weatherData.weatherCondition.description.text) {
    condition = weatherData.weatherCondition.description.text.toLowerCase();
  } else if (typeof weatherData?.weatherCondition?.type === 'string' && weatherData.weatherCondition.type) {
    const rawType = weatherData.weatherCondition.type.toLowerCase().replace(/_/g, ' ');
    condition = rawType === 'clear' ? 'clear skies' : rawType;
  } else if (typeof weatherData?.currentConditions?.condition === 'string' && weatherData.currentConditions.condition) {
    condition = weatherData.currentConditions.condition.toLowerCase();
  } else if (typeof weatherData?.weather?.[0]?.description === 'string' && weatherData.weather[0].description) {
    condition = weatherData.weather[0].description.toLowerCase();
  }

  const aqiCategory = (typeof airQuality?.category === 'string' && airQuality.category) ? airQuality.category : 'Moderate air quality';
  const aqiScore = airQuality?.aqi || airQuality?.aqiDisplay || null;

  const currentPlaceName = locationName || startingLocationName || 'Kunnamangalam';

  return (
    <div
      style={{
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header & Location Display */}
      <Box style={{ flexShrink: 0 }}>
        <Typography variant="h4" style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.5px' }}>
          Trip Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap="6px" style={{ marginTop: '4px' }}>
          <LocationOnIcon style={{ color: '#38bdf8', fontSize: '18px' }} />
          <Typography variant="subtitle1" style={{ color: '#94a3b8', fontWeight: 600 }}>
            {currentPlaceName}
          </Typography>
        </Box>
      </Box>

      {/* 2. Weather, Local Time & Environment Card */}
      <Card
        elevation={0}
        style={{
          flexShrink: 0,
          backgroundColor: 'rgba(30, 41, 59, 0.75)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CardContent style={{ padding: '16px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="8px">
            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
              <CloudIcon color="primary" fontSize="small" /> Weather at {currentPlaceName}
            </Typography>
            <Typography variant="caption" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
              <AccessTimeIcon style={{ fontSize: '14px' }} /> {localTime}
            </Typography>
          </Box>

          <Typography variant="body1" style={{ color: '#e2e8f0', marginBottom: '10px' }}>
            {temp !== null ? `Currently ${temp}°C with ${condition}.` : 'Loading weather data...'}
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="space-between" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
            <Box display="flex" alignItems="center" gap="6px">
              <EcoIcon style={{ color: getAqiColor(aqiCategory), fontSize: '18px' }} />
              <Typography variant="body2" style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                AQI: <strong style={{ color: getAqiColor(aqiCategory) }}>{aqiCategory}</strong>
                {aqiScore ? ` (${aqiScore})` : ''}
              </Typography>
            </Box>
            <Typography variant="caption" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              Local Time: {localTime}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Interactive Journey Timeline */}
      <Paper
        elevation={0}
        style={{
          padding: '16px',
          flexShrink: 0,
          borderRadius: '12px',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Typography variant="h6" gutterBottom style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
          Your Journey
        </Typography>
        <Timeline align="left" style={{ padding: 0, margin: 0 }}>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><LocationOnIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">Start</Typography>
              <Typography color="textSecondary" variant="body2">Current Location ({currentPlaceName})</Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary"><DriveEtaIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">En Route</Typography>
              <Typography color="textSecondary" variant="body2">Travel time based on traffic</Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><ExploreIcon /></TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">Destination</Typography>
              <Typography color="textSecondary" variant="body2">{destinationName || currentPlaceName || 'Select a destination'}</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* 4. Places List for Selected Category */}
      <Box style={{ flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
          <ExploreIcon color="secondary" fontSize="small" /> {categoryTitles[type] || 'Places'} {places && places.length > 0 ? `(${places.length})` : ''}
        </Typography>
        <Divider style={{ marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {places && places.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {places.map((place, i) => {
              const isSelected = Boolean(
                childClicked && (
                  childClicked === i
                  || String(childClicked) === String(i)
                  || (typeof childClicked === 'object' && childClicked.index === i)
                  || (place.place_id && (childClicked === place.place_id || childClicked?.id === place.place_id))
                  || (place.name && (childClicked === place.name || childClicked?.name === place.name || String(childClicked).toLowerCase() === String(place.name).toLowerCase()))
                ),
              );

              return (
                <div ref={elRefs[i]} key={place.place_id || i} style={{ scrollMarginTop: '16px' }}>
                  <PlaceDetails
                    place={place}
                    selected={isSelected}
                    refProp={elRefs[i]}
                    isAiPick={Boolean(aiRecommendations?.some((rec) => rec.name === place.name))}
                    selectedDestination={selectedDestination}
                    setSelectedDestination={setSelectedDestination}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            {isLoading ? 'Searching nearby places...' : `No ${categoryTitles[type]?.toLowerCase() || 'places'} found in this area.`}
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default Dashboard;
