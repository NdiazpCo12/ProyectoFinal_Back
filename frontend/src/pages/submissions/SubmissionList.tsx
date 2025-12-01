import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submissionsApi } from '../../api/submissions.api';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle, XCircle, AlertTriangle, Code, ArrowLeft, FileCode, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  challengeId: string;
  language: string;
  status: string;
  result?: {
    score: number;
    timeMsTotal: number;
  };
  createdAt: string;
  challenge: {
    id: string;
    title: string;
    difficulty: string;
  };
}

const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionsApi.getUserSubmissions();
      setSubmissions(data as unknown as Submission[]);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Error al cargar los envíos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'WRONG_ANSWER':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'TIME_LIMIT_EXCEEDED':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'RUNTIME_ERROR':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'COMPILATION_ERROR':
        return <Code className="w-5 h-5 text-purple-400" />;
      case 'QUEUED':
      case 'PROCESSING':
        return <Loader className="w-5 h-5 text-cyan-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-500/20 text-green-400';
      case 'WRONG_ANSWER':
        return 'bg-red-500/20 text-red-400';
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'RUNTIME_ERROR':
        return 'bg-orange-500/20 text-orange-400';
      case 'COMPILATION_ERROR':
        return 'bg-purple-500/20 text-purple-400';
      case 'QUEUED':
      case 'PROCESSING':
        return 'bg-cyan-500/20 text-cyan-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getLanguageStyle = (language: string) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'java':
        return 'bg-orange-500/20 text-orange-400';
      case 'javascript':
      case 'node':
        return 'bg-amber-500/20 text-amber-400';
      case 'cpp':
      case 'c++':
        return 'bg-blue-500/20 text-blue-400';
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

          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FileCode className="w-8 h-8 mr-3 text-amber-400" />
              Mis Envíos
            </h1>
            <p className="mt-2 text-slate-400">
              Historial de todas tus soluciones enviadas
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
            <FileCode className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay envíos todavía</h3>
            <p className="text-slate-400 mb-6">
              Comienza a resolver retos para ver tus envíos aquí.
            </p>
            <Link to="/challenges">
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Code className="w-4 h-4 mr-2" />
                Explorar Retos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Reto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Lenguaje
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Puntaje
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tiempo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">
                          {submission.challenge?.title || 'Sin título'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getLanguageStyle(submission.language)}`}>
                          {submission.language}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusStyle(submission.status)}`}>
                            {submission.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">{submission.result?.score ?? '-'}</span>
                        <span className="text-slate-500">/100</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {submission.result?.timeMsTotal ? `${submission.result.timeMsTotal}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/submissions/${submission.id}`}>
                          <Button size="sm" variant="secondary" className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white">
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
