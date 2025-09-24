import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Download, Share2, CheckCircle, Shield } from 'lucide-react';
import { nanoid } from 'nanoid';

const DigitalID = () => {
  const navigate = useNavigate();
  const idData = useMemo(() => {
    // Load stored tourist details from localStorage
    const stored = localStorage.getItem('mockTourist');
    const parsed = stored ? JSON.parse(stored) : {};
    const ensuredUserId = parsed.id || ('TID-' + nanoid(8).toUpperCase());
    const ensuredName = parsed.name || 'John Doe';
    const ensuredNationality = parsed.nationality || 'Indian';
    const payload = { userId: ensuredUserId, name: ensuredName, issuedAt: Date.now() };
    // Persist back any generated fields
    localStorage.setItem('mockTourist', JSON.stringify({
      ...parsed,
      id: ensuredUserId,
      name: ensuredName,
      nationality: ensuredNationality,
    }));
    return { userId: ensuredUserId, name: ensuredName, nationality: ensuredNationality, qrPayload: JSON.stringify(payload) };
  }, []);

  const qrUrl = useMemo(() => {
    const data = encodeURIComponent(idData.qrPayload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${data}`;
  }, [idData.qrPayload]);

  const handleDownload = async () => {
    const link = document.createElement('a');
    link.download = 'digital-id.png';
    link.href = qrUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-700 to-indigo-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-center">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">ID Created Successfully!</h2>
              <p className="text-green-100">Your blockchain-based digital tourist ID is ready</p>
            </div>

            {/* Digital ID Card */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">DIGITAL TOURIST ID</h3>
                    <p className="text-xs opacity-75">Blockchain Verified</p>
                  </div>
                  <Shield className="w-8 h-8 opacity-90" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{idData.name}</p>
                    <p className="text-sm opacity-90">Tourist ID: {idData.userId}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="opacity-75">Nationality</p>
                      <p className="font-medium">{idData.nationality}</p>
                    </div>
                    <div>
                      <p className="opacity-75">Valid Until</p>
                      <p className="font-medium">Dec 2025</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-75">Blockchain Hash</p>
                      <p className="text-sm font-mono">0x7d2f...a8c4</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">Your QR Code</h4>
                <div className="w-32 h-32 bg-gray-100 border-2 border-gray-200 rounded-xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
                  <img src={qrUrl} alt="Digital ID QR" className="w-32 h-32 object-contain" />
                </div>
                <p className="text-sm text-gray-600">
                  Show this QR code for instant identity verification
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button onClick={handleDownload} className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Digital ID
                </button>
                
                <button className="w-full border-2 border-blue-500 text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share QR Code
                </button>
              </div>

              {/* Security Features */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Security Features:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Blockchain verified identity</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Tamper-proof digital signature</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Real-time verification system</span>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => navigate('/tourist/dashboard')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalID;