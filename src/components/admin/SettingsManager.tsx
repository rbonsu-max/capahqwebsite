import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';

export default function SettingsManager() {
  const [settings, setSettings] = useState<any>({ logoUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings/global');
        if (data && data.value) {
          setSettings(JSON.parse(data.value));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/global', { value: JSON.stringify(settings) });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds the 5MB size limit.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.upload(file);
      setSettings((prev: any) => ({
        ...prev,
        logoUrl: res.url
      }));
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert(error instanceof Error ? error.message : "Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Global Settings</h2>
        <p className="text-slate-600">Manage site-wide settings such as the main logo.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Website Logo</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {settings.logoUrl ? (
              <div className="relative w-48 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 flex items-center justify-center p-2">
                <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-48 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 flex-shrink-0">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="flex-1 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-slate-500">Upload a transparent PNG for best results (Max 5MB).</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {(saving || uploading) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
