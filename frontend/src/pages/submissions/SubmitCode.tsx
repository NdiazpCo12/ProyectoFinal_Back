import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { challengesApi } from '../../api/challenges.api';
import { submissionsApi } from '../../api/submissions.api';
import { Challenge } from '../../types/challenge.types';
import { CreateSubmissionRequest } from '../../types/submission.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import CodeEditor from '../../components/shared/CodeEditor';
import { ArrowLeft, Play, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitCode: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'python' | 'java' | 'cpp' | 'node'>('python');
  const [loading, setLoading] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(true);

  useEffect(() => {
    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      setChallengeLoading(true);
      const challengeData = await challengesApi.getChallengeById(challengeId!);
      setChallenge(challengeData);
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast.error('Failed to load challenge');
      navigate('/challenges');
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge || !code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    try {
      setLoading(true);
      const submissionData: CreateSubmissionRequest = {
        challengeId: challenge.id,
        language,
        code: code.trim(),
      };

      const submission = await submissionsApi.createSubmission(submissionData);
      toast.success('Code submitted successfully!');

      // Navigate to submission detail page
      navigate(`/submissions/${submission.id}`);
    } catch (error: any) {
      console.error('Error submitting code:', error);
      const message = error.response?.data?.message || 'Failed to submit code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (challengeLoading) {
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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/challenges')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
              <p className="text-gray-600">Submit your solution</p>
            </div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Code size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Difficulty:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {challenge.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time Limit:</span>
              <span className="font-medium">{challenge.timeLimit}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Memory Limit:</span>
              <span className="font-medium">{challenge.memoryLimit}MB</span>
            </div>
          </div>
        </div>

        {/* Code Submission Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="input max-w-xs"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="node">Node.js</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Code
            </label>
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={language}
              height="500px"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              className="flex items-center gap-2"
            >
              <Play size={16} />
              Submit Solution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitCode;