import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useAuth } from '../hooks/useAuth';
import logoLosHermanos from '@/assets/logo-los-hermanos.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!emailOrUsername || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    login({
      emailOrUsername,
      password,
      rememberMe,
    });
  };

  return (
    <div className="min-h-screen bg-[#2c5b2d] flex flex-col items-center px-4 py-8 lg:py-12">
      {/* Título Principal */}
      <h1
        className="text-[#fefbe4] text-center mb-8 lg:mb-10 text-4xl font-bold"
        style={{
          textShadow: 'rgba(0,0,0,0.25) 0px 4px 4px'
        }}
      >
        ERP LOS HERMANOS
      </h1>

      {/* Logo */}
      <div className="mb-8 lg:mb-12">
        <div className="w-full max-w-[400px] lg:max-w-[500px] aspect-[432/342]">
          <img
            src={logoLosHermanos}
            alt="Los Hermanos Logo"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Contenedor del Formulario de Login */}
      <div className="w-full max-w-[677px]">
        <div
          className="bg-[rgba(44,91,45,0.5)] backdrop-blur-sm rounded-2xl border-[5px] border-black p-8 lg:p-12"
          style={{
            boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)'
          }}
        >
          {/* Texto Instructivo */}
          <div className="mb-8 border border-black p-4">
            <p className="text-[#f1eef7] text-center leading-[1.5]">
              Ingresa tu correo y contraseña para ingresar
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-6">

            {/* Campo Correo/Usuario */}
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername" className="text-[#f1eef7]">
                Correo/Usuario
              </Label>
              <Input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] rounded-lg h-14 focus-visible:ring-[#a03cea] focus-visible:ring-offset-0"
                placeholder="correo@ejemplo.com"
                disabled={loginLoading}
              />
            </div>

            {/* Campo Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#f1eef7]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] rounded-lg h-14 pr-12 focus-visible:ring-[#a03cea] focus-visible:ring-offset-0"
                  placeholder="Ingresa tu contraseña"
                  disabled={loginLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B2A6C5] hover:text-[#f1eef7] transition-colors"
                  disabled={loginLoading}
                >
                  {showPassword ? (
                    <Eye className="w-6 h-6" />
                  ) : (
                    <EyeOff className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme y Olvidaste Contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-[#afa2c3] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FB6564] data-[state=checked]:to-[#A03CEA] data-[state=checked]:border-none"
                  disabled={loginLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-[#f1eef7] cursor-pointer select-none"
                >
                  Recordarme
                </label>
              </div>
              <button
                onClick={() => navigate('/recover')}
                className="text-[#f1eef7] underline hover:text-[#fefbe4] transition-colors"
                disabled={loginLoading}
              >
                ¿olvidaste tu contraseña?
              </button>
            </div>

            {/* Botones */}
            <div className="flex gap-6 pt-2">
              <Button
                onClick={handleLogin}
                disabled={loginLoading}
                className="flex-1 h-14 bg-gradient-to-r from-[#FB6564] to-[#A03CEA] hover:from-[#fa4a49] hover:to-[#8f2bd1] text-white rounded-lg transition-all"
              >
                {loginLoading ? 'Cargando...' : 'Ingresar'}
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                disabled={loginLoading}
                className="flex-1 h-14 bg-transparent border-2 border-[#f1eef7] text-[#f1eef7] hover:bg-[#f1eef7] hover:text-[#2c5b2d] rounded-lg transition-all"
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
