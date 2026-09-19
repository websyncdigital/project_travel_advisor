import React, { useState, useEffect } from 'react';
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
  if (!category) return '#facc15';
  const cat = category.toLowerCase();
  if (cat.includes('good')) return '#4ade80';
  if (cat.includes('moderate')) return '#facc15';
  if (cat.includes('unhealthy')) return '#f87171';
  return '#facc15';
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
}) => {
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

  // Extract Temperature
  let temp = null;
  if (weatherData?.temperature?.degrees != null) {
    temp = Math.round(weatherData.temperature.degrees);
  } else if (weatherData?.currentConditions?.temperatureC != null) {
    temp = Math.round(weatherData.currentConditions.temperatureC);
  } else if (typeof weatherData?.main?.temp === 'number') {
    temp = Math.round(weatherData.main.temp);
  }

  // Extract Condition
  let condition = 'clear skies';
  if (weatherData?.weatherCondition?.description) {
    condition = weatherData.weatherCondition.description.toLowerCase();
  } else if (weatherData?.weatherCondition?.type) {
    const rawType = weatherData.weatherCondition.type.toLowerCase().replace(/_/g, ' ');
    condition = rawType === 'clear' ? 'clear skies' : rawType;
  } else if (weatherData?.currentConditions?.condition) {
    condition = weatherData.currentConditions.condition.toLowerCase();
  } else if (weatherData?.weather?.[0]?.description) {
    condition = weatherData.weather[0].description.toLowerCase();
  }

  const aqiCategory = airQuality?.category || 'Moderate air quality';
  const aqiScore = airQuality?.aqi || airQuality?.aqiDisplay || null;

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography variant="h4" style={{ fontWeight: 700, color: '#f8fafc' }}>
        Trip Dashboard
      </Typography>

      {/* Weather, Local Time & Environment Card */}
      <Card elevation={0} style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent style={{ padding: '16px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="8px">
            <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
              <CloudIcon color="primary" fontSize="small" /> Weather at {destinationName || startingLocationName || locationName || 'Current Location'}
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

      {/* Interactive Journey Timeline */}
      <Paper elevation={0} style={{ padding: '16px', flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>
          Your Journey
        </Typography>
        <Timeline align="left" style={{ padding: 0 }}>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><LocationOnIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">Start</Typography>
              <Typography color="textSecondary" variant="body2">{startingLocationName || 'Current Location'}</Typography>
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
              <Typography color="textSecondary" variant="body2">{destinationName || 'Select a destination'}</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* AI Smart Recommendations */}
      <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExploreIcon color="secondary" /> AI Recommendations
        </Typography>
        <Divider style={{ marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {aiRecommendations && aiRecommendations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiRecommendations.map((rec, i) => (
              <PlaceDetails
                key={i}
                place={rec}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
              />
            ))}
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            AI is analyzing the area to provide personalized recommendations...
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default Dashboard;
