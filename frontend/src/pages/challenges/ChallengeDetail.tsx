import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { challengesApi } from '../../api/challenges.api';
import { Challenge } from '../../types/challenge.types';
import { Code, Play, Clock, Cpu, ArrowLeft, Tag, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadChallenge();
    }
  }, [id]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const challengeData = await challengesApi.getChallengeById(id!);
      setChallenge(challengeData);
    } catch (error: any) {
      console.error('Error loading challenge:', error);
      toast.error('Error al cargar el reto');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = () => {
    navigate(`/challenges/${id}/submit`);
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'HARD':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Reto no encontrado</p>
          <Button onClick={() => navigate('/challenges')} className="bg-cyan-500 hover:bg-cyan-600">
            Volver a Retos
          </Button>
        </div>
      </div>
    );
  }

  const visibleTestCases = challenge.testCases?.filter(tc => !tc.isHidden) || [];

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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mr-4">
                <Code className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyStyle(challenge.difficulty)}`}>
                    {challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Medio' : 'Difícil'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmitSolution}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Play size={16} className="mr-2" />
              Enviar Solución
            </Button>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
              Descripción
            </h2>
            <div className="text-slate-300 prose prose-invert max-w-none">
              {challenge.description.split('\n').map((line, index) => (
                <p key={index} className="mb-3">{line}</p>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Restricciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mr-4">
                  <Clock size={20} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Tiempo Límite</p>
                  <p className="text-white font-semibold">{challenge.timeLimit}ms</p>
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 flex items-center">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mr-4">
                  <Cpu size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Memoria Límite</p>
                  <p className="text-white font-semibold">{challenge.memoryLimit}MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-amber-400" />
                Etiquetas
              </h2>
              <div className="flex flex-wrap gap-2">
                {challenge.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg border border-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sample Test Cases */}
          {visibleTestCases.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Casos de Prueba de Ejemplo</h2>
              <div className="space-y-4">
                {visibleTestCases.slice(0, 2).map((testCase, index) => (
                  <div key={testCase.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <h4 className="font-medium text-slate-300 mb-2 text-sm uppercase tracking-wide">
                        Entrada {index + 1}
                      </h4>
                      <pre className="bg-slate-900/50 p-3 rounded-lg text-sm text-cyan-400 font-mono whitespace-pre-wrap overflow-x-auto">
                        {testCase.input}
                      </pre>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <h4 className="font-medium text-slate-300 mb-2 text-sm uppercase tracking-wide">
                        Salida Esperada {index + 1}
                      </h4>
                      <pre className="bg-slate-900/50 p-3 rounded-lg text-sm text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmitSolution}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 px-8"
            >
              <Play size={20} className="mr-2" />
              Enviar Solución
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
