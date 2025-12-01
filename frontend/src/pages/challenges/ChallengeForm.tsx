import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { challengesApi } from '../../api/challenges.api';
import { ArrowLeft, Code, Clock, Cpu, Tag, Plus, X, Eye, EyeOff, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const ChallengeForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    timeLimit: 1000,
    memoryLimit: 256,
    tags: [] as string[],
  });
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentTestCase, setCurrentTestCase] = useState({
    input: '',
    expectedOutput: '',
    isHidden: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeLimit' || name === 'memoryLimit' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddTestCase = () => {
    if (currentTestCase.input.trim() && currentTestCase.expectedOutput.trim()) {
      setTestCases(prev => [...prev, { ...currentTestCase }]);
      setCurrentTestCase({
        input: '',
        expectedOutput: '',
        isHidden: false,
      });
    }
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.timeLimit <= 0) {
      newErrors.timeLimit = 'El tiempo límite debe ser mayor a 0';
    }

    if (formData.memoryLimit <= 0) {
      newErrors.memoryLimit = 'La memoria límite debe ser mayor a 0';
    }

    if (testCases.length === 0) {
      newErrors.testCases = 'Se requiere al menos un caso de prueba';
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
      const challengeData = {
        ...formData,
        testCases: testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        })),
      };

      await challengesApi.createChallenge(challengeData);
      toast.success('¡Reto creado exitosamente!');
      navigate('/challenges');
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      const message = error.response?.data?.message || 'Error al crear el reto';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'HARD':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/challenges')}
            className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Retos
          </button>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mr-4">
              <Code className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Crear Nuevo Reto</h1>
              <p className="text-slate-400">Añade un nuevo reto de programación</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-cyan-400" />
              Información Básica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Título del Reto
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 border ${errors.title ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500`}
                  placeholder="ej: Suma de Dos Números"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nivel de Dificultad
                </label>
                <div className="flex gap-2">
                  {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: diff as any }))}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.difficulty === diff
                          ? getDifficultyStyle(diff)
                          : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {diff === 'EASY' ? 'Fácil' : diff === 'MEDIUM' ? 'Medio' : 'Difícil'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleChange}
                className={`w-full bg-slate-700/50 border ${errors.description ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 resize-none`}
                placeholder="Describe el problema, restricciones y ejemplos..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1 text-cyan-400" />
                  Tiempo Límite (ms)
                </label>
                <input
                  name="timeLimit"
                  type="number"
                  required
                  min="1"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 border ${errors.timeLimit ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                />
                {errors.timeLimit && (
                  <p className="mt-1 text-sm text-red-400">{errors.timeLimit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Cpu className="w-4 h-4 inline mr-1 text-purple-400" />
                  Memoria Límite (MB)
                </label>
                <input
                  name="memoryLimit"
                  type="number"
                  required
                  min="1"
                  value={formData.memoryLimit}
                  onChange={handleChange}
                  className={`w-full bg-slate-700/50 border ${errors.memoryLimit ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                />
                {errors.memoryLimit && (
                  <p className="mt-1 text-sm text-red-400">{errors.memoryLimit}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1 text-amber-400" />
                Etiquetas
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Añadir etiqueta..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
                />
                <Button type="button" onClick={handleAddTag} variant="secondary" className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-cyan-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Code className="w-5 h-5 mr-2 text-green-400" />
                Casos de Prueba
              </h2>
              <p className="text-sm text-slate-400 mt-1">Añade ejemplos de entrada/salida para tu reto</p>
            </div>

            {/* Add Test Case Form */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Entrada
                  </label>
                  <textarea
                    value={currentTestCase.input}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, input: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 text-cyan-400 font-mono rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 resize-none"
                    rows={3}
                    placeholder="Ingresa la entrada de prueba..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Salida Esperada
                  </label>
                  <textarea
                    value={currentTestCase.expectedOutput}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, expectedOutput: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 text-green-400 font-mono rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-500 resize-none"
                    rows={3}
                    placeholder="Ingresa la salida esperada..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentTestCase.isHidden}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, isHidden: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${currentTestCase.isHidden ? 'bg-amber-500' : 'bg-slate-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform mt-1 ${currentTestCase.isHidden ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="ml-3 text-sm text-slate-300 flex items-center">
                    {currentTestCase.isHidden ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {currentTestCase.isHidden ? 'Caso oculto' : 'Caso visible'}
                  </span>
                </label>
                <Button
                  type="button"
                  onClick={handleAddTestCase}
                  disabled={!currentTestCase.input.trim() || !currentTestCase.expectedOutput.trim()}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Caso
                </Button>
              </div>
            </div>

            {/* Test Cases List */}
            {testCases.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-300">Casos Añadidos ({testCases.length})</h4>
                {testCases.map((testCase, index) => (
                  <div key={index} className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          Caso {index + 1}
                        </span>
                        {testCase.isHidden ? (
                          <span className="flex items-center px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Oculto
                          </span>
                        ) : (
                          <span className="flex items-center px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                            <Eye className="w-3 h-3 mr-1" />
                            Visible
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        variant="danger"
                        size="sm"
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Entrada</span>
                        <pre className="mt-1 bg-slate-800/50 p-3 rounded-lg text-sm text-cyan-400 font-mono whitespace-pre-wrap">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Salida</span>
                        <pre className="mt-1 bg-slate-800/50 p-3 rounded-lg text-sm text-green-400 font-mono whitespace-pre-wrap">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.testCases && (
              <p className="mt-4 text-sm text-red-400 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.testCases}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/challenges')}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              Crear Reto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;
