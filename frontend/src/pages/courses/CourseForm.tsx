import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { coursesApi } from '../../api/courses.api';
import { ArrowLeft, BookOpen, Hash, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nrc: '',
    period: '',
    group: 1,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'group' ? parseInt(value) || 1 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del curso es requerido';
    }

    if (!formData.nrc.trim()) {
      newErrors.nrc = 'El NRC es requerido';
    }

    if (!formData.period.trim()) {
      newErrors.period = 'El período es requerido';
    }

    if (formData.group < 1) {
      newErrors.group = 'El grupo debe ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await coursesApi.createCourse(formData);
      toast.success('¡Curso creado exitosamente!');
      navigate('/courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      const message = error.response?.data?.message || 'Error al crear el curso';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Cursos
          </button>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Crear Nuevo Curso</h1>
              <p className="text-slate-400">Añade un nuevo curso al sistema</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-6">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del Curso
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 border ${errors.name ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500`}
                  placeholder="ej: Estructuras de Datos"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* NRC */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                NRC
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  name="nrc"
                  type="text"
                  required
                  value={formData.nrc}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 border ${errors.nrc ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500`}
                  placeholder="ej: 12345"
                />
              </div>
              {errors.nrc && (
                <p className="mt-1 text-sm text-red-400">{errors.nrc}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Período
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    name="period"
                    type="text"
                    required
                    value={formData.period}
                    onChange={handleChange}
                    className={`w-full bg-slate-700/50 border ${errors.period ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500`}
                    placeholder="ej: 2025-1"
                  />
                </div>
                {errors.period && (
                  <p className="mt-1 text-sm text-red-400">{errors.period}</p>
                )}
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grupo
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    name="group"
                    type="number"
                    required
                    min="1"
                    value={formData.group}
                    onChange={handleChange}
                    className={`w-full bg-slate-700/50 border ${errors.group ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500`}
                  />
                </div>
                {errors.group && (
                  <p className="mt-1 text-sm text-red-400">{errors.group}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/courses')}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Crear Curso
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
