'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  BarChart3,
  Dumbbell,
  UtensilsCrossed,
  LogOut,
  X,
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Settings,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useState } from 'react';

const navItems = [
  {
    id: 'clientes',
    label: 'Clientes',
    href: '/main/clientes',
    icon: Users,
    description: 'Gestionar socios',
  },
  {
    id: 'fichaje',
    label: 'Fichaje',
    href: '/main/fichaje',
    icon: Activity,
    description: 'Registro de ingresos',
  },
  {
    id: 'rutinas',
    label: 'Rutinas',
    href: '/main/rutinas',
    icon: Dumbbell,
    description: 'Planes de ejercicio',
  },
  {
    id: 'ejercicios',
    label: 'Ejercicios',
    href: '/main/ejercicios',
    icon: Dumbbell,
    description: 'Biblioteca técnica',
  },
  {
    id: 'dietas',
    label: 'Dietas',
    href: '/main/dietas',
    icon: UtensilsCrossed,
    description: 'Planes nutricionales',
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    href: '/main/estadisticas',
    icon: BarChart3,
    description: 'Reportes y métricas',
  },
  {
    id: 'ver-tienda',
    label: 'Ver Tienda',
    href: '/shop',
    icon: ShoppingBag,
    description: 'Tienda online',
    external: true,
  },
];

const ecommerceSubItems = [
  {
    id: 'ecommerce-dashboard',
    label: 'Dashboard',
    href: '/main/ecommerce',
    icon: LayoutDashboard,
  },
  {
    id: 'ecommerce-productos',
    label: 'Productos',
    href: '/main/ecommerce/productos',
    icon: Package,
  },
  {
    id: 'ecommerce-ordenes',
    label: 'Órdenes',
    href: '/main/ecommerce/ordenes',
    icon: ShoppingCart,
  },
  {
    id: 'ecommerce-cupones',
    label: 'Cupones',
    href: '/main/ecommerce/cupones',
    icon: Ticket,
  },
  {
    id: 'ecommerce-config',
    label: 'Config',
    href: '/main/ecommerce/config',
    icon: Settings,
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [ecommerceExpanded, setEcommerceExpanded] = useState(false);

  const isEcommerceActive = ecommerceSubItems.some(
    (item) => pathname.startsWith(item.href)
  );

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            role="presentation"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 lg:hidden"
          >
            <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-xl">
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#1a1a1a]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading text-xl font-bold text-sidebar-foreground">
                      SEVJO
                    </span>
                    <span className="text-xs text-sidebar-foreground/60">
                      Menú principal
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={22} className="text-sidebar-foreground" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {/* Nav Items */}
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-150",
                        isActive
                          ? "bg-primary text-[#1a1a1a]"
                          : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#1a1a1a]" />
                      )}
                    </Link>
                  );
                })}

                {/* Ecommerce Section */}
                <div className="mt-2 mb-1">
                  <button
                    onClick={() => setEcommerceExpanded(!ecommerceExpanded)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150",
                      isEcommerceActive
                        ? "bg-primary text-[#1a1a1a]"
                        : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <Store className="w-5 h-5" />
                    <div className="flex-1 flex flex-col text-left">
                      <span className="text-sm font-semibold">Ecommerce</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        ecommerceExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {ecommerceExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 pl-4 border-l border-sidebar-border">
                          {ecommerceSubItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 transition-all duration-150",
                                  isActive
                                    ? "bg-primary text-[#1a1a1a]"
                                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                                )}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-sidebar-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-colors font-semibold"
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label="Abrir menú"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}