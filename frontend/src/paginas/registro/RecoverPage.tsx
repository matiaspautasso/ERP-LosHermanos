import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/componentes/ui/alert-dialog';

export default function RecoverPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    // Validación simple
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);

    try {
      // TODO: Conectar con el backend
      console.log('Recuperación de cuenta para:', email);

      // Mostrar diálogo de confirmación
      setShowDialog(true);

      // Cerrar diálogo automáticamente después de 3 segundos
      setTimeout(() => {
        setShowDialog(false);
      }, 3000);
    } catch (error) {
      toast.error('Error al recuperar contraseña');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#2c5b2d] flex flex-col items-center px-4 py-8 lg:py-12">
        {/* Título Principal */}
        <h1
          className="text-[#fefbe4] text-center mb-12 lg:mb-16 max-w-3xl text-3xl font-bold"
          style={{
            textShadow: 'rgba(0,0,0,0.25) 0px 4px 4px'
          }}
        >
          ¿Olvidaste tu contraseña / usuario?
        </h1>

        {/* Contenedor del Formulario de Recuperación */}
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
                ingresa tu correo
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
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && handleRecover()}
                />
              </div>

              {/* Botón Recuperar */}
              <div className="pt-6">
                <Button
                  onClick={handleRecover}
                  disabled={loading}
                  className="w-full h-14 bg-transparent border-[5px] border-[#f1eef7] text-[#f1eef7] hover:bg-[#f1eef7] hover:text-[#2c5b2d] rounded-lg transition-all"
                >
                  {loading ? 'Procesando...' : 'Recuperar cuenta'}
                </Button>
              </div>
            </div>
          </div>

          {/* Link Volver */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:text-[#fefbe4] transition-colors underline"
              disabled={loading}
            >
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1f2024] text-center">
              Mensaje
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#71727a] text-center">
              se envió un nuevo usuario y contraseña al correo registrado
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
