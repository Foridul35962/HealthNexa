"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Stethoscope,
  UserCheck,
  ClipboardList,
  PlusCircle,
  Building2,
  FlaskConical,
  ShoppingBag,
  Pencil,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  Building,
  Activity,
  Calendar,
  CalendarDays,
} from 'lucide-react'
import { AppDispatch, RootState } from '@/store/store'
import { logout } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'

// ── types ─────────────────────────────────────────────────────────────────────
type NavItem = {
  label: string
  href: string
  icon: React.ElementType
}

type StaffRole = 'hospitalAdmin' | 'receptionist' | 'doctor'
type Role = 'admin' | 'pharmacyOwner' | 'hospitalStaff' | 'patient'

// ── static nav configs ────────────────────────────────────────────────────────
const NAV_ADMIN: NavItem[] = [
  { label: 'Dashboard',        href: '/admin',                               icon: LayoutDashboard },
  { label: 'Hospital Requests',href: '/admin/registration-request/hospital', icon: Building2       },
  { label: 'Pharmacy Requests',href: '/admin/registration-request/pharmacy', icon: ShoppingBag     },
  { label: 'Medicine Requests',href: '/admin/registration-request/medicine', icon: FlaskConical    },
]

const NAV_PHARMACY: NavItem[] = [
  { label: 'Dashboard',    href: '/pharmacy',            icon: LayoutDashboard },
  { label: 'Edit Pharmacy',href: '/pharmacy/edit',       icon: Pencil          },
  { label: 'Add Medicine', href: '/medicine/add',        icon: PlusCircle      },
  { label: 'New Request',  href: '/medicine/new-request',icon: ClipboardList   },
]

const NAV_PATIENT: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/appointment', icon: Calendar },
  { label: 'Symptoms', href: '/symptoms', icon: Stethoscope },
]

// hospital staff links — needs hospitalId so built at runtime
const buildStaffLinks = (staffRole: StaffRole, hospitalId?: string): NavItem[] => {
  const hospitalLink: NavItem = {
    label: 'My Hospital',
    href:  `/hospitals/${hospitalId ?? ''}`,
    icon:  Building,
  }

  switch (staffRole) {
    case 'hospitalAdmin':
      return [
        { label: 'Dashboard',    href: '/hospital-admin',              icon: LayoutDashboard },
        { label: 'Add Doctor',   href: '/hospital-admin/add-doctor',   icon: PlusCircle      },
        { label: 'Doctors',      href: '/hospital-admin/doctors',      icon: Stethoscope     },
        { label: 'Receptionist', href: '/hospital-admin/receptionist', icon: UserCheck       },
        hospitalLink,
      ]
    case 'receptionist':
      return [
        { label: 'Dashboard', href: '/receptionist',           icon: LayoutDashboard },
        { label: 'Check-in',  href: '/receptionist/check-in',  icon: UserCheck       },
        { label: 'Recall',    href: '/receptionist/recall',    icon: ClipboardList   },
        hospitalLink,
      ]
    case 'doctor':
      return [
        { label: 'Dashboard',   href: '/doctor', icon: LayoutDashboard },
        hospitalLink,
      ]
    default:
      return [hospitalLink]
  }
}

const ROLE_LABEL: Record<Role, string> = {
  admin:         'Admin Panel',
  pharmacyOwner: 'Pharmacy',
  hospitalStaff: 'Hospital Staff',
  patient:       'Patient Portal',
}

const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  hospitalAdmin: 'Hospital Admin',
  receptionist:  'Receptionist',
  doctor:        'Doctor',
}

const EASE = [0.22, 1, 0.36, 1] as const

// ── logout modal ──────────────────────────────────────────────────────────────
const LogoutModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.28, ease: EASE }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">Confirm Logout</h3>
      <p className="text-sm text-slate-500 mb-6">
        Are you sure you want to log out? You will need to sign in again to access your account.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors shadow shadow-red-200"
        >
          Yes, Logout
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
)

// ── sidebar inner content ─────────────────────────────────────────────────────
const SidebarContent = ({
  links,
  roleLabel,
  displayName,
  email,
  imageUrl,
  initials,
  collapsed,
  onToggleCollapse,
  onNavClick,
  onLogout,
  isMobile,
}: {
  links: NavItem[]
  roleLabel: string
  displayName: string
  email: string
  imageUrl?: string
  initials: string
  collapsed: boolean
  onToggleCollapse: () => void
  onNavClick: () => void
  onLogout: () => void
  isMobile: boolean
}) => {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href ? (pathname === href || pathname.startsWith(href + '/')) : false

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* header */}
      <div
        className={`flex items-center border-b border-blue-50 px-3 py-3.5 shrink-0 ${
          collapsed && !isMobile ? 'flex-col gap-2' : 'justify-between gap-2'
        }`}
      >
        <Link href={'/'} className={`flex items-center gap-2.5 min-w-0 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow shadow-blue-200 shrink-0">
            <Activity size={15} className="text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-blue-900 tracking-tight truncate">Health Nexa</p>
              <p className="text-xs text-blue-400 truncate">{roleLabel}</p>
            </div>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* user badge */}
      <div className={`px-3 pt-3 pb-1 shrink-0 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
        {collapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {imageUrl
              ? <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {imageUrl
                ? <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900 truncate">{displayName}</p>
              <p className="text-xs text-blue-400 truncate">{email}</p>
            </div>
          </div>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {links.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onNavClick}>
              <div
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  collapsed && !isMobile ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <item.icon size={18} className="shrink-0" />

                {(!collapsed || isMobile) && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}

                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                    {item.label}
                    <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 block" />
                  </div>
                )}

                {active && collapsed && !isMobile && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* logout */}
      <div className={`px-3 pb-4 pt-2 border-t border-blue-50 shrink-0 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
        <button
          onClick={onLogout}
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150 w-full ${
            collapsed && !isMobile ? 'justify-center w-auto' : ''
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm font-medium">Logout</span>}
          {collapsed && !isMobile && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
              Logout
              <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 block" />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

// ── main export ───────────────────────────────────────────────────────────────
const Sidebar = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  const [collapsed, setCollapsed] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role      = (user?.role      ?? 'patient')  as Role
  const staffRole = (user?.staffRole ?? undefined)   as StaffRole | undefined

  // hospitalId may be an object (_id) or a plain string depending on populate
  const hospitalId: string | undefined =
    typeof user?.hospitalId === 'object'
      ? user?.hospitalId?._id
      : user?.hospitalId

  // build links at runtime so hospitalId is always fresh
  const links: NavItem[] =
    role === 'hospitalStaff' && staffRole
      ? buildStaffLinks(staffRole, hospitalId)
      : role === 'admin'         ? NAV_ADMIN
      : role === 'pharmacyOwner' ? NAV_PHARMACY
      : NAV_PATIENT

  const roleLabel =
    role === 'hospitalStaff' && staffRole
      ? STAFF_ROLE_LABEL[staffRole]
      : ROLE_LABEL[role]

  const displayName = user?.fullName ?? 'User'
  const email       = user?.email    ?? ''
  const imageUrl    = user?.image?.url
  const initials    = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    setShowLogout(false)
    try {
      await dispatch(logout(null)).unwrap()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const sharedProps = {
    links,
    roleLabel,
    displayName,
    email,
    imageUrl,
    initials,
    onLogout: () => setShowLogout(true),
  }

  return (
    <>
      {/* desktop sidebar */}
      <motion.aside
        animate={{
          width:    collapsed ? 68 : 260,
          minWidth: collapsed ? 68 : 260,
          maxWidth: collapsed ? 68 : 260,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="hidden md:block h-screen sticky top-0 bg-white border-r border-blue-100 z-20 shrink-0 overflow-hidden"
      >
        <SidebarContent
          {...sharedProps}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onNavClick={() => {}}
          isMobile={false}
        />
      </motion.aside>

      {/* mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-white border border-blue-100 shadow-md flex items-center justify-center text-blue-600"
      >
        <Menu size={18} />
      </button>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: EASE }}
              className="md:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3.5 right-3 z-10 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
              <SidebarContent
                {...sharedProps}
                collapsed={false}
                onToggleCollapse={() => {}}
                onNavClick={() => setMobileOpen(false)}
                isMobile={true}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* logout modal */}
      <AnimatePresence>
        {showLogout && (
          <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar