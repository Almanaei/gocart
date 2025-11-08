import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to replace React Router v6's removed Prompt component
 * @param {boolean} when - Condition to show the prompt
 * @param {string} message - Message to display
 */
export function usePrompt(when, message) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  
  // Use refs to track values without causing re-renders
  const whenRef = useRef(when);
  const confirmedRef = useRef(confirmedNavigation);
  const lastLocationRef = useRef(lastLocation);
  
  // Update refs when values change
  useEffect(() => {
    whenRef.current = when;
    confirmedRef.current = confirmedNavigation;
    lastLocationRef.current = lastLocation;
  }, [when, confirmedNavigation, lastLocation]);

  const cancelNavigation = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const confirmNavigation = useCallback(() => {
    setShowPrompt(false);
    setConfirmedNavigation(true);
  }, []);

  // Separate effect for navigation to prevent render loops
  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation.pathname);
      
      // Reset after navigation
      setConfirmedNavigation(false);
      setLastLocation(null);
    }
  }, [confirmedNavigation, lastLocation, navigate]);

  // Handle window.beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (whenRef.current) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);

  return { 
    showPrompt, 
    confirmNavigation, 
    cancelNavigation,
    setLastLocation,
    setShowPrompt
  };
} 