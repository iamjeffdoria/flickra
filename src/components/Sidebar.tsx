import { Home, Users, Shield, Trophy, BarChart2, MessageCircle, Bell, User, Settings, Menu, X } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', badge: null },
  { icon: Users, label: 'Squad Finder', badge: 3 },
  { icon: Shield, label: 'Clans', badge: null },
  { icon: Trophy, label: 'Tournaments', badge: null },
  { icon: BarChart2, label: 'Leaderboard', badge: null },
]

const bottomItems = [
  { icon: MessageCircle, label: 'Messages', badge: 2 },
  { icon: Bell, label: 'Notifications', badge: null },
  { icon: User, label: 'Profile', badge: null },
  { icon: Settings, label: 'Settings', badge: null },
]

interface SidebarProps {
  active: string
  onNavigate: (label: string) => void
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const NavItem = ({ icon: Icon, label, badge }: { icon: any, label: string, badge: number | null }) => (
    <button
      onClick={() => { onNavigate(label); onMobileClose() }}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition text-left ${
        active === label
          ? 'bg-violet-100 text-violet-700'
          : 'text-gray-500 hover:bg-violet-50 hover:text-violet-600'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && (
        <span className="text-xs font-bold flex-1">{label}</span>
      )}
      {!collapsed && badge && (
        <span className="text-[9px] font-extrabold bg-violet-500 text-white px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-3 px-2">
      {/* Toggle button — desktop only */}
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center w-8 h-8 mb-4 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition self-end"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex flex-col gap-0.5">
        {navItems.map(item => <NavItem key={item.label} {...item} />)}
      </div>

      <div className="my-3 border-t border-gray-100" />

      <div className="flex flex-col gap-0.5">
        {bottomItems.map(item => <NavItem key={item.label} {...item} />)}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-gray-100 bg-white transition-all duration-200 shrink-0 sticky top-1 self-start h-[calc(100vh-3.5rem)] overflow-y-auto ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-screen w-56 bg-white shadow-xl z-10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <span className="text-sm font-extrabold text-gray-900">Menu</span>
              <button onClick={onMobileClose}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}