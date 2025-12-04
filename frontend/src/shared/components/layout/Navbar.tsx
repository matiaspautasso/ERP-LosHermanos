import { Bell, Settings } from 'lucide-react';
import { useAuthStore } from '@core/store/authStore';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuthStore();

  // Obtener iniciales del usuario
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-14 md:h-16 bg-[rgba(44,91,45,0.5)] border-b-[5px] border-black flex items-center justify-between px-3 md:px-8">
      {/* Título de la vista */}
      <div className="flex-shrink-0 min-w-0 mr-2 md:mr-0">
        <h1 className="text-base md:text-xl truncate" style={{ color: '#fefbe4' }}>{title}</h1>
        {subtitle && <p className="text-xs md:text-sm truncate" style={{ color: '#afa2c3' }}>{subtitle}</p>}
      </div>

      {/* Usuario e iconos de acción */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Iconos de acción */}
        <button
          className="p-1.5 md:p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
          style={{ color: '#B2A6C5' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f1eef7'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B2A6C5'}
        >
          <Bell size={18} className="md:w-5 md:h-5" />
        </button>
        <button
          className="p-1.5 md:p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
          style={{ color: '#B2A6C5' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f1eef7'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B2A6C5'}
        >
          <Settings size={18} className="md:w-5 md:h-5" />
        </button>

        {/* Avatar usuario */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l-[2px]" style={{ borderColor: '#afa2c3' }}>
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#FB6564] to-[#A03CEA] flex items-center justify-center text-white text-xs md:text-sm">
            {user ? getInitials(user.username) : 'U'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm" style={{ color: '#f1eef7' }}>{user?.username || 'Usuario'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
