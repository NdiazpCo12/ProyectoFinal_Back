import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { challengesApi } from '../../api/challenges.api';
import { Challenge, ChallengeFilters } from '../../types/challenge.types';
import { Button } from '../../components/ui/Button';
import { Clock, Database, Tag, Plus, Search, Code, ArrowLeft, Zap } from 'lucide-react';

const ChallengeList: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ChallengeFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading) {
      loadChallenges();
    }
  }, [filters, isAuthLoading]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      let data: Challenge[];

      if (user?.role === 'ADMIN') {
        data = await challengesApi.getChallenges({
          status: filters.status,
          difficulty: filters.difficulty,
        });
      } else {
        data = await challengesApi.getPublishedChallenges({
          difficulty: filters.difficulty,
        });
      }

      // Aplicar filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        data = data.filter(challenge =>
          challenge.title.toLowerCase().includes(searchTerm) ||
          challenge.description.toLowerCase().includes(searchTerm) ||
          challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ChallengeFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const formatTimeLimit = (ms: number) => {
    const seconds = ms / 1000;
    return seconds >= 1 ? `${seconds}s` : `${ms}ms`;
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'DRAFT':
        return 'bg-slate-500/20 text-slate-400';
      case 'ARCHIVED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Code className="w-8 h-8 mr-3 text-cyan-400" />
                Retos de Programación
              </h1>
              <p className="mt-2 text-slate-400">
                {user?.role === 'ADMIN'
                  ? 'Gestiona y crea retos de programación'
                  : 'Explora y resuelve retos de programación'
                }
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <Link to="/challenges/new">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Reto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar retos..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
              />
            </div>

            {user?.role === 'ADMIN' && (
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            )}

            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Todas las dificultades</option>
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Medio</option>
              <option value="HARD">Difícil</option>
            </select>

            <Button
              variant="secondary"
              onClick={() => setFilters({})}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-slate-300"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Challenges Grid */}
        {challenges.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
            <Zap className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No se encontraron retos</h3>
            <p className="text-slate-400">
              {filters.search || filters.status || filters.difficulty
                ? 'Intenta ajustar los filtros'
                : 'No hay retos disponibles en este momento'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 mr-2">
                    {challenge.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyStyle(challenge.difficulty)}`}>
                    {challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Medio' : 'Difícil'}
                  </span>
                </div>

                {user?.role === 'ADMIN' && (
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mb-3 ${getStatusStyle(challenge.status)}`}>
                    {challenge.status === 'PUBLISHED' ? 'Publicado' : challenge.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                  </span>
                )}

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {challenge.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                  {challenge.tags.length > 3 && (
                    <span className="text-xs text-slate-500 self-center">
                      +{challenge.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4 py-3 border-t border-slate-700">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-cyan-400" />
                    <span>{formatTimeLimit(challenge.timeLimit)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database size={14} className="text-purple-400" />
                    <span>{challenge.memoryLimit}MB</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/challenges/${challenge.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white">
                      Ver Detalles
                    </Button>
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to={`/challenges/${challenge.id}/edit`}>
                      <Button variant="secondary" size="sm" className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white">
                        Editar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeList;
