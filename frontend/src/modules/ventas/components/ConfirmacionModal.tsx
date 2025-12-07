interface ConfirmacionModalProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmacionModal({ mensaje, onConfirm, onCancel }: ConfirmacionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="bg-[#2c5b2d] border-[5px] border-black rounded-lg p-6 w-full max-w-md mx-4"
        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
      >
        <h2 className="text-xl mb-4" style={{ color: '#fefbe4' }}>
          Confirmar acción
        </h2>

        <p className="mb-6" style={{ color: '#f1eef7' }}>
          {mensaje}
        </p>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border-[2px] transition-all"
            style={{
              borderColor: '#afa2c3',
              color: '#f1eef7',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#a03cea';
              e.currentTarget.style.background = 'rgba(160, 60, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#afa2c3';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
