import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Map, 
  Search, 
  AlertTriangle, 
  Users, 
  Eye, 
  Bell, 
  TrendingUp, 
  Shield, 
  Phone,
  MessageSquare,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Clock,
  User,
  LogOut,
  BarChart3,
  Zap,
  Target,
  Radio,
  Headphones,
  Satellite,
  Video,
  Play,
  X
} from 'lucide-react';
import LiveMap from '../LiveMap';
import { bus, useRealtimeStore, emitBroadcast } from '../../store/realtime';
import AnalyticsDashboard from './AnalyticsDashboard';
import { sampleZones } from '../../utils/geofence';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [emergencyVideos, setEmergencyVideos] = useState(() => {
    // Load emergency videos from localStorage
    const savedVideos = localStorage.getItem('emergencyVideos');
    if (savedVideos) {
      return JSON.parse(savedVideos);
    }
    // Default sample videos for demo
    return [
      {
        id: 'EV001',
        touristId: 'T001234',
        touristName: 'John Smith',
        timestamp: Date.now() - 300000, // 5 minutes ago
        location: { lat: 25.5788, lng: 91.8933 },
        videoUrl: '/sample-emergency-video.mp4',
        status: 'pending'
      },
      {
        id: 'EV002',
        touristId: 'T001235',
        touristName: 'Sarah Johnson',
        timestamp: Date.now() - 600000, // 10 minutes ago
        location: { lat: 25.5888, lng: 91.9033 },
        videoUrl: '/sample-emergency-video-2.mp4',
        status: 'reviewed'
      }
    ];
  });
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  // Section refs for quick actions navigation
  const statsRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  // Real-time alerts state
  type SosAlert = { id: string; userId: string; time: number; position?: { lat: number; lng: number } };
  type SafetyAlert = { id: string; userId: string; time: number; zoneId: string };
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'sos' | 'safety'>('sos');
  const [sendAlertOpen, setSendAlertOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [efirOpen, setEfirOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('General');
  const [alertSeverity, setAlertSeverity] = useState('Info');
  const [alertArea, setAlertArea] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'Info'|'Advisory'|'Warning'|'Critical'>('Info');
  const tourists = useRealtimeStore((s) => s.tourists);
  const updateTourist = useRealtimeStore((s) => s.updateTourist);
  const touristsRef = useRef(tourists);
  const liveMapRef = useRef<{ focusOnMarker?: (id: string) => void; focusOnLocation?: (lat: number, lng: number, label?: string) => void } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleZoneIds, setVisibleZoneIds] = useState<string[]>(() => sampleZones.map((z) => z.id));

  // keep a mutable ref of tourists for timers/interval callbacks
  useEffect(() => {
    touristsRef.current = tourists;
  }, [tourists]);
  const markers = useMemo(
    () => Object.values(tourists)
      .filter((t) => t.lastPosition)
      .map((t) => ({
        id: t.userId,
        position: { lat: t.lastPosition!.lat, lng: t.lastPosition!.lng },
        color: sosAlerts.some((a) => a.userId === t.userId) ? '#ef4444' : '#2563eb',
        safetyScore: t.safetyScore,
        lastUpdated: t.lastUpdated,
        isTracking: t.isTracking,
        // metadata forwarded so LiveMap popup can show richer info
        name: (t as any).name,
        nationality: (t as any).nationality,
        nationalId: (t as any).nationalId,
        status: (t as any).status,
      })),
    [tourists, sosAlerts]
  );

  // use canonical sampleZones for North-East India themed zones
  const visibleZones = sampleZones.filter((z) => visibleZoneIds.includes(z.id));

  const exportData = () => {
    try {
      const rows = Object.values(tourists).map((t) => ({
        userId: t.userId,
        name: (t as any).name ?? '',
        nationality: (t as any).nationality ?? '',
        nationalId: (t as any).nationalId ?? '',
        status: (t as any).status ?? '',
        safetyScore: t.safetyScore ?? '',
        lastUpdated: t.lastUpdated ? new Date(t.lastUpdated).toISOString() : '',
        lat: t.lastPosition?.lat ?? '',
        lng: t.lastPosition?.lng ?? '',
      }));
      const header = Object.keys(rows[0] ?? {}).join(',') + '\n';
      const csv = header + rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tourists_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleViewVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else {
      return `${hours} hours ago`;
    }
  };

  useEffect(() => {
    const onSos = (e: { userId: string; position?: { lat: number; lng: number }; timestamp: number }) => {
      setSosAlerts((prev) => [{ id: `${e.userId}-${e.timestamp}`, userId: e.userId, time: e.timestamp, position: e.position }, ...prev].slice(0, 50));
      setActiveAlerts((v) => v + 1);
    };
    const onGeo = (e: { userId: string; zoneId: string; level: 'enter' | 'exit'; timestamp: number }) => {
      // try to resolve zone center so the alert can be shown on map
      const zone = sampleZones.find((z) => z.id === e.zoneId) || sampleZones.find((z) => z.name === e.zoneId) || null;
      const position = zone ? { lat: zone.center.lat, lng: zone.center.lng } : undefined;
      setSafetyAlerts((prev) => [{ id: `${e.userId}-${e.timestamp}`, userId: e.userId, time: e.timestamp, zoneId: e.zoneId, ...(position ? { position } : {}) }, ...prev].slice(0, 50));
    };
    const onEmergencyVideo = (videoData: any) => {
      setEmergencyVideos((prev) => [videoData, ...prev]);
      // Update localStorage
      const updatedVideos = [videoData, ...emergencyVideos];
      localStorage.setItem('emergencyVideos', JSON.stringify(updatedVideos));
    };
    // Listen for EFIR submissions from tourist side
    const onEFIR = (record: any) => {
      try {
        const existing = JSON.parse(localStorage.getItem('efirs') || '[]');
        const found = existing.find((r: any) => r.id === record.id);
        if (!found) {
          existing.unshift(record);
          localStorage.setItem('efirs', JSON.stringify(existing));
        }
      } catch {}
      setActiveAlerts((v)=>v+1);
    };
    bus.on('efir:submitted', onEFIR as any);
    bus.on('sos:triggered', onSos as any);
    bus.on('alert:geofence', onGeo as any);
    bus.on('emergencyVideo', onEmergencyVideo);
    
    return () => {
      bus.off('efir:submitted', onEFIR as any);
      bus.off('sos:triggered', onSos as any);
      bus.off('alert:geofence', onGeo as any);
      bus.off('emergencyVideo', onEmergencyVideo);
    };
  }, [emergencyVideos]);

  // Seed mock tourists and simulate movement if none available
  useEffect(() => {
    const ids = Object.keys(tourists);
    if (ids.length > 0) return;
    const base = { lat: 26.1445, lng: 91.7362 }; // Guwahati approx
    const makePos = (dx: number, dy: number) => ({ lat: base.lat + dx, lng: base.lng + dy });
    const mockIds = Array.from({ length: 18 }).map((_, i) => `T10${(i + 1).toString().padStart(2, '0')}`);
    const sampleNames = ['Sarah Johnson','Arjun Patel','Riya Sen','Mohammed Ali','Sonia Das','Liam Brown','Priya Kapoor','Carlos Mendez','Zhang Wei','Aiko Tanaka','Fatima Khan','Olivia Smith','Noah Lee','Maya Nair','Ethan Wang','Amrita Roy','Hassan Khan','Diego Silva'];
    const sampleNats = ['American','Indian','Indian','Bangladeshi','Indian','British','Indian','Mexican','Chinese','Japanese','Pakistani','British','Korean','Indian','Chinese','Indian','Pakistani','Brazilian'];
    mockIds.forEach((id, idx) => {
      // Make the very first mock tourist located in Mawphlang Slopes (Shillong) and mark as Alert
      if (idx === 0) {
        const mawphlang = { lat: 25.6020, lng: 91.8382 };
        updateTourist(id, {
          isTracking: true,
          lastPosition: mawphlang,
          safetyScore: 30,
          name: sampleNames[idx] ?? `Tourist ${idx+1}`,
          nationality: sampleNats[idx] ?? 'Unknown',
          nationalId: `NE-1702123457-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
          status: 'Alert'
        });
        return;
      }
      const dx = (Math.random() - 0.5) * 2.5;
      const dy = (Math.random() - 0.5) * 2.5;
      updateTourist(id, { 
        isTracking: true, 
        lastPosition: makePos(dx, dy), 
        safetyScore: 80 + Math.round(Math.random() * 20),
        name: sampleNames[idx] ?? `Tourist ${idx+1}`,
        nationality: sampleNats[idx] ?? 'Unknown',
        nationalId: `NE-1702123457-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        status: Math.random() > 0.15 ? 'Safe' : 'Alert'
      });
    });
    const moveTimer = window.setInterval(() => {
      const snapshot = touristsRef.current || {};
      mockIds.forEach((id) => {
        const t = snapshot[id];
        const cur = t?.lastPosition ?? base;
        const nx = cur.lat + (Math.random() - 0.5) * 0.01;
        const ny = cur.lng + (Math.random() - 0.5) * 0.01;
        updateTourist(id, { lastPosition: { lat: nx, lng: ny } });
      });
    }, 3000);

    // Seed initial alerts
    // seed positions using current store snapshot
    const snapshot2 = touristsRef.current || {};
    setSosAlerts([
      { id: `seed-${Date.now()}-alert-shillong`, userId: mockIds[0], time: Date.now() - 1000 * 30, position: snapshot2[mockIds[0]]?.lastPosition },
      { id: `seed-${Date.now()}-2`, userId: mockIds[7], time: Date.now() - 1000 * 60 * 5, position: snapshot2[mockIds[7]]?.lastPosition },
    ]);
    setSafetyAlerts([
      { id: `seed-g-${Date.now()}-1`, userId: mockIds[10], time: Date.now() - 1000 * 60 * 7, zoneId: 'restricted_zone_01' },
      { id: `seed-g-${Date.now()}-2`, userId: mockIds[12], time: Date.now() - 1000 * 60 * 9, zoneId: 'high_risk_area' },
    ]);

    // Randomly emit SOS and geofence alerts
    const sosTimer = window.setInterval(() => {
      const uid = mockIds[Math.floor(Math.random() * mockIds.length)];
      const pos = (touristsRef.current || {})[uid]?.lastPosition;
      bus.emit('sos:triggered', { userId: uid, position: pos, timestamp: Date.now() } as any);
    }, 9000);
    const geoTimer = window.setInterval(() => {
      const uid = mockIds[Math.floor(Math.random() * mockIds.length)];
      bus.emit('alert:geofence', { userId: uid, zoneId: Math.random() > 0.5 ? 'restrict_zone' : 'warning_zone', level: 'enter', timestamp: Date.now() } as any);
    }, 12000);

    return () => {
      window.clearInterval(moveTimer);
      window.clearInterval(sosTimer);
      window.clearInterval(geoTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const handleSignOut = () => {
    localStorage.removeItem('authorityAuth');
    sessionStorage.removeItem('authorityAuth');
    navigate('/');
  };

  // Load authority user name from localStorage
  const authorityName = (() => {
    try {
      const raw = localStorage.getItem('authorityUser');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.name || null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {t('authorityDashboard')}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">{t('touristSafetyCommand')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">System Online</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
                  <Satellite className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">GPS Active</span>
                </div>
              </div>

              {/* Language selector */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="hidden md:block bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Language"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="mr">🇮🇳 मराठी</option>
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="te">🇮🇳 తెలుగు</option>
              </select>

              {/* Notifications */}
              <button className="relative p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-lg">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {activeAlerts}
                </span>
              </button>
              
              {/* Profile & Sign Out */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-gray-800">{authorityName || 'Authority User'}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3 transition-all duration-300 shadow-lg group"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:block text-sm font-medium text-red-600">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <button onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="rounded-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition flex items-center justify-center">
              <Map className="w-5 h-5 mr-2" />
              <span>Live Map View</span>
            </button>
            <button onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="rounded-xl px-6 py-6 bg-green-600 hover:bg-green-700 text-white shadow-lg transition flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              <span>Tourist Search</span>
            </button>
            <button onClick={() => setAnalyticsOpen(true)} className="rounded-xl px-6 py-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition flex items-center justify-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              <span>Analytics Dashboard</span>
            </button>
            <button onClick={() => { setSendAlertOpen(true); alertsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="rounded-xl px-6 py-6 bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition flex items-center justify-center">
              <Bell className="w-5 h-5 mr-2" />
              <span>Send Alert</span>
            </button>
            <button onClick={() => setEfirOpen(true)} className="rounded-xl px-6 py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg transition flex items-center justify-center">
              <Video className="w-5 h-5 mr-2" />
              <span>E‑FIR Inbox</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: t('activeTourists'), 
              value: '24', 
              change: '+12%', 
              icon: Users, 
              color: 'blue',
              bg: 'from-blue-500 to-cyan-500'
            },
            { 
              title: t('activeAlerts'), 
              value: activeAlerts.toString(), 
              change: '-8%', 
              icon: AlertTriangle, 
              color: 'red',
              bg: 'from-red-500 to-pink-500'
            },
            { 
              title: t('safeZones'), 
              value: '6', 
              change: '+2', 
              icon: Shield, 
              color: 'green',
              bg: 'from-green-500 to-emerald-500'
            },
            { 
              title: t('responseRate'), 
              value: '98.5%', 
              change: '+0.3%', 
              icon: TrendingUp, 
              color: 'purple',
              bg: 'from-purple-500 to-indigo-500'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.bg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Map & Controls */}
          <div className="xl:col-span-2 space-y-8">
            {/* Enhanced Map View */}
            <div ref={mapRef} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{t('liveMapView')}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1h">Last Hour</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                    </select>
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                      <Target className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-96">
                <LiveMap 
                  center={markers[0]?.position ?? { lat: 13.0674, lng: 80.2376 }} 
                  markers={markers} 
                  zones={visibleZones} 
                  sosIds={sosAlerts.map((a)=>a.userId)}
                    showOverlay={true}
                    onReady={(helpers) => { liveMapRef.current = helpers; }}
                />
              </div>
              {/* Filter modal/panel */}
              {filterOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40" style={{ zIndex: 99999 }}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 pointer-events-auto" style={{ zIndex: 100000 }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Filter Zones</h3>
                      <button onClick={() => setFilterOpen(false)} className="text-gray-500">Close</button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {sampleZones.map((z) => (
                        <label key={z.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div>
                            <div className="font-semibold">{z.name}</div>
                            <div className="text-xs text-gray-500">{z.riskLevel.toUpperCase()}</div>
                          </div>
                          <input type="checkbox" checked={visibleZoneIds.includes(z.id)} onChange={(e) => {
                            if (e.target.checked) setVisibleZoneIds((s) => Array.from(new Set([...s, z.id])));
                            else setVisibleZoneIds((s) => s.filter((id) => id !== z.id));
                          }} />
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center justify-end mt-4">
                      <button onClick={() => setFilterOpen(false)} className="px-4 py-2 rounded-lg border">Done</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Search & Controls */}
            <div ref={searchRef} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchTourist')}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <button className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg">
                  Search
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'monitor', icon: Eye, label: t('monitorAll'), color: 'blue' },
                  { id: 'filter', icon: Filter, label: t('filterZones'), color: 'orange' },
                  { id: 'export', icon: Download, label: t('exportData'), color: 'green' },
                  { id: 'broadcast', icon: Radio, label: 'Broadcast', color: 'purple' }
                ].map((action, index) => (
                  <button key={index}
                    onClick={() => {
                      if (action.id === 'filter') setFilterOpen(true);
                      if (action.id === 'export') exportData();
                      if (action.id === 'broadcast') setBroadcastOpen(true);
                    }}
                    className={`group bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-600 p-4 rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105`}>
                    <action.icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Emergency Alerts & Monitoring */}
          <div className="space-y-8">
            {/* E-FIR Review Panel */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                <div className="text-xl font-bold flex items-center"><Shield className="w-5 h-5 mr-2" /> E‑FIR Review Queue</div>
              </div>
              <div className="p-4 space-y-3 max-h-[28rem] overflow-y-auto">
                {(JSON.parse(localStorage.getItem('efirs') || '[]') as any[]).slice(0,10).map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{r.type} • {r.touristName} ({r.touristId})</div>
                        <div className="text-sm text-gray-600">{new Date(r.timestamp).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{r.location ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` : 'Location not available'}</div>
                        <div className="text-sm text-gray-700 mt-2 line-clamp-2">{r.description}</div>
                        {r.evidenceLogs?.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">Evidence: {r.evidenceLogs.length} file(s)</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-2 rounded-lg border" onClick={() => { setSelectedVideo({ videoUrl: r.evidenceLogs?.[0]?.url, touristName: r.touristName, touristId: r.touristId, timestamp: r.timestamp, status: 'pending', location: r.location || { lat: 0, lng: 0 } }); setVideoModalOpen(true); }}>View Evidence</button>
                        <button className="px-3 py-2 rounded-lg bg-green-600 text-white" onClick={() => {
                          const all = JSON.parse(localStorage.getItem('efirs') || '[]');
                          const idx = all.findIndex((x: any)=>x.id===r.id);
                          if (idx>-1) { all[idx].status = 'confirmed'; localStorage.setItem('efirs', JSON.stringify(all)); }
                          setActiveAlerts((v)=> Math.max(0, v-1));
                        }}>Confirm</button>
                        <button className="px-3 py-2 rounded-lg bg-red-100 text-red-700" onClick={() => {
                          const all = JSON.parse(localStorage.getItem('efirs') || '[]');
                          localStorage.setItem('efirs', JSON.stringify(all.filter((x: any)=>x.id!==r.id)));
                        }}>Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
                {((JSON.parse(localStorage.getItem('efirs') || '[]') as any[]).length === 0) && (
                  <div className="text-center text-gray-500 py-6">No E‑FIRs submitted</div>
                )}
              </div>
            </div>
            {/* Emergency Alerts & Monitoring */}
            <div ref={alertsRef} className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <div className="text-xl font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Emergency Alerts & Monitoring</div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => setActiveTab('sos')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${activeTab==='sos'?'bg-white text-red-700 border-red-300 shadow':'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    <AlertTriangle className="w-4 h-4" /> SOS Alerts ({sosAlerts.length})
                  </button>
                  <button onClick={() => setActiveTab('safety')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${activeTab==='safety'?'bg-white text-blue-700 border-blue-300 shadow':'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    <MapPin className="w-4 h-4" /> Safety Alerts ({safetyAlerts.length})
                  </button>
                </div>

                <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                  {(activeTab==='sos'?sosAlerts:safetyAlerts).map((a) => (
                    <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-semibold">critical</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">active</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">{activeTab==='sos'?'sos':'geofence'}</span>
                        </div>
                        <div className="text-sm text-gray-800 font-semibold">Tourist ID: {a.userId}</div>
                        <div className="text-sm text-gray-700 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {('position' in a && a.position)
                            ? `${a.position.lat.toFixed(5)}, ${a.position.lng.toFixed(5)}`
                            : ('zoneId' in a ? a.zoneId : 'Unknown')}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(a.time).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-2">{activeTab==='sos'?'General emergency assistance required':'Geo-fence event detected'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg border px-3 py-2 hover:bg-gray-50" title="View on Map" onClick={() => {
                          // Prefer focusing the exact alert position if available, otherwise focus the marker by user id
                          if ('position' in a && a.position && liveMapRef.current?.focusOnLocation) {
                            liveMapRef.current.focusOnLocation(a.position.lat, a.position.lng, `SOS: ${a.userId}`);
                          } else {
                            const idToFocus = a.userId;
                            if (liveMapRef.current?.focusOnMarker) {
                              liveMapRef.current.focusOnMarker(idToFocus);
                            }
                          }
                          mapRef.current?.scrollIntoView({ behavior:'smooth' });
                        }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <a className="rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700" href={`tel:+91112`} title="Call">
                          <Phone className="w-4 h-4" />
                        </a>
                        <button className="rounded-lg bg-green-600 text-white px-3 py-2 hover:bg-green-700" onClick={() => setActiveAlerts((v)=> Math.max(0, v-1))} title="Resolve">
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Video Notifications */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Emergency Video Alerts</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {emergencyVideos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No emergency videos received</p>
                    </div>
                  ) : (
                    emergencyVideos.map((video) => (
                      <div key={video.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-red-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${video.status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                              <span className="font-semibold text-gray-800">{video.touristName}</span>
                              <span className="text-sm text-gray-500">({video.touristId})</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>Location: {video.location.lat.toFixed(4)}, {video.location.lng.toFixed(4)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(video.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewVideo(video)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            <span className="text-sm">View Video</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600" onClick={() => setAnalyticsOpen(false)}>&times;</button>
            <div className="p-6">
              <AnalyticsDashboard sosAlerts={sosAlerts} safetyAlerts={safetyAlerts} />
            </div>
          </div>
        </div>
      )}

      {/* Send New Safety Alert Modal */}
      {sendAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600" onClick={() => setSendAlertOpen(false)}>&times;</button>
            <div className="flex items-center gap-2 mb-4 text-gray-900 text-xl font-bold">
              <Bell className="w-5 h-5 text-orange-500" /> Send New Safety Alert
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alert Title</label>
                <input value={alertTitle} onChange={(e)=>setAlertTitle(e.target.value)} placeholder="e.g., Heavy Rainfall Warning" className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea value={alertMessage} onChange={(e)=>setAlertMessage(e.target.value)} placeholder="Describe the alert for tourists..." rows={4} className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Alert Type</label>
                  <select value={alertType} onChange={(e)=>setAlertType(e.target.value)} className="w-full border rounded-xl px-3 py-2">
                    <option>General</option>
                    <option>Weather</option>
                    <option>Security</option>
                    <option>Health</option>
                    <option>Traffic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select value={alertSeverity} onChange={(e)=>setAlertSeverity(e.target.value)} className="w-full border rounded-xl px-3 py-2">
                    <option>Info</option>
                    <option>Advisory</option>
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Affected Area</label>
                <input value={alertArea} onChange={(e)=>setAlertArea(e.target.value)} placeholder="e.g., Shillong, Meghalaya" className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="px-4 py-2 rounded-xl border" onClick={()=>setSendAlertOpen(false)}>Cancel</button>
                <button className="px-5 py-2 rounded-xl bg-black text-white flex items-center gap-2" onClick={()=>{ setSendAlertOpen(false); setSafetyAlerts((p)=>[{ id: `sys-${Date.now()}`, userId: 'SYSTEM', time: Date.now(), zoneId: alertArea || 'General' }, ...p]); setAlertTitle(''); setAlertMessage(''); setAlertArea(''); }}>
                  <span>Send Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600" onClick={() => setBroadcastOpen(false)}>&times;</button>
            <div className="flex items-center gap-2 mb-4 text-gray-900 text-xl font-bold">
              <Radio className="w-5 h-5 text-purple-600" /> Broadcast Message
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input value={broadcastTitle} onChange={(e)=>setBroadcastTitle(e.target.value)} placeholder="Short title" className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea value={broadcastMessage} onChange={(e)=>setBroadcastMessage(e.target.value)} placeholder="Write the message to broadcast to all tourists..." rows={4} className="w-full border rounded-xl px-3 py-2"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select value={broadcastSeverity} onChange={(e)=>setBroadcastSeverity(e.target.value as any)} className="w-full border rounded-xl px-3 py-2">
                    <option>Info</option>
                    <option>Advisory</option>
                    <option>Warning</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Affected Area (optional)</label>
                  <input value={alertArea} onChange={(e)=>setAlertArea(e.target.value)} placeholder="e.g., Shillong" className="w-full border rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="px-4 py-2 rounded-xl border" onClick={()=>setBroadcastOpen(false)}>Cancel</button>
                <button className="px-5 py-2 rounded-xl bg-purple-600 text-white flex items-center gap-2" onClick={()=>{
                  // send broadcast via store helper
                  try {
                    const id = `b-${Date.now()}`;
                    emitBroadcast({ id, title: broadcastTitle || undefined, message: broadcastMessage || '', area: alertArea || undefined, severity: broadcastSeverity, timestamp: Date.now() });
                    // also add a system safety alert for visibility
                    setSafetyAlerts((p)=>[{ id: `b-${Date.now()}`, userId: 'BROADCAST', time: Date.now(), zoneId: alertArea || 'Broadcast' }, ...p]);
                  } catch (e) {
                    console.error('Broadcast failed', e);
                  }
                  setBroadcastOpen(false);
                  setBroadcastMessage('');
                  setBroadcastTitle('');
                  setAlertArea('');
                }}>
                  <span>Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Video Modal */}
      {videoModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Emergency Video Report</h2>
                <p className="text-gray-600">Tourist: {selectedVideo.touristName} ({selectedVideo.touristId})</p>
              </div>
              <button
                onClick={handleCloseVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video Player */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Emergency Video</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                
                {/* Tourist Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Tourist Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">{selectedVideo.touristName}</p>
                        <p className="text-sm text-gray-600">ID: {selectedVideo.touristId}</p>
                        {selectedVideo.touristEmail && (
                          <p className="text-sm text-gray-600">Email: {selectedVideo.touristEmail}</p>
                        )}
                        {selectedVideo.touristPhone && (
                          <p className="text-sm text-gray-600">Phone: {selectedVideo.touristPhone}</p>
                        )}
                        {selectedVideo.touristNationality && (
                          <p className="text-sm text-gray-600">Nationality: {selectedVideo.touristNationality}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Location Coordinates</p>
                        <p className="text-sm text-gray-600">
                          Lat: {selectedVideo.location.lat.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Lng: {selectedVideo.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Report Time</p>
                        <p className="text-sm text-gray-600">{formatTimeAgo(selectedVideo.timestamp)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedVideo.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedVideo.status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">Status</p>
                        <p className="text-sm text-gray-600 capitalize">{selectedVideo.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Contact Tourist
                    </button>
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Mark as Reviewed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;