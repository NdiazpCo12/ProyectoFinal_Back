import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Code, BookOpen, FileCode, LogOut, User, Shield, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      to: '/challenges',
      icon: Code,
      title: 'Retos',
      description: 'Explora y resuelve retos de programación',
      color: 'cyan',
    },
    {
      to: '/courses',
      icon: BookOpen,
      title: 'Cursos',
      description: 'Gestiona tus cursos y asignaturas',
      color: 'purple',
    },
    {
      to: '/submissions',
      icon: FileCode,
      title: 'Envíos',
      description: 'Revisa el historial de tus soluciones',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Online Judge</span>
            </div>
            <Button 
              variant="secondary" 
              onClick={logout}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-slate-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-6">
            <User className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-xl text-slate-400 mb-2">{user?.email}</p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-700/50 border border-slate-600">
            <Shield className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300 capitalize">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Estudiante'}
            </span>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.to} 
              to={item.to}
              className="group"
            >
              <div className={`
                bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6
                hover:border-${item.color}-500/50 hover:bg-slate-800/80
                transition-all duration-300 h-full
              `}>
                <div className={`
                  w-14 h-14 rounded-xl mb-4 flex items-center justify-center
                  ${item.color === 'cyan' ? 'bg-cyan-500/20' : ''}
                  ${item.color === 'purple' ? 'bg-purple-500/20' : ''}
                  ${item.color === 'amber' ? 'bg-amber-500/20' : ''}
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <item.icon className={`
                    w-7 h-7
                    ${item.color === 'cyan' ? 'text-cyan-400' : ''}
                    ${item.color === 'purple' ? 'text-purple-400' : ''}
                    ${item.color === 'amber' ? 'text-amber-400' : ''}
                  `} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Generator Section (for admins) */}
        {user?.role === 'ADMIN' && (
          <div className="mt-12">
            <div className="max-w-4xl mx-auto">
              <Link to="/ai/generate" className="block group">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Generador de Retos con IA
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Usa inteligencia artificial para crear retos de programación automáticamente
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium border border-purple-500/30">
                        Nuevo
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
