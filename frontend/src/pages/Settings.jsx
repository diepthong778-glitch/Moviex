import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { authHeaders } from '../utils/api';

const applyTheme = (darkMode) => {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  localStorage.setItem('moviex.theme', darkMode ? 'dark' : 'light');
};

function Settings() {
  const { user, getToken, login } = useAuth();
  const token = getToken();
  const [form, setForm] = useState({
    language: localStorage.getItem('moviex.language') || 'en',
    darkMode: localStorage.getItem('moviex.theme') !== 'light',
    subtitle: localStorage.getItem('moviex.subtitle.enabled') !== 'false',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/users/profile', {
          headers: authHeaders(token),
        });

        const nextForm = {
          language: response.data.language || localStorage.getItem('moviex.language') || 'en',
          darkMode:
            typeof response.data.darkMode === 'boolean'
              ? response.data.darkMode
              : localStorage.getItem('moviex.theme') !== 'light',
          subtitle:
            response.data.subtitle !== undefined
              ? !!response.data.subtitle
              : localStorage.getItem('moviex.subtitle.enabled') !== 'false',
        };
        setForm(nextForm);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  useEffect(() => {
    applyTheme(form.darkMode);
    localStorage.setItem('moviex.language', form.language);
    localStorage.setItem('moviex.subtitle.enabled', String(form.subtitle));
  }, [form.darkMode, form.language, form.subtitle]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage('');

      const response = await axios.put('/api/user/settings', form, {
        headers: authHeaders(token),
      });

      login({ ...user, ...response.data, ...form });
      setMessage('Settings saved.');
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <p className="muted-text">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Accessibility and playback preferences</p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label className="field-row">
          <span>Language</span>
          <select name="language" value={form.language} onChange={handleChange} className="field-control">
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
            <option value="ja">Japanese</option>
          </select>
        </label>

        <label className="field-row switch-row">
          <span>Dark Mode</span>
          <input type="checkbox" name="darkMode" checked={form.darkMode} onChange={handleChange} />
        </label>

        <label className="field-row switch-row">
          <span>Subtitles</span>
          <input type="checkbox" name="subtitle" checked={form.subtitle} onChange={handleChange} />
        </label>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {message && <p className="muted-text">{message}</p>}
      </form>
    </div>
  );
}

export default Settings;
