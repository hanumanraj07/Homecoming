import * as Contacts from 'expo-contacts';
import { useCallback, useState } from 'react';

export function useContacts() {
  const [status, setStatus] = useState('undetermined');
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status: permissionStatus } = await Contacts.requestPermissionsAsync();
      setStatus(permissionStatus);

      if (permissionStatus !== 'granted') {
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      setContacts(data.filter((contact) => contact.phoneNumbers?.length));
    } catch (err) {
      setError(err.message ?? 'Could not load contacts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { status, contacts, isLoading, error, load };
}
