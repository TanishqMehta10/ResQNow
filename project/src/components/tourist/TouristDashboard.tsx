import { useMemo, useState, useEffect } from 'react';
// navigation not used in this component
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertTriangle, Shield, MapPin, Phone, Users, Bell, Settings, User, HelpCircle, Video, Camera, Send } from 'lucide-react';
import LiveMap from '../LiveMap';
import { bus, useRealtimeStore } from '../../store/realtime';
import { useTracking } from '../../hooks/useTracking';
import SettingsPanel from './SettingsPanel';
import AIAssistant from '../../components/AIAssistant';
import EFIRPanel from './EFIRPanel';
import SafetyAlertsPanel from './SafetyAlertsPanel';

const TouristDashboard = () => {
  // navigation not needed here
  const { language, setLanguage, t } = useLanguage();
  const [trackingOptIn, setTrackingOptIn] = useState(true);
  const [touristName, setTouristName] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [eFirOpen, setEFirOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [sosModal, setSosModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [userId, setUserId] = useState<string>(() => {
    const mockTourist = localStorage.getItem('mockTourist');
    if (mockTourist) {
      const touristData = JSON.parse(mockTourist);
      return touristData.id || 'T001234';
    }
    return 'T001234';
  });
  const updateTourist = useRealtimeStore((s) => s.updateTourist);
  const currentUserId = useRealtimeStore((s) => s.currentUserId);
  const setCurrentUserId = useRealtimeStore((s) => s.setCurrentUserId);

  useEffect(() => {
    // Load latest stored details (in case ID/name were set on Digital ID screen)
    const mockTourist = localStorage.getItem('mockTourist');
    if (mockTourist) {
      const touristData = JSON.parse(mockTourist);
      if (touristData.id && touristData.id !== userId) setUserId(touristData.id);
      if (touristData.name) setTouristName(touristData.name);
    }
    if (!currentUserId) setCurrentUserId(userId);
    updateTourist(userId, { safetyScore: 100 });
  }, [currentUserId, setCurrentUserId, updateTourist, userId]);

  useTracking(userId, trackingOptIn);
  const lastPosition = useRealtimeStore((s) => s.tourists[userId]?.lastPosition);
  const safetyScore = useRealtimeStore((s) => s.tourists[userId]?.safetyScore ?? 85);
  const [toast, setToast] = useState<{ text: string; color: 'red' | 'yellow' } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast({ text: e.zoneId.includes('restrict') ? t('restrictedAreaEntered') : t('highRiskAreaEntered'), color: e.zoneId.includes('restrict') ? 'red' : 'yellow' });
      setTimeout(() => setToast(null), 4000);
    };
    bus.on('alert:geofence', handler);
    const onBroadcast = (m: any) => {
      setToast({ text: `Broadcast: ${m.message}`, color: 'yellow' });
      setTimeout(() => setToast(null), 4000);
    };
    const onTrack = (req: any) => {
      if (req.userId === userId) {
        setToast({ text: 'You are being monitored by authorities for safety.', color: 'yellow' });
        setTimeout(() => setToast(null), 4000);
      }
    };
    bus.on('broadcast:send', onBroadcast as any);
    bus.on('track:target', onTrack as any);
    return () => { bus.off('alert:geofence', handler); bus.off('broadcast:send', onBroadcast as any); bus.off('track:target', onTrack as any); };
  }, [t]);

  // Handle video element reference
  useEffect(() => {
    if (videoRef && videoStream) {
      videoRef.srcObject = videoStream;
      videoRef.play();
    }
  }, [videoRef, videoStream]);

  // Video recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: true 
      });
      
      // Set the video stream for preview
      setVideoStream(stream);
      
      // Set video element source when ref is available
      if (videoRef) {
        videoRef.srcObject = stream;
        videoRef.play();
      }
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        // Stop the stream and clear video preview
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        if (videoRef) {
          videoRef.srcObject = null;
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setToast({ text: 'Camera access denied. Please allow camera permission.', color: 'red' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendVideoToManagement = async () => {
    if (!videoBlob) return;
    
    try {
      // Get tourist data
      const mockTourist = localStorage.getItem('mockTourist');
      const touristData = mockTourist ? JSON.parse(mockTourist) : {
        id: userId,
        name: 'Tanishq Mehta',
        email: 'tanishqamehta1@gmail.com',
        phone: '+91 98765 43210',
        nationality: 'Indian'
      };
      
      // Create emergency video data
      const emergencyVideoData = {
        id: `EV${Date.now()}`,
        touristId: touristData.id,
        touristName: touristData.name,
        timestamp: Date.now(),
        location: lastPosition || { lat: 25.5788, lng: 91.8933 }, // fallback location
        videoUrl: URL.createObjectURL(videoBlob), // Create blob URL for video
        status: 'pending',
        touristEmail: touristData.email,
        touristPhone: touristData.phone,
        touristNationality: touristData.nationality
      };
      
      // Store in localStorage for authority dashboard to access
      const existingVideos = JSON.parse(localStorage.getItem('emergencyVideos') || '[]');
      existingVideos.unshift(emergencyVideoData); // Add to beginning
      localStorage.setItem('emergencyVideos', JSON.stringify(existingVideos));
      
      // Also emit event for real-time updates
      bus.emit('emergencyVideo', emergencyVideoData);
      
      console.log('Emergency video sent to tourism management:', emergencyVideoData);
      
      setToast({ text: 'Emergency video sent to tourism management successfully!', color: 'yellow' });
      setTimeout(() => setToast(null), 3000);
      setVideoBlob(null);
    } catch (error) {
      console.error('Error sending video:', error);
      setToast({ text: 'Failed to send video. Please try again.', color: 'red' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // sign-out and sos handlers intentionally omitted in this view

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('safeTour')}
                  </h1>
                  <p className="text-sm text-gray-500">{t('touristSafetyPlatform')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switch */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="mr">🇮🇳 मराठी</option>
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="te">🇮🇳 తెలుగు</option>
              </select>
              
              {/* Notifications */}
              <button className="relative p-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
              </button>
              
              {/* Combined Profile + Settings */}
              <button 
                onClick={() => setSettingsOpen(true)}
                className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/90 transition-all duration-300 shadow-lg"
                title={t('settings')}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{touristName || t('guestName')}</p>
                  <p className="text-xs text-gray-500">{t('touristId')} {userId}</p>
                </div>
                <Settings className="w-5 h-5 text-blue-600 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced SOS Emergency Button - moved above status cards */}
        <div className="mb-8">
          <button
            onClick={() => setSosModal(true)}
            className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white py-8 px-8 rounded-3xl font-bold text-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <span>{t('emergencySOS')}</span>
            </div>
            <div className="mt-2 text-sm text-white/90 text-center">
              {t('sosButtonDesc')}
            </div>
          </button>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Safety Status */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-xl text-gray-800">{t('safetyStatus')}</span>
            </div>
            <div className="flex items-center justify-between text-lg mt-2">
              <span>{t('geoFenceStatus')}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                <svg className="w-3 h-3 fill-green-500" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                {t('safeZone')}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg mt-1">
              <span>{t('locationTracking')}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                <svg className="w-3 h-3 fill-blue-500" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                {t('active')}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg mt-1">
              <span>{t('emergencyConnection')}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                <svg className="w-3 h-3 fill-green-500" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                {t('connected')}
              </span>
            </div>
          </div>
          {/* Active Alerts */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-xl text-gray-800">{t('safetyAlerts')}</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">Heavy Rainfall Warning</div>
            <div className="text-base text-gray-500 mb-1">Shillong, Meghalaya</div>
            <div className="text-lg font-semibold text-gray-800">Road Closure Notice</div>
            <div className="text-base text-gray-500 mb-1">Jorhat-Kaziranga Highway</div>
            <div className="text-lg font-semibold text-gray-800">Overcrowding Alert</div>
            <div className="text-base text-gray-500">Majuli Island, Assam</div>
          </div>
          {/* Live Emergency Video */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-xl text-gray-800">{t('liveEmergencyVideo')}</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">{t('emergencyVideoDesc')}</div>
            
            {/* Video Preview Area */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {videoStream && (
                <video
                  ref={setVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              )}
              
              {/* Recording Overlay */}
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}
              
              {/* No Video State */}
              {!videoStream && !videoBlob && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Camera preview will appear here</p>
                  </div>
                </div>
              )}
              
              {/* Video Captured State */}
              {videoBlob && !isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-green-700 text-sm font-medium">Video Ready</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="space-y-2">
              {!isRecording && !videoBlob && (
                <button
                  onClick={startRecording}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {t('captureVideo')}
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                  Stop Recording
                </button>
              )}
              
              {videoBlob && !isRecording && (
                <div className="space-y-2">
                  <button
                    onClick={sendVideoToManagement}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {t('sendToManagement')}
                  </button>
                  <button
                    onClick={() => setVideoBlob(null)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Record Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

  {/* Quick Actions Row removed as per request */}

        {/* Emergency Modal */}
        {sosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
              <button onClick={() => setSosModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span className="text-xl font-bold text-red-700">{t('emergencyAlert')}</span>
              </div>
              <div className="text-gray-600 mb-6">{t('selectEmergencyType')}</div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSosModal(false);
                    setToast({ text: 'Response noted. Helping team will contact you soon', color: 'yellow' });
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="w-full flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-lg transition"
                ><Shield className="w-5 h-5" /> {t('generalEmergency')}</button>
                <button
                  onClick={() => {
                    setSosModal(false);
                    setToast({ text: 'Response noted. Helping team will contact you soon', color: 'yellow' });
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition"
                ><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.46243 6.46243 3 9.5 3C11.1569 3 12 4.34315 12 4.34315C12 4.34315 12.8431 3 14.5 3C17.5376 3 20 5.46243 20 8.5C20 13.5 12 21 12 21Z" /><circle cx="12" cy="8.5" r="2.5" /></svg> {t('medicalEmergency')}</button>
                <button
                  onClick={() => {
                    setSosModal(false);
                    setToast({ text: 'Response noted. Helping team will contact you soon', color: 'yellow' });
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="w-full flex items-center gap-2 justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-lg transition"
                ><Shield className="w-5 h-5" /> {t('theftRobbery')}</button>
                <button
                  onClick={() => {
                    setSosModal(false);
                    setToast({ text: 'Response noted. Helping team will contact you soon', color: 'yellow' });
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="w-full flex items-center gap-2 justify-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg text-lg transition"
                ><AlertTriangle className="w-5 h-5" /> {t('harassmentAssault')}</button>
                <button
                  onClick={() => {
                    setSosModal(false);
                    setToast({ text: 'Response noted. Helping team will contact you soon', color: 'yellow' });
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="w-full flex items-center gap-2 justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg text-lg transition"
                ><Shield className="w-5 h-5" /> {t('accidentInjury')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Call Police */}
            <button
              onClick={() => (window.location.href = 'tel:112')}
              className="rounded-2xl px-6 py-6 shadow-xl bg-red-500 hover:bg-red-600 transition text-white flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <span className="font-semibold">{t('callPolice')}</span>
            </button>

            {/* Tourist Helpline */}
            <button
              onClick={() => (window.location.href = 'tel:1363')}
              className="rounded-2xl px-6 py-6 shadow-xl bg-blue-600 hover:bg-blue-700 transition text-white flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <span className="font-semibold">{t('touristHelpline')}</span>
            </button>

            {/* E-FIR */}
            <button
              onClick={() => setEFirOpen(true)}
              className="rounded-2xl px-6 py-6 shadow-xl bg-green-600 hover:bg-green-700 transition text-white flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9 2a1 1 0 00-1 1v2H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v2H10V3a1 1 0 00-1-1z"/><path d="M8 11h8v2H8z"/></svg>
              </div>
              <span className="font-semibold">{t('eFir')}</span>
            </button>

            {/* Report Issue */}
            <button
              onClick={() => setHelpModal(true)}
              className="rounded-2xl px-6 py-6 shadow-xl bg-purple-600 hover:bg-purple-700 transition text-white flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
                <span className="font-semibold">{t('nearbyHelp')}</span>
            </button>
          </div>
        </div>

        {/* Nearby Help Modal */}
        {helpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in">
              <button onClick={() => setHelpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-xl font-bold text-green-700">{t('nearbyHelp')}</span>
              </div>
              <div className="space-y-4">
                {/* Tourist Police Station */}
                <div className="flex items-center bg-blue-50 rounded-lg p-4 gap-4">
                  <Shield className="w-7 h-7 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t('touristPoliceStation')}</div>
                    <div className="text-xs text-gray-500">1.2 km away</div>
                  </div>
                  <button className="p-2" title={t('viewOnMap')}><MapPin className="w-5 h-5 text-blue-600" /></button>
                  <button className="p-2" title={t('call')}><Phone className="w-5 h-5 text-blue-600" /></button>
                </div>
                {/* District Hospital */}
                <div className="flex items-center bg-red-50 rounded-lg p-4 gap-4">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t('districtHospital')}</div>
                    <div className="text-xs text-gray-500">2.8 km away</div>
                  </div>
                  <button className="p-2" title={t('viewOnMap')}><MapPin className="w-5 h-5 text-red-600" /></button>
                  <button className="p-2" title={t('call')}><Phone className="w-5 h-5 text-red-600" /></button>
                </div>
                {/* Tourist Help Center */}
                <div className="flex items-center bg-green-50 rounded-lg p-4 gap-4">
                  <MapPin className="w-7 h-7 text-green-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t('touristHelpCenter')}</div>
                    <div className="text-xs text-gray-500">0.8 km away</div>
                  </div>
                  <button className="p-2" title={t('viewOnMap')}><MapPin className="w-5 h-5 text-green-600" /></button>
                  <button className="p-2" title={t('call')}><Phone className="w-5 h-5 text-green-600" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Content Grid */}
  {/* Safety Alerts and AI Assistant beside it removed as per request */}

        {/* Safety Banner + Map & Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">{t('safetyScore')}</div>
              <div className="text-3xl font-extrabold">{Math.round(safetyScore)}%</div>
              <div className="text-xs opacity-90">{t('safetyScoreDesc')}</div>
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">{t('optInTracking')} {trackingOptIn ? 'ON' : 'OFF'}</div>
          </div>
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 h-96">
            <div className="flex items-center justify-end mb-2 px-2">
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={trackingOptIn} onChange={(e) => setTrackingOptIn(e.target.checked)} />
                <span>{t('optInTracking')}</span>
              </label>
            </div>
            <div className="h-80">
              <LiveMap center={lastPosition ? { lat: lastPosition.lat, lng: lastPosition.lng } : { lat: 13.0674, lng: 80.2376 }} markers={lastPosition ? [{ id: userId, position: { lat: lastPosition.lat, lng: lastPosition.lng } }] : []} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 flex items-center justify-center text-sm text-gray-600">
            {/* AI Assistant moved here */}
            <AIAssistant />
          </div>
        </div>

        {/* Bottom feature cards removed as requested */}

  {/* Bottom bar with Safety Alerts removed */}
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} trackingOptIn={trackingOptIn} setTrackingOptIn={setTrackingOptIn} />
      <EFIRPanel open={eFirOpen} onClose={() => setEFirOpen(false)} />
      <SafetyAlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
  {/* <AIAssistant /> removed as per request */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white ${toast.color === 'red' ? 'bg-red-600' : 'bg-yellow-500'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default TouristDashboard;