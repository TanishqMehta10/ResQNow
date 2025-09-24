import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Shield, Bell, Radio, Map, MapPin, AlertTriangle, User, LogOut, Video, Play, X, Search, Download, Target } from 'lucide-react';
import LiveMap from '../LiveMap';
import { bus, useRealtimeStore, emitBroadcast, emitTrackTarget } from '../../store/realtime';
import { sampleZones } from '../../utils/geofence';

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [alerts, setAlerts] = useState(0);
  const tourists = useRealtimeStore((s) => s.tourists);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Load police user name
  const authorityName = useMemo(() => {
    try { const raw = localStorage.getItem('authorityUser'); return raw ? (JSON.parse(raw).name || 'Police Officer') : 'Police Officer'; } catch { return 'Police Officer'; }
  }, []);

  const markers = useMemo(
    () => Object.values(tourists)
      .filter((t) => t.lastPosition)
      .map((t) => ({ id: t.userId, position: { lat: t.lastPosition!.lat, lng: t.lastPosition!.lng } })),
    [tourists]
  );

  // EFIR list
  const [efirs, setEfirs] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('efirs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const onEFIR = (rec: any) => setEfirs((p) => [rec, ...p]);
    bus.on('efir:submitted', onEFIR as any);
    return () => { bus.off('efir:submitted', onEFIR as any); };
  }, []);

  const confirmEFIR = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('efirs') || '[]');
      const idx = all.findIndex((x: any) => x.id === id);
      if (idx > -1) { all[idx].status = 'confirmed'; localStorage.setItem('efirs', JSON.stringify(all)); }
      setEfirs(all);
    } catch {}
  };
  const rejectEFIR = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('efirs') || '[]');
      const next = all.filter((x: any) => x.id !== id);
      localStorage.setItem('efirs', JSON.stringify(next));
      setEfirs(next);
    } catch {}
  };

  const handleSignOut = () => { localStorage.removeItem('authorityAuth'); sessionStorage.removeItem('authorityAuth'); navigate('/'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Police Command Center</h1>
                <p className="text-sm text-gray-600">Real-time incident handling and E‑FIR approval</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select value={language} onChange={(e)=>setLanguage(e.target.value as any)} className="hidden md:block bg-white/70 border rounded-xl px-3 py-2 text-sm">
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="mr">🇮🇳 मराठी</option>
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="te">🇮🇳 తెలుగు</option>
              </select>
              <div className="flex items-center space-x-3 bg-white/80 rounded-xl px-4 py-3 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-800">{authorityName}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3 shadow-lg" title="Sign Out">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="hidden md:block text-sm font-medium text-red-600">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Top quick actions */}
        <div className="bg-white/90 rounded-2xl shadow-xl border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <button className="rounded-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"><Map className="w-5 h-5 mr-2"/>Live Map</button>
            <button className="rounded-xl px-6 py-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center justify-center" onClick={()=>{
              const msg = window.prompt('Broadcast message to tourists:', 'Please avoid restricted areas.');
              if (!msg) return;
              emitBroadcast({ id: `b-${Date.now()}`, message: msg, severity: 'Advisory', timestamp: Date.now() });
            }}><Radio className="w-5 h-5 mr-2"/>Broadcast</button>
            <button className="rounded-xl px-6 py-6 bg-orange-600 hover:bg-orange-700 text-white shadow-lg flex items-center justify-center" onClick={()=>{
              const id = window.prompt('Enter Tourist ID to track:', 'T001234');
              if (!id) return;
              emitTrackTarget({ userId: id, status: 'start', timestamp: Date.now(), reason: 'Police monitoring' });
              alert(`Tracking request sent for ${id}`);
            }}><Target className="w-5 h-5 mr-2"/>Track Suspect</button>
            <button className="rounded-xl px-6 py-6 bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center"><Download className="w-5 h-5 mr-2"/>Export Logs</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Map */}
          <div className="xl:col-span-2 bg-white/80 rounded-2xl shadow-xl border overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Map className="w-5 h-5 text-white"/></div><h3 className="text-xl font-bold text-gray-800">Live Map</h3></div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-blue-50 text-blue-600 rounded-lg"> <Search className="w-5 h-5"/> </button>
              </div>
            </div>
            <div className="h-96">
              <LiveMap center={markers[0]?.position ?? { lat: 25.5788, lng: 91.8933 }} markers={markers} zones={sampleZones} />
            </div>
          </div>

          {/* EFIR Queue */}
          <div className="space-y-6">
            <div className="bg-white/90 rounded-2xl shadow-xl border overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white"><div className="text-xl font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/>E‑FIR Inbox</div></div>
              <div className="p-4 space-y-3 max-h-[28rem] overflow-y-auto">
                {efirs.length === 0 && <div className="text-center text-gray-500 py-6">No E‑FIRs submitted</div>}
                {efirs.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border p-4">
                    <div className="flex flex-col md:flex-row md:items-stretch gap-4">
                      {/* Left: details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{r.type}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-gray-900">{r.touristName}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{r.touristId}</span>
                        </div>
                        {(r.touristEmail || r.touristPhone || r.touristNationality) && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-1">
                            {r.touristEmail && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Email: {r.touristEmail}</span>}
                            {r.touristPhone && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">Phone: {r.touristPhone}</span>}
                            {r.touristNationality && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">Nat.: {r.touristNationality}</span>}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">{new Date(r.timestamp).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{r.location ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` : 'Location not available'}</div>
                        <div className="text-sm text-gray-700 mt-2">{r.description}</div>
                        {r.evidenceLogs?.length > 0 && (<div className="mt-2 text-xs text-gray-500">Evidence: {r.evidenceLogs.length} file(s)</div>)}
                      </div>
                      {/* Right: actions */}
                      <div className="md:w-48 flex md:flex-col items-stretch md:items-end gap-2 md:justify-between">
                        <button className="px-3 py-2 rounded-lg border w-full md:w-auto" onClick={() => { setSelectedVideo({ videoUrl: r.evidenceLogs?.[0]?.url, touristName: r.touristName, touristId: r.touristId, timestamp: r.timestamp, status: r.status, location: r.location || { lat: 0, lng: 0 } }); setVideoModalOpen(true); }}>View Evidence</button>
                        <div className="flex gap-2 md:flex-col md:w-full">
                          <button className="px-3 py-2 rounded-lg bg-green-600 text-white md:flex-1" onClick={() => confirmEFIR(r.id)}>Confirm</button>
                          <button className="px-3 py-2 rounded-lg bg-red-100 text-red-700 md:flex-1" onClick={() => rejectEFIR(r.id)}>Reject</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcasts/Alerts counter */}
            <div className="bg-white/80 rounded-2xl shadow-xl border p-6">
              <div className="flex items-center gap-2 mb-2"><Bell className="w-5 h-5 text-orange-600"/><span className="font-semibold text-gray-800">Live Alerts</span></div>
              <div className="text-3xl font-bold text-gray-900">{alerts}</div>
              <p className="text-xs text-gray-500">New alerts received</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Video Modal */}
      {videoModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Evidence Preview</h2>
                <p className="text-gray-600">Tourist: {selectedVideo.touristName} ({selectedVideo.touristId})</p>
              </div>
              <button onClick={() => { setVideoModalOpen(false); setSelectedVideo(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {selectedVideo.videoUrl ? (
                  <video className="w-full h-full object-cover" controls preload="metadata">
                    <source src={selectedVideo.videoUrl} />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No video evidence</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
