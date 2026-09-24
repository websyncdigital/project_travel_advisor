import React, { useState, useEffect, useMemo, createRef } from 'react';
import { Typography, Paper, CircularProgress, Card, CardContent, Box, IconButton, Tooltip } from '@material-ui/core';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@material-ui/lab';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DriveEtaIcon from '@material-ui/icons/DriveEta';
import CloudIcon from '@material-ui/icons/Cloud';
import ExploreIcon from '@material-ui/icons/Explore';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import EcoIcon from '@material-ui/icons/Eco';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import StarsIcon from '@material-ui/icons/Stars';
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

const generateAiSuggestions = (placesList, categoryType = 'restaurants', location = 'Kunnamangalam', aiPicks = []) => {
  if (!placesList || placesList.length === 0) return [];

  const analyzed = placesList.map((place, index) => {
    const rating = Number(place.rating) || 0;
    const reviews = Number(place.num_reviews || place.user_ratings_total) || 0;
    const priceLevel = place.price_level !== undefined && place.price_level !== null ? Number(place.price_level) : null;
    const isAiPicked = Boolean(aiPicks && aiPicks.some((pick) => pick.name === place.name || (pick.place_id && pick.place_id === place.place_id)));

    // 1. Rating score (0 - 45 points)
    const ratingScore = rating > 0 ? (rating / 5.0) * 45 : 20;

    // 2. Review volume confidence score (0 - 30 points)
    const reviewScore = reviews > 0 ? Math.min(30, Math.log10(reviews + 1) * 8.5) : 5;

    // 3. Price-to-quality & value score (0 - 15 points)
    let priceScore = 10;
    let priceLabel = '';
    if (priceLevel === 1) {
      priceScore = 15;
      priceLabel = 'budget-friendly ($)';
    } else if (priceLevel === 2) {
      priceScore = 13;
      priceLabel = 'great value ($$)';
    } else if (priceLevel === 3) {
      priceScore = 9;
      priceLabel = 'upscale ($$$)';
    } else if (priceLevel >= 4) {
      priceScore = 7;
      priceLabel = 'premium ($$$$)';
    }

    // 4. Service & operational reliability score (0 - 10 points)
    const serviceScore = (place.opening_hours?.open_now ? 3 : 1)
      + (place.photos && place.photos.length > 0 ? 3 : 0)
      + (isAiPicked ? 4 : 2);

    const rawTotal = ratingScore + reviewScore + priceScore + serviceScore;
    const aiMatchScore = Math.min(99, Math.max(75, Math.round(rawTotal)));

    // AI Badge determination
    let aiBadge = '🎯 AI Recommended';
    if (isAiPicked) {
      aiBadge = '✨ Gemini AI Top Pick';
    } else if (rating >= 4.0 && reviews >= 300) {
      aiBadge = '⭐ Top Rated & Most Popular';
    } else if (rating >= 4.3) {
      aiBadge = '🌟 Exceptional Quality';
    } else if (priceScore >= 12 && rating >= 3.8) {
      aiBadge = '💎 Best Value for Money';
    } else if (reviews >= 100) {
      aiBadge = '🔥 Community Favorite';
    }

    // Category-specific AI analysis explanation factoring in ratings, reviews, price-to-quality, and service
    let analysisExplanation = '';
    const ratingText = rating > 0 ? `${rating.toFixed(1)}★ rating` : 'favorable feedback';
    const reviewsText = reviews > 0 ? `${reviews.toLocaleString()} verified reviews` : 'local visitor listings';
    const priceText = priceLabel ? ` with ${priceLabel}` : '';

    const catKey = (categoryType || '').toLowerCase();
    if (catKey.includes('restaurant') || catKey.includes('cafe') || catKey.includes('bar') || catKey.includes('coffee')) {
      analysisExplanation = `Analyzed ${ratingText} across ${reviewsText}${priceText}. Highly rated for food quality, dependable service, and great value in ${location}.`;
    } else if (catKey.includes('hotel') || catKey.includes('lodging')) {
      analysisExplanation = `Evaluated ${ratingText} backed by ${reviewsText}${priceText}. Top recommendation for guest satisfaction, attentive service, and comfort.`;
    } else if (catKey.includes('attraction') || catKey.includes('things to do') || catKey.includes('museum')) {
      analysisExplanation = `Scored ${ratingText} with ${reviewsText}. Outstanding visitor satisfaction index for activities, service, and sightseeing.`;
    } else if (catKey.includes('pharmacy') || catKey.includes('hospital')) {
      analysisExplanation = `Verified ${ratingText} and ${reviewsText}. High community trust rating, reliable service, and medical care in ${location}.`;
    } else if (catKey.includes('atm') || catKey.includes('bank')) {
      analysisExplanation = `Rated ${ratingText} across ${reviewsText}. Excellent accessibility, operational reliability, and dependable banking service.`;
    } else if (catKey.includes('gas') || catKey.includes('parking')) {
      analysisExplanation = `Calculated ${ratingText} from ${reviewsText}${priceText}. Prompt service rating, clean amenities, and high commuter dependability.`;
    } else if (catKey.includes('grocer') || catKey.includes('supermarket') || catKey.includes('post')) {
      analysisExplanation = `Assessed ${ratingText} across ${reviewsText}. Strong local community recommendations for product freshness, convenience, and service.`;
    } else {
      analysisExplanation = `AI evaluated ${ratingText} and ${reviewsText}${priceText}. Top performance across quality, value, and service metrics.`;
    }

    return {
      ...place,
      originalIndex: index,
      aiMatchScore,
      aiBadge,
      aiAnalysis: analysisExplanation,
      sortScore: rawTotal,
    };
  });

  // Sort by AI score descending and display ONLY the top 5 AI suggestions
  analyzed.sort((a, b) => b.sortScore - a.sortScore);
  return analyzed.slice(0, 5);
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
  suggestedPlaces: propSuggestedPlaces,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  type,
  childClicked,
  dashboardWidth = 400,
  setDashboardWidth,
}) => {
  const currentPlaceName = locationName || startingLocationName || 'Kunnamangalam';
  const [localActiveTab, setLocalActiveTab] = useState('all');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  const [elRefs, setElRefs] = useState([]);
  const [suggestionRefs, setSuggestionRefs] = useState([]);

  const suggestedPlaces = useMemo(() => (
    propSuggestedPlaces || generateAiSuggestions(places, type, currentPlaceName, aiRecommendations)
  ), [propSuggestedPlaces, places, type, currentPlaceName, aiRecommendations]);

  useEffect(() => {
    setElRefs((refs) => Array(places?.length || 0).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  useEffect(() => {
    setSuggestionRefs((refs) => Array(suggestedPlaces?.length || 0).fill().map((_, i) => refs[i] || createRef()));
  }, [suggestedPlaces]);

  useEffect(() => {
    if (!childClicked) return;

    if (activeTab === 'suggestions') {
      if (!suggestedPlaces || suggestedPlaces.length === 0) return;
      const selectedIndex = suggestedPlaces.findIndex((p, idx) => (
        childClicked === idx
        || String(childClicked) === String(idx)
        || (typeof childClicked === 'object' && childClicked.index === idx)
        || (p.place_id && (childClicked === p.place_id || childClicked?.id === p.place_id))
        || (p.name && (childClicked === p.name || childClicked?.name === p.name || String(childClicked).toLowerCase() === String(p.name).toLowerCase()))
      ));

      if (selectedIndex !== -1 && suggestionRefs[selectedIndex]?.current) {
        suggestionRefs[selectedIndex].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (!places || places.length === 0) return;
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
  }, [childClicked, elRefs, suggestionRefs, places, suggestedPlaces, activeTab]);
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
      {/* 1. Header & Location Display with Width Controls */}
      <Box style={{ flexShrink: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '8px' }}>
          <Box>
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

          {/* Width Adjustment Controls */}
          {setDashboardWidth && (
            <Box display="flex" flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
              <Box
                display="flex"
                alignItems="center"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: '8px',
                  padding: '2px 4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Tooltip title="Decrease panel width (-50px)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => setDashboardWidth(dashboardWidth - 50)}
                      disabled={dashboardWidth <= 320}
                      style={{ color: dashboardWidth <= 320 ? '#475569' : '#94a3b8', padding: '4px' }}
                      aria-label="decrease panel width"
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Click to reset width to default (400px)">
                  <Typography
                    variant="caption"
                    onClick={() => setDashboardWidth(400)}
                    style={{
                      color: '#38bdf8',
                      fontWeight: 600,
                      padding: '0 6px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <AspectRatioIcon style={{ fontSize: '13px' }} /> {dashboardWidth}px
                  </Typography>
                </Tooltip>

                <Tooltip title="Increase panel width (+50px)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => setDashboardWidth(dashboardWidth + 50)}
                      disabled={dashboardWidth >= 850}
                      style={{ color: dashboardWidth >= 850 ? '#475569' : '#94a3b8', padding: '4px' }}
                      aria-label="increase panel width"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {/* Quick Width Presets */}
              <Box display="flex" style={{ gap: '4px' }}>
                {[
                  { label: 'Compact', width: 340 },
                  { label: 'Default', width: 400 },
                  { label: 'Wide', width: 550 },
                  { label: 'Max', width: 720 },
                ].map((preset) => {
                  const isActive = Math.abs(dashboardWidth - preset.width) < 25;
                  return (
                    <Typography
                      key={preset.label}
                      variant="caption"
                      onClick={() => setDashboardWidth(preset.width)}
                      style={{
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#38bdf8' : '#64748b',
                        backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {preset.label}
                    </Typography>
                  );
                })}
              </Box>
            </Box>
          )}
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

      {/* 4. Places List & Suggestions Tabs for Selected Category */}
      <Box style={{ flexShrink: 0 }}>
        {/* Category Places vs AI Suggestions Tab Switcher - Frozen/Sticky Header */}
        <Box
          style={{
            position: 'sticky',
            top: '-20px',
            zIndex: 30,
            backgroundColor: '#0f172a',
            paddingTop: '20px',
            paddingBottom: '12px',
            marginLeft: '-20px',
            marginRight: '-20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.5)',
            marginBottom: '16px',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            style={{
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Tab 1: Category Name (Count) */}
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'all' ? 700 : 500,
                color: activeTab === 'all' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'all' ? '#2563eb' : 'transparent',
                boxShadow: activeTab === 'all' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ExploreIcon style={{ fontSize: '16px', color: activeTab === 'all' ? '#ffffff' : '#60a5fa' }} />
              <span>{categoryTitles[type] || 'Places'}</span>
              <span
                style={{
                  backgroundColor: activeTab === 'all' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                  color: activeTab === 'all' ? '#ffffff' : '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {places?.length || 0}
              </span>
            </button>

            {/* Tab 2: Suggestions */}
            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'suggestions' ? 700 : 500,
                color: activeTab === 'suggestions' ? '#ffffff' : '#94a3b8',
                background: activeTab === 'suggestions' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                boxShadow: activeTab === 'suggestions' ? '0 2px 10px rgba(124, 58, 237, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <StarsIcon style={{ fontSize: '16px', color: activeTab === 'suggestions' ? '#fbbf24' : '#a78bfa' }} />
              <span>Suggestions</span>
              <span
                style={{
                  backgroundColor: activeTab === 'suggestions' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(124, 58, 237, 0.2)',
                  color: activeTab === 'suggestions' ? '#ffffff' : '#c4b5fd',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {suggestedPlaces.length}
              </span>
            </button>
          </Box>
        </Box>

        {activeTab === 'suggestions' ? (
          <div>
            {/* AI Summary Banner */}
            <Box
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <Box display="flex" alignItems="center" gap="6px" marginBottom="4px">
                <StarsIcon style={{ color: '#fbbf24', fontSize: '18px' }} />
                <Typography variant="subtitle2" style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>
                  Top 5 AI Suggestions
                </Typography>
              </Box>
              <Typography variant="body2" style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.45 }}>
                AI evaluated ratings, customer reviews, price-to-quality, and service consistency to select the top 5 {categoryTitles[type] || 'places'} in {currentPlaceName}.
              </Typography>
            </Box>

            {/* Suggestions List (Top 5) */}
            {suggestedPlaces && suggestedPlaces.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {suggestedPlaces.map((place, i) => {
                  const isSelected = Boolean(
                    childClicked && (
                      childClicked === i
                      || String(childClicked) === String(i)
                      || (typeof childClicked === 'object' && (childClicked.index === i || childClicked.index === place.originalIndex))
                      || (place.place_id && (childClicked === place.place_id || childClicked?.id === place.place_id))
                      || (place.name && (childClicked === place.name || childClicked?.name === place.name || String(childClicked).toLowerCase() === String(place.name).toLowerCase()))
                    ),
                  );

                  return (
                    <div ref={suggestionRefs[i]} key={place.place_id || i} style={{ scrollMarginTop: '80px' }}>
                      {/* AI Analysis Tag with Rank */}
                      <Box
                        style={{
                          backgroundColor: 'rgba(30, 27, 75, 0.85)',
                          border: '1px solid rgba(139, 92, 246, 0.35)',
                          borderBottom: 'none',
                          borderTopLeftRadius: '12px',
                          borderTopRightRadius: '12px',
                          padding: '10px 14px',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="4px">
                          <Box display="flex" alignItems="center" gap="6px">
                            <span
                              style={{
                                backgroundColor: '#fbbf24',
                                color: '#0f172a',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                lineHeight: '1.2',
                              }}
                            >
                              #{i + 1}
                            </span>
                            <StarsIcon style={{ color: '#fbbf24', fontSize: '16px' }} />
                            <Typography variant="subtitle2" style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '0.82rem' }}>
                              {place.aiBadge}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.3)',
                              color: '#e9d5ff',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              border: '1px solid rgba(168, 85, 247, 0.4)',
                            }}
                          >
                            {place.aiMatchScore}% AI Match
                          </Typography>
                        </Box>
                        <Typography variant="body2" style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4 }}>
                          {place.aiAnalysis}
                        </Typography>
                      </Box>

                      <PlaceDetails
                        place={place}
                        selected={isSelected}
                        refProp={suggestionRefs[i]}
                        isAiPick
                        selectedDestination={selectedDestination}
                        setSelectedDestination={setSelectedDestination}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Typography variant="body2" color="textSecondary">
                {isLoading ? 'AI analyzing nearby places...' : `No AI suggestions available for ${categoryTitles[type]?.toLowerCase() || 'places'} right now.`}
              </Typography>
            )}
          </div>
        ) : (
          <div>
            {/* Standard Category Places List */}
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
                    <div ref={elRefs[i]} key={place.place_id || i} style={{ scrollMarginTop: '80px' }}>
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
          </div>
        )}
      </Box>
    </div>
  );
};

export default Dashboard;
