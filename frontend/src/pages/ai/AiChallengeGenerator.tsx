import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi, GenerateChallengeResponse } from '../../api/ai.api';
import { challengesApi } from '../../api/challenges.api';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Sparkles, 
  Wand2, 
  Check, 
  Copy, 
  Save,
  Loader,
  Code,
  Tag,
  Clock,
  HardDrive,
  FileText,
  Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';

const AiChallengeGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<GenerateChallengeResponse | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Por favor ingresa un tema para generar el reto');
      return;
    }

    try {
      setLoading(true);
      setGeneratedChallenge(null);
      const result = await aiApi.generateChallenge({ theme: theme.trim() });
      setGeneratedChallenge(result);
      toast.success('¡Reto generado exitosamente!');
    } catch (error: any) {
      console.error('Error generating challenge:', error);
      const message = error.response?.data?.message || 'Error al generar el reto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChallenge = async () => {
    if (!generatedChallenge) return;

    try {
      setSaving(true);
      
      // Preparar los test cases en el formato que espera el backend
      const testCases = generatedChallenge.samples.map((sample, index) => ({
        input: sample.input,
        expectedOutput: sample.expectedOutput,
        isHidden: index > 0, // El primer caso es visible, los demás ocultos
      }));

      await challengesApi.createChallenge({
        title: generatedChallenge.title,
        description: generatedChallenge.description,
        difficulty: generatedChallenge.difficulty,
        tags: generatedChallenge.tags,
        timeLimit: generatedChallenge.suggestedTimeLimit || 2000,
        memoryLimit: generatedChallenge.suggestedMemoryLimit || 256,
        testCases,
      });

      toast.success('¡Reto guardado exitosamente!');
      navigate('/challenges');
    } catch (error: any) {
      console.error('Error saving challenge:', error);
      const message = error.response?.data?.message || 'Error al guardar el reto';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'HARD':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const suggestedThemes = [
    'Algoritmos de ordenamiento',
    'Estructuras de datos',
    'Programación dinámica',
    'Grafos y árboles',
    'Búsqueda binaria',
    'Manipulación de strings',
    'Matemáticas y números primos',
    'Recursividad',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Generador de Retos con IA</h1>
                <p className="text-slate-400 text-sm">Powered by Google Gemini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">¿Sobre qué tema quieres generar un reto?</h2>
          </div>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ej: Algoritmos de búsqueda, Recursividad, Grafos..."
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !theme.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generar Reto</span>
                </>
              )}
            </button>
          </div>

          {/* Suggested Themes */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500">Sugerencias:</span>
            {suggestedThemes.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTheme(suggestion)}
                className="px-3 py-1 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-full border border-slate-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">La IA está pensando...</h3>
            <p className="text-slate-400">Generando un reto sobre "{theme}"</p>
          </div>
        )}

        {/* Generated Challenge */}
        {generatedChallenge && !loading && (
          <div className="space-y-6">
            {/* Title and Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{generatedChallenge.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyStyle(generatedChallenge.difficulty)}`}>
                      {generatedChallenge.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {generatedChallenge.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-sm"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(generatedChallenge, null, 2))}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Copiar JSON"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={16} className="text-cyan-400" />
                  <span>{generatedChallenge.suggestedTimeLimit || 2000}ms</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <HardDrive size={16} className="text-purple-400" />
                  <span>{generatedChallenge.suggestedMemoryLimit || 256}MB</span>
                </div>
              </div>

              <button
                onClick={handleSaveChallenge}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Reto</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Descripción</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed bg-slate-900/50 p-4 rounded-lg">
                  {generatedChallenge.description}
                </pre>
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Casos de Prueba</h3>
              </div>
              <div className="space-y-4">
                {generatedChallenge.samples.map((sample, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-400">Caso #{index + 1}</span>
                      <button
                        onClick={() => copyToClipboard(`Input:\n${sample.input}\n\nOutput:\n${sample.expectedOutput}`)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Input</span>
                        <pre className="mt-1 p-3 bg-slate-800 rounded text-sm text-emerald-400 font-mono overflow-x-auto">
                          {sample.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Expected Output</span>
                        <pre className="mt-1 p-3 bg-slate-800 rounded text-sm text-cyan-400 font-mono overflow-x-auto">
                          {sample.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChallengeGenerator;

