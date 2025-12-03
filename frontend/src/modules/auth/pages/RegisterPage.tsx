import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  

  const handleRegister = async () => {
    // Validación simple
    if (!email || !username || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

    if (password.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    // Llamar al backend
    register({ email, username, password });
  };

  return (
    <div className="min-h-screen bg-[#2c5b2d] flex flex-col items-center px-4 py-8 lg:py-12">
      {/* Título Principal */}
      <h1
        className="text-[#fefbe4] text-center mb-12 lg:mb-16 text-4xl font-bold"
        style={{
          textShadow: 'rgba(0,0,0,0.25) 0px 4px 4px'
        }}
      >
        Registro de usuario
      </h1>

      {/* Contenedor del Formulario de Registro */}
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
              Ingresa tu correo y contraseña para registrarte
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-6">

            {/* Campo Correo */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#f1eef7]">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] rounded-lg h-14 focus-visible:ring-[#a03cea] focus-visible:ring-offset-0"
                placeholder="correo@ejemplo.com"
                disabled={registerLoading}
              />
            </div>

            {/* Campo Usuario */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#f1eef7]">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] rounded-lg h-14 focus-visible:ring-[#a03cea] focus-visible:ring-offset-0"
                placeholder="Ingresa tu usuario"
                disabled={registerLoading}
              />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#f1eef7]">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] rounded-lg h-14 pr-12 focus-visible:ring-[#a03cea] focus-visible:ring-offset-0"
                  placeholder="Ingresa tu contraseña"
                  disabled={registerLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B2A6C5] hover:text-[#f1eef7] transition-colors"
                  disabled={registerLoading}
                >
                  {showPassword ? (
                    <Eye className="w-6 h-6" />
                  ) : (
                    <EyeOff className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón Registrarse */}
            <div className="pt-6">
              <Button
                onClick={handleRegister}
                disabled={registerLoading}
                className="w-full h-14 bg-transparent border-[5px] border-[#f1eef7] text-[#f1eef7] hover:bg-[#f1eef7] hover:text-[#2c5b2d] rounded-lg transition-all"
              >
                {registerLoading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </div>
          </div>
        </div>

        {/* Link a Iniciar Sesión */}
        <div className="mt-8 text-center">
          <span className="text-white mr-2">¿ya tenes cuenta?</span>
          <button
            onClick={() => navigate('/login')}
            className="text-white hover:text-[#fefbe4] transition-colors underline"
            disabled={registerLoading}
          >
            Iniciar sesion
          </button>
        </div>
      </div>
    </div>
  );
}
