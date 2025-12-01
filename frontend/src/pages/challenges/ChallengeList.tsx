import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { challengesApi } from '../../api/challenges.api';
import { Challenge, ChallengeFilters } from '../../types/challenge.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DifficultyBadge } from '../../components/shared/DifficultyBadge';
import { Clock, Database, Tag, Plus, Search } from 'lucide-react';

const ChallengeList: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ChallengeFilters>({});

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
        // Admin can see all challenges
        data = await challengesApi.getChallenges({
          status: filters.status,
          difficulty: filters.difficulty,
        });
      } else {
        // Students can only see published challenges
        data = await challengesApi.getPublishedChallenges();
      }

      // Apply search filter
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
    return seconds >= 1000 ? `${(seconds / 1000).toFixed(1)}s` : `${seconds}ms`;
  };

  const formatMemoryLimit = (mb: number) => `${mb}MB`;

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
            <h1 className="text-3xl font-bold text-gray-900">Programming Challenges</h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'ADMIN'
                ? 'Manage and create programming challenges'
                : 'Browse and solve programming challenges'
              }
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link to="/challenges/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Create Challenge
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search challenges..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {user?.role === 'ADMIN' && (
              <>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="input"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </>
            )}

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.difficulty
                ? 'Try adjusting your filters'
                : 'No challenges are available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {challenge.title}
                  </h3>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {challenge.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                  {challenge.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{challenge.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTimeLimit(challenge.timeLimit)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database size={14} />
                    <span>{formatMemoryLimit(challenge.memoryLimit)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/challenges/${challenge.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to={`/challenges/${challenge.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
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