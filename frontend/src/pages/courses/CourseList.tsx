import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../api/courses.api';
import { Course } from '../../types/course.types';
import { Button } from '../../components/ui/Button';
import { Plus, Users, BookOpen, Calendar, ArrowLeft, GraduationCap, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getCourses();
      setCourses(data);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
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
                <BookOpen className="w-8 h-8 mr-3 text-purple-400" />
                Cursos
              </h1>
              <p className="mt-2 text-slate-400">
                {user?.role === 'ADMIN'
                  ? 'Gestiona todos los cursos del sistema'
                  : 'Tus cursos inscritos'
                }
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <Link to="/courses/new">
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Curso
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay cursos</h3>
            <p className="text-slate-400 mb-6">
              {user?.role === 'ADMIN'
                ? 'Comienza creando un nuevo curso.'
                : 'No estás inscrito en ningún curso todavía.'
              }
            </p>
            {user?.role === 'ADMIN' && (
              <Link to="/courses/new">
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Curso
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {course.name}
                    </h3>
                    <span className="inline-block bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                      NRC: {course.nrc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-slate-400 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {course.period} - Grupo {course.group}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                    <p className="text-lg font-bold text-white">{course.studentCount || 0}</p>
                    <p className="text-xs text-slate-500">Estudiantes</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <GraduationCap className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <p className="text-lg font-bold text-white">{course.professorCount || 0}</p>
                    <p className="text-xs text-slate-500">Profesores</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <Code className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <p className="text-lg font-bold text-white">{course.challengeCount || 0}</p>
                    <p className="text-xs text-slate-500">Retos</p>
                  </div>
                </div>

                <Link to={`/courses/${course.id}`}>
                  <Button variant="secondary" className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-600 text-white">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
