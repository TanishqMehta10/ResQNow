import React, { useMemo, useState } from 'react';
import { X, FileText, MapPin, Calendar } from 'lucide-react';
import { useRealtimeStore } from '../../store/realtime';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function EFIRPanel({ open, onClose }: Props) {
  const userId = useMemo(() => {
    try {
      const raw = localStorage.getItem('mockTourist');
      if (!raw) return 'T001234';
      const parsed = JSON.parse(raw);
      return parsed.id || 'T001234';
    } catch {
      return 'T001234';
    }
  }, []);
  const lastPosition = useRealtimeStore((s) => s.tourists[userId]?.lastPosition);
  const [form, setForm] = useState({
    type: 'Theft',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  if (!open) return null;

  const submit = () => {
    if (!form.description.trim()) {
      alert('Please describe the incident.');
      return;
    }
    // Build E-FIR record and persist locally for authority dashboard
    try {
      const timestamp = Date.now();
      const touristRaw = localStorage.getItem('mockTourist');
      const tourist = touristRaw ? JSON.parse(touristRaw) : { id: userId, name: 'Tourist', email: 'guest@example.com', phone: '', nationality: '' };
      const allVideos = JSON.parse(localStorage.getItem('emergencyVideos') || '[]');
      const recentVideos = allVideos.filter((v: any) => v.touristId === (tourist.id || userId) && timestamp - v.timestamp < 1000 * 60 * 60);
      const record = {
        id: `FIR${timestamp}`,
        touristId: tourist.id || userId,
        touristName: tourist.name || 'Tourist',
        touristEmail: tourist.email || '',
        touristPhone: tourist.phone || '',
        touristNationality: tourist.nationality || '',
        type: form.type,
        date: form.date,
        description: form.description.trim(),
        timestamp,
        location: lastPosition || null,
        evidenceLogs: recentVideos.map((v: any) => ({ id: v.id, type: 'video', url: v.videoUrl, timestamp: v.timestamp })),
        status: 'pending' as const,
      };
      const existing = JSON.parse(localStorage.getItem('efirs') || '[]');
      existing.unshift(record);
      localStorage.setItem('efirs', JSON.stringify(existing));
      // Notify authority dashboard in real time
      try { (window as any).bus?.emit('efir:submitted', record); } catch {}
      alert('E-FIR drafted and sent for review. You will receive confirmation soon.');
    } catch (e) {
      console.error('EFIR submit failed', e);
      alert('Failed to submit E-FIR. Please try again.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div className="w-full md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-gray-800">E‑FIR</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Incident Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2">
                <option>Theft</option>
                <option>Harassment</option>
                <option>Assault</option>
                <option>Lost Documents</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Date</label>
              <div className="flex items-center border rounded-lg px-3 mt-1">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full py-2 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Location</label>
            <div className="flex items-center border rounded-lg px-3 mt-1 py-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              {lastPosition ? `${lastPosition.lat.toFixed(5)}, ${lastPosition.lng.toFixed(5)}` : 'Not available'}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full mt-1 border rounded-lg px-3 py-2" placeholder="Describe what happened"></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white">Submit E‑FIR</button>
          </div>
        </div>
      </div>
    </div>
  );
}


