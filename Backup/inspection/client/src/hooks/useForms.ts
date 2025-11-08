import { useState, useEffect } from 'react';
import axios from 'axios';

interface Form {
  id: number;
  file_no: string;
  reference_no: string;
  occupancy_name: string;
  facility_nature: string;
  service_type: string;
  preview_date: string;
  status: 'draft' | 'pending' | 'completed';
  created_at: string;
}

export const useForms = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/api/forms');
        setForms(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب النماذج');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return { forms, loading, error };
}; 