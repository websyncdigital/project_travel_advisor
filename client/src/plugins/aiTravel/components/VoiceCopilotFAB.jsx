import React, { useState } from 'react';
import { Fab, Snackbar } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import { useAITravel } from '../context/AITravelContext';

const VoiceCopilotFAB = () => {
  const { isVoiceCopilotActive, setIsVoiceCopilotActive, voiceCopilotMessage, setVoiceCopilotMessage, executeVoiceCommand } = useAITravel();
  const [pulse, setPulse] = useState(false);

  const handleVoiceClick = async () => {
    setIsVoiceCopilotActive(!isVoiceCopilotActive);
    if (!isVoiceCopilotActive) {
      setPulse(true);
      // Simulate listening and then processing
      setTimeout(() => {
        setPulse(false);
        setIsVoiceCopilotActive(false);
        executeVoiceCommand('Find vegetarian food with safe parking');
      }, 2000);
    } else {
      setPulse(false);
    }
  };

  return (
    <>
      <Fab
        color={pulse ? 'secondary' : 'primary'}
        style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}
        onClick={handleVoiceClick}
      >
        <MicIcon />
      </Fab>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!voiceCopilotMessage}
        autoHideDuration={4000}
        onClose={() => setVoiceCopilotMessage('')}
        message={voiceCopilotMessage}
      />
    </>
  );
};

export default VoiceCopilotFAB;
