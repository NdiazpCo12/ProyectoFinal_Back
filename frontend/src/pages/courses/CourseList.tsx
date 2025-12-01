import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../api/courses.api';
import { Course } from '../../types/course.types';
import { Button } from '../../components/ui/Button';
import { Plus, Users, BookOpen, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'ADMIN'
                ? 'Manage all courses in the system'
                : 'Your enrolled courses'
              }
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link to="/courses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'ADMIN'
                ? 'Get started by creating a new course.'
                : 'You are not enrolled in any courses yet.'
              }
            </p>
            {user?.role === 'ADMIN' && (
              <div className="mt-6">
                <Link to="/courses/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      NRC: {course.nrc}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      {course.period} - Group {course.group}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.enrollments?.length || 0} students
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.courseChallenges?.length || 0} challenges
                  </div>
                </div>

                <Link to={`/courses/${course.id}`}>
                  <Button variant="secondary" className="w-full">
                    View Course
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