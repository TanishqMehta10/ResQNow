import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';

export default function TouristProfile() {
  // Profile info sourced from localStorage, with fallbacks
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    nationality: 'Indian',
    digitalId: 'T001234',
    guardianName: '',
    guardianPhone: '',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T001234',
  });

  useEffect(() => {
    const stored = localStorage.getItem('mockTourist');
    if (stored) {
      const parsed = JSON.parse(stored);
      const digitalId = parsed.id || 'T001234';
      setProfile((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        nationality: parsed.nationality || prev.nationality,
        guardianName: parsed.guardianName || '',
        guardianPhone: parsed.guardianPhone || '',
        digitalId,
        qr: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(digitalId)}`,
      }));
    }
  }, []);

  // Placeholder for update logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#1a237e]">Tourist Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input name="name" value={profile.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" value={profile.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nationality</label>
          <input name="nationality" value={profile.nationality} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
            <input name="guardianName" value={profile.guardianName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
            <input name="guardianPhone" value={profile.guardianPhone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div>
            <div className="text-sm text-gray-500">Digital ID</div>
            <div className="font-mono text-lg text-[#2e7d32]">{profile.digitalId}</div>
          </div>
          <div className="ml-auto">
            <img src={profile.qr} alt="QR Code" className="w-24 h-24 border rounded-lg" />
            <div className="flex items-center justify-center mt-1 text-xs text-gray-500"><QrCode className="w-4 h-4 mr-1" /> QR Code</div>
          </div>
        </div>
        <button className="w-full mt-6 bg-[#2e7d32] text-white py-2 rounded-lg font-semibold hover:bg-[#1a237e] transition">Update Profile</button>
        <button className="w-full mt-2 bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 transition">Logout</button>
      </div>
    </div>
  );
}
