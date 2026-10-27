import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  FileText,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  Layers,
  Users,
  CheckSquare,
  DollarSign,
  ShieldAlert,
  SlidersHorizontal,
  Type,
  Check,
  Sparkles,
} from 'lucide-react';
import { googleSignIn, logoutGoogle } from '../services/auth';
import {
  CHIC_FONT_OPTIONS,
  loadStoredFontSettings,
  applyFontSettings,
  FontSettings,
} from '../services/fontSettings';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenExportModal,
}) => {
  const {
    plan,
    currentUser,
    members,
    setCurrentUser,
    unreadNotifsCount,
    activeTab,
    setActiveTab,
    googleToken,
    setGoogleToken,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingMenuOpen, setSettingMenuOpen] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [fontSettings, setFontSettings] = useState<FontSettings>(() => loadStoredFontSettings());

  useEffect(() => {
    applyFontSettings(fontSettings);
  }, [fontSettings]);

  const handleSelectFont = (fontId: string) => {
    const updated = { ...fontSettings, selectedFontId: fontId };
    setFontSettings(updated);
    applyFontSettings(updated);
  };

  const handleToggleScope = (applyToAll: boolean) => {
    const updated = { ...fontSettings, applyToAll };
    setFontSettings(updated);
    applyFontSettings(updated);
  };

  const handleGoogleAuth = async () => {
    setIsSigningInGoogle(true);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setGoogleToken(res.accessToken);
        // If Google user matches an existing member, switch to it
        const email = res.user.email?.toLowerCase();
        const found = members.find(m => m.email.toLowerCase() === email);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleToken(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* ZONE 1: Brand Wordmark & Top Title Line "Setting" Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('checklist')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors font-app-title">
                  福委會活動規劃
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {plan?.version || 'V0.1'}
                </span>
              </div>
            </button>

            {/* Setting Button on the top title line */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingMenuOpen(!settingMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all focus:outline-none shadow-2xs ${
                  settingMenuOpen
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="字體與系統偏好設定 (Setting)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="font-semibold">Setting</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${settingMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Setting Popover */}
              {settingMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSettingMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-sm">視覺字體設定 (Typography Setting)</h4>
                      </div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        即時在線生效
                      </span>
                    </div>

                    {/* Scope Switcher */}
                    <div className="my-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                      <div className="text-[11px] font-semibold text-slate-600 mb-1.5">字體套用範圍 (Apply Scope)：</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleScope(false)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-center border ${
                            !fontSettings.applyToAll
                              ? 'bg-white text-indigo-600 border-indigo-300 shadow-2xs font-bold'
                              : 'text-slate-600 hover:bg-white/80 border-transparent'
                          }`}
                        >
                          僅頂部標題列
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleScope(true)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-center border ${
                            fontSettings.applyToAll
                              ? 'bg-white text-indigo-600 border-indigo-300 shadow-2xs font-bold'
                              : 'text-slate-600 hover:bg-white/80 border-transparent'
                          }`}
                        >
                          全站通用 (推薦)
                        </button>
                      </div>
                    </div>

                    {/* Font Options List */}
                    <div className="mb-2">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        字體樣式庫 (Chic Font Options)
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                        {CHIC_FONT_OPTIONS.map((font) => {
                          const isSelected = fontSettings.selectedFontId === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => handleSelectFont(font.id)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-2xs'
                                  : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-bold text-sm tracking-tight truncate text-slate-900 group-hover:text-indigo-600 transition-colors"
                                    style={{ fontFamily: font.family }}
                                  >
                                    {font.name}
                                  </span>
                                  {font.id === 'google-sans-flex' && (
                                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                                      Google
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {font.category}
                                  </span>
                                </div>
                                <div
                                  className="text-xs text-slate-500 truncate mt-0.5"
                                  style={{ fontFamily: font.family }}
                                >
                                  {font.preview} · {font.chicTag}
                                </div>
                              </div>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>已自動儲存至偏好</span>
                      <button
                        type="button"
                        onClick={() => setSettingMenuOpen(false)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        完成
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ZONE 2: 4-5 Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'checklist'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>流程檢核表</span>
            </button>

            <button
              onClick={() => setActiveTab('teamboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'teamboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>協作小組看板</span>
            </button>

            <button
              onClick={() => setActiveTab('deliverables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'deliverables'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>交付項目清冊</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'budget'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>預算與決策規則</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'admin'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>權限授權中心</span>
            </button>
          </nav>

          {/* ZONE 3: 1 Primary Action + Notification Bell + User Persona switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real-time Notifications Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              title="即時通報與動態歷程"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full font-tabular">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Primary Action Button: Export to Google Docs */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <FileText className="w-4 h-4" />
              <span>匯出 Google 文件</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 text-xs border border-slate-200 rounded-lg hover:border-slate-300 bg-white transition-colors focus:outline-none"
              >
                <img
                  src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full bg-slate-100 object-cover"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="font-semibold text-slate-900 truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentUser.role === 'super_admin' ? 'Super Admin' :
                     currentUser.role === 'chairperson' ? '主委 (行政)' :
                     currentUser.canEdit ? `${currentUser.group}組委員` : '唯讀觀察員'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {currentUser.group}組
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        currentUser.canEdit
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {currentUser.canEdit ? '具備編輯授權' : '唯讀無編輯權'}
                      </span>
                    </div>
                  </div>

                  {/* Google Workspace Connection status */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[11px] font-medium text-slate-700 mb-1">
                      Google Workspace 授權狀態
                    </p>
                    {googleToken ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> 已連線 Google 帳戶
                        </span>
                        <button
                          onClick={handleGoogleLogout}
                          className="text-[10px] text-slate-500 hover:text-red-600 underline"
                        >
                          登出
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleGoogleAuth}
                        disabled={isSigningInGoogle}
                        className="w-full text-left text-[11px] text-indigo-600 hover:text-indigo-800 font-medium py-0.5"
                      >
                        {isSigningInGoogle ? '連線中...' : '連結 Google 帳戶以啟用 Docs 匯出'}
                      </button>
                    )}
                  </div>

                  {/* Persona Switcher for Evaluation */}
                  <div className="px-3 py-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      切換測試身分 (Demo Switcher)
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {members.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setCurrentUser(m);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded text-xs transition-colors ${
                            currentUser.id === m.id
                              ? 'bg-indigo-50 text-indigo-900 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium">{m.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {m.email} · {m.group}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {m.role === 'super_admin' ? 'Admin' : m.canEdit ? '可編輯' : '唯讀'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
