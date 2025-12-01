import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { challengesApi } from '../../api/challenges.api';
import { Challenge } from '../../types/challenge.types';
import { Code, Play, Clock, Cpu } from 'lucide-react';
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
      toast.error('Failed to load challenge');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = () => {
    navigate(`/challenges/${id}/submit`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Challenge not found</p>
        <Button onClick={() => navigate('/challenges')} className="mt-4">
          Back to Challenges
        </Button>
      </div>
    );
  }

  // Filter out hidden test cases for students
  const visibleTestCases = challenge.testCases?.filter(tc => !tc.isHidden) || [];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
            <p className="text-gray-600 mt-1">Challenge Details</p>
          </div>
          <Button
            onClick={handleSubmitSolution}
            className="flex items-center gap-2"
          >
            <Play size={16} />
            Submit Solution
          </Button>
        </div>

        {/* Challenge Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <div className="text-gray-700 prose max-w-none">
              {challenge.description.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Code size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Time Limit:</span>
              <span className="text-gray-900">{challenge.timeLimit}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Memory Limit:</span>
              <span className="text-gray-900">{challenge.memoryLimit}MB</span>
            </div>
          </div>

          {challenge.tags && challenge.tags.length > 0 && (
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {challenge.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {visibleTestCases.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Test Cases</h3>
              <div className="space-y-4">
                {visibleTestCases.slice(0, 2).map((testCase, index) => (
                  <div key={testCase.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Sample Input {index + 1}:</h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm text-gray-800 whitespace-pre-wrap">
                        {testCase.input}
                      </pre>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Sample Output {index + 1}:</h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm text-gray-800 whitespace-pre-wrap">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
