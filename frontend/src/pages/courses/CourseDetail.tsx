import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../api/courses.api';
import { challengesApi } from '../../api/challenges.api';
import { Course, CourseEnrollment, CourseProfessor, CourseChallenge } from '../../types/course.types';
import { Challenge } from '../../types/challenge.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users, UserPlus, BookOpen, Plus, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [enrollEmail, setEnrollEmail] = useState('');
  const [professorEmail, setProfessorEmail] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  useEffect(() => {
    if (id) {
      loadCourseData();
      loadAvailableChallenges();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      // Note: The backend doesn't return full course details with relations yet
      // For now, we'll get basic course info and challenges separately
      const courses = await coursesApi.getCourses();
      const foundCourse = courses.find(c => c.id === id);

      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        toast.error('Course not found');
        navigate('/courses');
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableChallenges = async () => {
    try {
      const challenges = await challengesApi.getPublishedChallenges();
      setAvailableChallenges(challenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const handleEnrollStudent = async () => {
    if (!enrollEmail.trim() || !id) return;

    try {
      await coursesApi.enrollStudent(id, { userId: enrollEmail });
      toast.success('Student enrolled successfully!');
      setEnrollEmail('');
      loadCourseData(); // Refresh data
    } catch (error: any) {
      console.error('Error enrolling student:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleAssignProfessor = async () => {
    if (!professorEmail.trim() || !id) return;

    try {
      await coursesApi.assignProfessor(id, { userId: professorEmail });
      toast.success('Professor assigned successfully!');
      setProfessorEmail('');
      loadCourseData(); // Refresh data
    } catch (error: any) {
      console.error('Error assigning professor:', error);
      toast.error(error.response?.data?.message || 'Failed to assign professor');
    }
  };

  const handleAssignChallenge = async () => {
    if (!selectedChallengeId || !id) return;

    try {
      await coursesApi.assignChallenge(id, { challengeId: selectedChallengeId });
      toast.success('Challenge assigned successfully!');
      setSelectedChallengeId('');
      loadCourseData(); // Refresh data
    } catch (error: any) {
      console.error('Error assigning challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to assign challenge');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
        <Button onClick={() => navigate('/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Course Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="mt-2 text-gray-600">
                NRC: {course.nrc} | {course.period} - Group {course.group}
              </p>
            </div>
            {isAdmin && (
              <Button variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Manage Course
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Challenges */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Course Challenges</h2>
                {isAdmin && (
                  <div className="flex gap-2">
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      className="input text-sm"
                    >
                      <option value="">Select challenge...</option>
                      {availableChallenges.map((challenge) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title} ({challenge.difficulty})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={handleAssignChallenge}
                      disabled={!selectedChallengeId}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {course.courseChallenges && course.courseChallenges.length > 0 ? (
                <div className="space-y-3">
                  {course.courseChallenges.map((courseChallenge) => (
                    <div key={courseChallenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{courseChallenge.challenge.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{courseChallenge.challenge.difficulty.toLowerCase()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          courseChallenge.challenge.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {courseChallenge.challenge.status}
                        </span>
                        {isAdmin && (
                          <Button size="sm" variant="danger">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No challenges assigned to this course yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrolled Students */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Students ({course.enrollments?.length || 0})
                </h2>
              </div>

              {isAdmin && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Student email..."
                      value={enrollEmail}
                      onChange={(e) => setEnrollEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleEnrollStudent}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {course.enrollments && course.enrollments.length > 0 ? (
                <div className="space-y-2">
                  {course.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-900">{enrollment.user.email}</span>
                      {isAdmin && (
                        <Button size="sm" variant="danger">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No students enrolled yet.
                </p>
              )}
            </div>

            {/* Course Professors */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Professors</h2>
              </div>

              {isAdmin && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Professor email..."
                      value={professorEmail}
                      onChange={(e) => setProfessorEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAssignProfessor}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {course.professors && course.professors.length > 0 ? (
                <div className="space-y-2">
                  {course.professors.map((professor) => (
                    <div key={professor.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-900">{professor.user.email}</span>
                      {isAdmin && (
                        <Button size="sm" variant="danger">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No professors assigned yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;