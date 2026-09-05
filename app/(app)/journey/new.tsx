import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from '../../../services/api';
import { RouteSummary, TransportMode, calculateCheckInInterval } from '../../../services/routing';
import { JourneyTemplate, loadTemplates, saveTemplate, deleteTemplate } from '../../../services/templates';
import { WizardShell } from '../../../components/journey-wizard/WizardShell';
import { StepDestination } from '../../../components/journey-wizard/StepDestination';
import { StepRoute } from '../../../components/journey-wizard/StepRoute';
import { StepContacts } from '../../../components/journey-wizard/StepContacts';
import { StepReview } from '../../../components/journey-wizard/StepReview';

type Place = { label: string; latitude: number; longitude: number };

export default function CreateJourneyScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [trustedContactsList, setTrustedContactsList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<JourneyTemplate[]>([]);

  const [name, setName] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadTemplates().then(setTemplates);
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for journeys.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/contacts');
        if (response.data.success) {
          setTrustedContactsList(response.data.data);
          // Default to all contacts selected — most journeys want everyone notified;
          // unchecking specific people is the exception, not the common case.
          setSelectedContactIds(new Set(response.data.data.map((c: any) => c._id)));
        }
      } catch (err) {
        console.error('Failed to load trusted contacts', err);
      }
    })();
  }, []);

  const goBack = useCallback(() => {
    if (step === 0) {
      router.back();
    } else {
      // Changing mode/destination invalidates any route already picked for the old inputs.
      if (step === 1) setSelectedRoute(null);
      setStep((s) => s - 1);
    }
  }, [step, router]);

  const handleApplyTemplate = (template: JourneyTemplate) => {
    setName(template.name);
    setPlace(
      template.placeLatitude && template.placeLongitude
        ? { label: template.destination, latitude: template.placeLatitude, longitude: template.placeLongitude }
        : null
    );
    setTransportMode(template.transportMode);
  };

  const handleDeleteTemplate = async (id: string) => {
    setTemplates(await deleteTemplate(id));
  };

  const handleSaveTemplate = async () => {
    if (!name || !place) return;
    await saveTemplate({
      name,
      destination: place.label,
      placeLatitude: place.latitude,
      placeLongitude: place.longitude,
      transportMode,
    });
    setTemplates(await loadTemplates());
    Alert.alert('Saved', `"${name}" saved as a template for quick reuse.`);
  };

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  };

  const handleStart = async () => {
    if (!place || !selectedRoute) return;
    setIsStarting(true);
    try {
      const response = await api.post('/journeys', {
        name,
        destination: {
          address: place.label,
          latitude: place.latitude,
          longitude: place.longitude,
        },
        estimatedDuration: selectedRoute.durationMinutes,
        checkInInterval: calculateCheckInInterval(selectedRoute.durationMinutes),
        transportMode,
        trustedContacts: Array.from(selectedContactIds),
      });

      const journeyId = response.data.data._id;

      await api.post(`/journeys/${journeyId}/start`, {
        startLocation: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        } : null,
      });

      router.replace(`/(app)/journey/${journeyId}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to start journey');
      setIsStarting(false);
    }
  };

  return (
    <WizardShell step={step} onBack={goBack}>
      {step === 0 && (
        <StepDestination
          name={name}
          place={place}
          location={location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null}
          templates={templates}
          onChangeName={setName}
          onSelectPlace={setPlace}
          onApplyTemplate={handleApplyTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && location && place && (
        <StepRoute
          origin={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
          destination={{ latitude: place.latitude, longitude: place.longitude }}
          transportMode={transportMode}
          selectedRoute={selectedRoute}
          onChangeMode={setTransportMode}
          onSelectRoute={setSelectedRoute}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepContacts
          contacts={trustedContactsList}
          selectedIds={selectedContactIds}
          onToggle={toggleContact}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && place && selectedRoute && (
        <StepReview
          name={name}
          destinationLabel={place.label}
          transportMode={transportMode}
          route={selectedRoute}
          contacts={trustedContactsList}
          selectedContactIds={selectedContactIds}
          isStarting={isStarting}
          onEditDestination={() => setStep(0)}
          onEditRoute={() => setStep(1)}
          onEditContacts={() => setStep(2)}
          onSaveTemplate={handleSaveTemplate}
          onStart={handleStart}
        />
      )}
    </WizardShell>
  );
}
