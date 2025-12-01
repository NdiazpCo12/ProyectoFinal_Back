import React from 'react';
import { useParams } from 'react-router-dom';

const ChallengeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Editar Challenge
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">
          Editando el Challenge con ID: <strong>{id}</strong>
        </p>
        <p className="mt-4 text-gray-500">
          (Aquí se mostrará un formulario para editar los detalles del challenge, como título, descripción, dificultad, etc.).
        </p>
      </div>
    </div>
  );
};

export default ChallengeEdit;
