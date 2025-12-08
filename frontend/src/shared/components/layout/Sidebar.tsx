import { Package, ShoppingCart, Users, TrendingUp, ChevronDown, ChevronRight, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@modules/auth/hooks/useAuth';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [ventasExpanded, setVentasExpanded] = useState(true);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleVentas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVentasExpanded(!ventasExpanded);
  };

  return (
    <div className="w-24 md:w-64 h-screen bg-[rgba(44,91,45,0.5)] border-r-[5px] border-black flex flex-col">
      {/* Logo / Título */}
      <div className="p-2 md:p-6 border-b-[5px] border-black flex justify-center md:block">
        <h2 className="text-base md:text-2xl" style={{ color: '#fefbe4' }}>
          <span className="md:hidden">LH</span>
          <span className="hidden md:inline">ERP Los Hermanos</span>
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-2 md:py-4">
        {/* Stock */}
        <button
          onClick={() => navigate('/stock')}
          className={`w-full px-0.5 pr-1 md:px-6 py-2 md:py-3 mb-1.5 md:mb-3 flex items-center gap-0.5 md:gap-3 transition-all ${
            isActive('/stock') ? 'bg-[rgba(160,60,234,0.2)] border-l-4 border-[#a03cea]' : 'hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={{ color: isActive('/stock') ? '#fefbe4' : '#f1eef7' }}
        >
          <Package size={16} className="md:w-5 md:h-5 flex-shrink-0" style={{ color: isActive('/stock') ? '#fefbe4' : '#B2A6C5' }} />
          <span className="text-xs md:text-base text-left leading-tight">Stock</span>
        </button>

        {/* Ventas (expandible) */}
        <div className="mb-1.5 md:mb-3">
          <button
            onClick={toggleVentas}
            className={`w-full px-0.5 pr-1 md:px-6 py-2 md:py-3 flex items-center gap-0.5 md:gap-3 transition-all ${
              isActive('/ventas') ? 'bg-[rgba(160,60,234,0.2)] border-l-4 border-[#a03cea]' : 'hover:bg-[rgba(255,255,255,0.05)]'
            }`}
            style={{ color: isActive('/ventas') ? '#fefbe4' : '#f1eef7' }}
          >
            <ShoppingCart size={16} className="md:w-5 md:h-5 flex-shrink-0" style={{ color: isActive('/ventas') ? '#fefbe4' : '#B2A6C5' }} />
            <span className="flex-1 text-left text-xs md:text-base leading-tight">Ventas</span>
            {ventasExpanded ? (
              <ChevronDown size={14} className="md:w-4 md:h-4 flex-shrink-0" style={{ color: '#B2A6C5' }} />
            ) : (
              <ChevronRight size={14} className="md:w-4 md:h-4 flex-shrink-0" style={{ color: '#B2A6C5' }} />
            )}
          </button>

          {/* Submenu de Ventas */}
          {ventasExpanded && (
            <div className="bg-[rgba(0,0,0,0.2)]">
              <button
                onClick={() => navigate('/ventas/nueva')}
                className={`w-full px-2 pr-1 md:px-12 py-2 md:py-2.5 flex items-center gap-2 transition-all text-xs md:text-sm ${
                  location.pathname === '/ventas/nueva' ? '' : 'hover:bg-[rgba(255,255,255,0.05)]'
                }`}
                style={{
                  color: location.pathname === '/ventas/nueva' ? '#fefbe4' : '#f1eef7',
                  backgroundColor: location.pathname === '/ventas/nueva' ? 'rgb(136, 21, 19)' : 'transparent'
                }}
              >
                <span className="text-left leading-tight">Nueva<br className="md:hidden"/> Venta</span>
              </button>
              <button
                onClick={() => navigate('/ventas/lista')}
                className={`w-full px-2 pr-1 md:px-12 py-2 md:py-2.5 flex items-center gap-2 transition-all text-xs md:text-sm ${
                  location.pathname === '/ventas/lista' ? '' : 'hover:bg-[rgba(255,255,255,0.05)]'
                }`}
                style={{
                  color: location.pathname === '/ventas/lista' ? '#fefbe4' : '#f1eef7',
                  backgroundColor: location.pathname === '/ventas/lista' ? 'rgb(136, 21, 19)' : 'transparent'
                }}
              >
                <span className="text-left leading-tight">Lista<br className="md:hidden"/> Ventas</span>
              </button>
              <button
                onClick={() => navigate('/gestion-precios')}
                className={`w-full px-2 pr-1 md:px-12 py-2 md:py-2.5 flex items-center gap-2 transition-all text-xs md:text-sm ${
                  location.pathname === '/gestion-precios' ? '' : 'hover:bg-[rgba(255,255,255,0.05)]'
                }`}
                style={{
                  color: location.pathname === '/gestion-precios' ? '#fefbe4' : '#f1eef7',
                  backgroundColor: location.pathname === '/gestion-precios' ? 'rgb(136, 21, 19)' : 'transparent'
                }}
              >
                <span className="text-left leading-tight">Gestión<br className="md:hidden"/> Precios</span>
              </button>
            </div>
          )}
        </div>

        {/* Compras y Proveedores */}
        <button
          onClick={() => navigate('/compras')}
          className={`w-full px-0.5 pr-1 md:px-6 py-2 md:py-3 mb-1.5 md:mb-3 flex items-center gap-0.5 md:gap-3 transition-all ${
            isActive('/compras') ? 'bg-[rgba(160,60,234,0.2)] border-l-4 border-[#a03cea]' : 'hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={{ color: isActive('/compras') ? '#fefbe4' : '#f1eef7' }}
        >
          <FileText size={16} className="md:w-5 md:h-5 flex-shrink-0" style={{ color: isActive('/compras') ? '#fefbe4' : '#B2A6C5' }} />
          <span className="text-xs md:text-base text-left leading-tight">Compras</span>
        </button>

        {/* Clientes */}
        <button
          onClick={() => navigate('/clientes')}
          className={`w-full px-0.5 pr-1 md:px-6 py-2 md:py-3 mb-1.5 md:mb-3 flex items-center gap-0.5 md:gap-3 transition-all ${
            isActive('/clientes') ? 'bg-[rgba(160,60,234,0.2)] border-l-4 border-[#a03cea]' : 'hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={{ color: isActive('/clientes') ? '#fefbe4' : '#f1eef7' }}
        >
          <Users size={16} className="md:w-5 md:h-5 flex-shrink-0" style={{ color: isActive('/clientes') ? '#fefbe4' : '#B2A6C5' }} />
          <span className="text-xs md:text-base text-left leading-tight">Clientes</span>
        </button>

        {/* Reportes e Indicadores */}
        <button
          onClick={() => navigate('/reportes')}
          className={`w-full px-0.5 pr-1 md:px-6 py-2 md:py-3 flex items-center gap-0.5 md:gap-3 transition-all ${
            isActive('/reportes') ? 'bg-[rgba(160,60,234,0.2)] border-l-4 border-[#a03cea]' : 'hover:bg-[rgba(255,255,255,0.05)]'
          }`}
          style={{ color: isActive('/reportes') ? '#fefbe4' : '#f1eef7' }}
        >
          <TrendingUp size={16} className="md:w-5 md:h-5 flex-shrink-0" style={{ color: isActive('/reportes') ? '#fefbe4' : '#B2A6C5' }} />
          <span className="text-xs md:text-base text-left leading-tight">Reportes</span>
        </button>
      </nav>

      {/* Usuario y Cerrar Sesión */}
      <div className="border-t-[5px] border-black p-1.5 md:p-6">
        <button
          onClick={() => logout()}
          className="w-full px-1.5 md:px-4 py-1.5 md:py-2.5 flex items-center justify-center gap-1 md:gap-2 rounded-lg border-2 md:border-[3px] bg-transparent transition-all hover:bg-[#f1eef7]"
          style={{
            borderColor: '#f1eef7',
            color: '#f1eef7'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1eef7';
            e.currentTarget.style.color = '#2c5b2d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#f1eef7';
          }}
        >
          <LogOut size={14} className="md:w-[18px] md:h-[18px]" />
          <span className="text-xs md:text-sm hidden md:inline">Cerrar Sesión</span>
          <span className="text-xs md:hidden">Salir</span>
        </button>
      </div>
    </div>
  );
}
