'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Database, Palette, Shield, Save, Check, Smartphone, Monitor, Sun, Moon, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Profile Settings
    userName: '',
    email: '',
    
    // Notification Settings
    emailNotifications: true,
    followUpReminders: true,
    weeklyReports: false,
    
    // Data Settings
    autoBackup: true,
    dataRetention: '1year',
    
    // Appearance Settings
    theme: 'light',
    compactView: false,
    
    // Privacy Settings
    shareAnalytics: false,
    publicProfile: false
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you'd save to your backend here
    localStorage.setItem('jobTrackerSettings', JSON.stringify(settings));
    
    setSaved(true);
    setLoading(false);
    
    // Reset saved status after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('jobTrackerSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Enhanced Responsive Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
            <Settings className="h-8 w-8 sm:h-10 sm:w-10 text-slate-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Customize your job tracking experience
          </p>
        </div>

        {/* Responsive Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Settings Content - Responsive Column Span */}
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            
            {/* Profile Settings - Mobile Optimized */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="bg-blue-100 rounded-full p-2 sm:p-2.5">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Profile Settings</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={(e) => handleSettingChange('userName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings - Mobile Optimized */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="bg-amber-100 rounded-full p-2 sm:p-2.5">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-amber-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Notifications</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">Email Notifications</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Receive updates about your applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">Follow-up Reminders</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Get reminded to follow up on applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.followUpReminders}
                      onChange={(e) => handleSettingChange('followUpReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">Weekly Reports</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Receive weekly progress summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.weeklyReports}
                      onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data & Privacy Settings - Mobile Optimized */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="bg-green-100 rounded-full p-2 sm:p-2.5">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Data & Privacy</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Retention Period
                  </label>
                  <select
                    value={settings.dataRetention}
                    onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none bg-white transition-colors"
                  >
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="forever">Keep Forever</option>
                  </select>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">Auto Backup</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Automatically backup your data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm sm:text-base">Share Analytics</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Help improve the app with anonymous usage data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.shareAnalytics}
                      onChange={(e) => handleSettingChange('shareAnalytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Appearance Settings - Enhanced Mobile Layout */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="bg-purple-100 rounded-full p-2 sm:p-2.5">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Appearance</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, description: 'Classic light mode' },
                      { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
                      { value: 'auto', label: 'Auto', icon: Monitor, description: 'Follows system' }
                    ].map((theme) => {
                      const IconComponent = theme.icon;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => handleSettingChange('theme', theme.value)}
                          className={`flex flex-col items-center space-y-2 px-3 py-4 rounded-xl border-2 transition-all ${
                            settings.theme === theme.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                          <div className="text-center">
                            <div className="font-medium text-sm sm:text-base">{theme.label}</div>
                            <div className="text-xs text-slate-500 mt-1 hidden sm:block">{theme.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="bg-slate-100 rounded-full p-2 flex-shrink-0">
                      <Zap className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm sm:text-base">Compact View</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">Show more information in less space</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.compactView}
                      onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Responsive Save Panel */}
          <div className="xl:col-span-1">
            {/* Mobile: Fixed bottom, Desktop: Sticky sidebar */}
            <div className="xl:sticky xl:top-8">
              {/* Mobile Fixed Save Button */}
              <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-10">
                <button
                  onClick={handleSave}
                  disabled={loading || saved}
                  className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-base ${
                    saved
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : loading
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div>
                      <span>Saving...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>

              {/* Desktop Save Panel */}
              <div className="hidden xl:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Changes</h3>
                
                <button
                  onClick={handleSave}
                  disabled={loading || saved}
                  className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    saved
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : loading
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div>
                      <span>Saving...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
                
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💾</span>
                    <span>Settings are saved locally</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔄</span>
                    <span>Changes take effect immediately</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🛡️</span>
                    <span>Your data stays private</span>
                  </div>
                </div>
              </div>

              {/* Settings Summary Card - Desktop Only */}
              <div className="hidden xl:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Theme</span>
                    <span className="font-medium capitalize">{settings.theme}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Notifications</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      settings.emailNotifications ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {settings.emailNotifications ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Auto Backup</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      settings.autoBackup ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {settings.autoBackup ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Add bottom padding to prevent content being hidden behind fixed button */}
        <div className="xl:hidden h-24"></div>
      </div>
    </div>
  );
}