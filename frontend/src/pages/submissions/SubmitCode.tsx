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
import { ArrowLeft, Play, Code, Zap, HardDrive } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Challenge not found</p>
          <Button onClick={() => navigate('/challenges')}>
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/challenges')}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
              <p className="text-slate-400">Submit your solution</p>
            </div>
          </div>
        </div>

        {/* Challenge Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Code size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Difficulty</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  challenge.difficulty === 'EASY' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : challenge.difficulty === 'MEDIUM' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Zap size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Time Limit</p>
                <p className="text-white font-semibold">{challenge.timeLimit}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <HardDrive size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Memory Limit</p>
                <p className="text-white font-semibold">{challenge.memoryLimit}MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Submission Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">
              Programming Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="w-full max-w-xs px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="node">Node.js</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Code
            </label>
            <div className="rounded-lg overflow-hidden border border-slate-600">
              <CodeEditor
                value={code}
                onChange={(value) => setCode(value || '')}
                language={language}
                height="500px"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Submit Solution</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitCode;
