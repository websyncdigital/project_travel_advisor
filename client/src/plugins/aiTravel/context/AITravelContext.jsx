import React, { createContext, useContext, useState } from 'react';

const AITravelContext = createContext(null);

export const AITravelProvider = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isVoiceCopilotActive, setIsVoiceCopilotActive] = useState(false);
  const [voiceCopilotMessage, setVoiceCopilotMessage] = useState('');
  const [isLandmarkDrawerOpen, setIsLandmarkDrawerOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  const setRouteAndFetchLandmarks = async (routeGeoJson) => {
    setActiveRoute(routeGeoJson);
    try {
      const response = await fetch('http://localhost:5000/api/v1/ai-travel/search-along-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routePolyline: routeGeoJson ? routeGeoJson.geometry : 'mock_polyline',
          maxDetourMinutes: 10,
        }),
      });
      const data = await response.json();
      if (data.landmarks) setLandmarks(data.landmarks);
      if (data.venues) setVenues(data.venues);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching route landmarks:', error);
    }
  };

  const executeVoiceCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/ai-travel/voice-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command, activeRoute }),
      });
      const data = await response.json();
      setVoiceCopilotMessage(data.message);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing voice command:', error);
    }
  };

  return (
    <AITravelContext.Provider value={{
      activeRoute,
      landmarks,
      venues,
      isVoiceCopilotActive,
      setIsVoiceCopilotActive,
      voiceCopilotMessage,
      setVoiceCopilotMessage,
      isLandmarkDrawerOpen,
      setIsLandmarkDrawerOpen,
      isSearchPanelOpen,
      setIsSearchPanelOpen,
      setRouteAndFetchLandmarks,
      executeVoiceCommand,
    }}
    >
      {children}
    </AITravelContext.Provider>
  );
};

export const useAITravel = () => useContext(AITravelContext);
