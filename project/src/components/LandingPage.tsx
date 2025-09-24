import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, MapPin, AlertTriangle, Zap, Globe, Eye, Heart, Star, ArrowRight, Play, CheckCircle, TrendingUp, Award, Clock, Target, BarChart3, Smartphone, Lock, Wifi, Video, Megaphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LandingPage = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
  <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{t('appName')}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Solutions</a>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="hi">🇮🇳 HI</option>
                <option value="mr">🇮🇳 MR</option>
                <option value="bn">🇧🇩 BN</option>
                <option value="te">🇮🇳 TE</option>
              </select>
              <Link to="/tourist/login" className="text-gray-600 hover:text-blue-600 font-medium">Sign In</Link>
              <Link to="/tourist/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with NE mountains background and role-based login */}
      <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-20" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-100/80 z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Tourist Safety Platform
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight drop-shadow-lg">
                  North East India
                  <span className="text-blue-600"> Tourist Safety</span>
                  <br />with AI & Blockchain
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed drop-shadow">
                  The world's first comprehensive tourist safety monitoring system for the North East, powered by AI, real-time analytics, and blockchain. Protecting travelers in the mountains and valleys of India.
                </p>
              </div>

              {/* Role-based login buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/tourist/login"
                  className="bg-[#2e7d32] text-white px-8 py-4 rounded-lg hover:bg-[#1a237e] transition-all duration-300 font-semibold text-lg flex items-center justify-center group shadow-lg"
                >
                  Tourist Login
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/authority/login"
                  className="bg-[#ff9800] text-white px-8 py-4 rounded-lg hover:bg-[#e65100] transition-all duration-300 font-semibold text-lg flex items-center justify-center group shadow-lg"
                >
                  Authority/Admin Login
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Live Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Live Video Capture</span>
                      </div>
                      <p className="text-xs text-red-900/80">Record and send emergency video instantly</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Location Tracking</span>
                      </div>
                      <p className="text-xs text-blue-900/80">Real-time GPS with safe-zone geofencing</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Megaphone className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Broadcast Messages</span>
                      </div>
                      <p className="text-xs text-purple-900/80">Send alerts and advisories to all tourists</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Emergency SOS</span>
                      </div>
                      <p className="text-xs text-green-900/80">One‑tap help with auto location sharing</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cutting-Edge Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the latest in AI, blockchain, and real-time analytics to provide 
              unparalleled tourist safety and monitoring capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Real-Time Geo-Fencing",
                description: "AI-powered location monitoring with instant alerts when tourists enter or exit designated safe zones.",
                color: "blue"
              },
              {
                icon: AlertTriangle,
                title: "Emergency SOS System",
                description: "One-tap emergency alerts with automatic location sharing and instant response coordination.",
                color: "red"
              },
              {
                icon: Users,
                title: "Crowd Analytics",
                description: "Machine learning algorithms analyze crowd density and predict potential safety risks in real-time.",
                color: "green"
              },
              {
                icon: Shield,
                title: "Blockchain Identity",
                description: "Secure, tamper-proof digital identity verification using advanced blockchain technology.",
                color: "purple"
              },
              {
                icon: BarChart3,
                title: "Predictive Analytics",
                description: "AI-driven insights predict safety risks and optimize resource allocation for authorities.",
                color: "orange"
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Multi-language support and international compliance for worldwide tourist safety operations.",
                color: "cyan"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Two Powerful Solutions,
                  <br />One Unified Platform
                </h2>
                <p className="text-xl text-gray-600">
                  Whether you're a tourist seeking safety or an authority managing public security, 
                  our platform provides tailored solutions for every stakeholder.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">For Tourists</h4>
                    <p className="text-gray-600">Personal safety monitoring, emergency alerts, and real-time guidance for secure travel experiences.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">For Authorities</h4>
                    <p className="text-gray-600">Comprehensive command center with real-time monitoring, analytics, and emergency response coordination.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Link 
                to="/tourist/signup"
                className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Tourist Access</h3>
                    <p className="text-blue-100 text-sm mb-4">Stay safe while exploring new destinations</p>
                    <div className="flex items-center text-sm font-medium">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link 
                to="/authority/login"
                className="group bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Authority Access</h3>
                    <p className="text-red-100 text-sm mb-4">Monitor and respond to tourist safety</p>
                    <div className="flex items-center text-sm font-medium">
                      <span>Access Portal</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <div className="space-y-3">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <h4 className="font-semibold text-gray-900">Industry Leading</h4>
                  <p className="text-sm text-gray-600">99.9% uptime with enterprise-grade security</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-xl">
                <div className="space-y-3">
                  <Clock className="w-8 h-8 text-green-500" />
                  <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Round-the-clock monitoring and assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-blue-100">Join thousands of organizations already using ResQNow</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50,000+", label: "Active Users", icon: Users },
              { number: "99.9%", label: "Uptime SLA", icon: Target },
              { number: "150+", label: "Countries", icon: Globe },
              { number: "24/7", label: "Support", icon: Clock }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-gray-900">
              Ready to Transform Tourist Safety?
            </h2>
            <p className="text-xl text-gray-600">
              Join the revolution in tourist safety monitoring. Start your free trial today 
              and experience the future of travel security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/tourist/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/authority/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold text-lg"
              >
                Request Demo
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ResQNow</span>
              </div>
              <p className="text-gray-400">
                The world's leading AI-powered tourist safety monitoring platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Features</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">API</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Documentation</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Blog</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Careers</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Help Center</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Community</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Status</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Security</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 ResQNow. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;