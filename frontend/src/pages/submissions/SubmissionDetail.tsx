import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../../api/submissions.api';
import { Submission, TestCaseResult } from '../../types/submission.types';
import { Button } from '../../components/ui/Button';
import CodeEditor from '../../components/shared/CodeEditor';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Code, Trophy, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);

  useEffect(() => {
    // Poll for updates if submission is still running
    if (submission && (submission.status === 'QUEUED' || submission.status === 'RUNNING')) {
      const interval = setInterval(() => {
        if (!polling) {
          pollSubmission();
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [submission, polling]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const data = await submissionsApi.getSubmission(id!);
      setSubmission(data);
    } catch (error) {
      console.error('Error loading submission:', error);
      toast.error('Failed to load submission');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const pollSubmission = async () => {
    try {
      setPolling(true);
      const data = await submissionsApi.getSubmission(id!);
      setSubmission(data);

      // Stop polling if submission is complete
      if (data.status !== 'QUEUED' && data.status !== 'RUNNING') {
        toast.success('Submission completed!');
      }
    } catch (error) {
      console.error('Error polling submission:', error);
    } finally {
      setPolling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'WRONG_ANSWER':
        return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'TIME_LIMIT_EXCEEDED':
        return <Clock className="h-5 w-5 text-amber-400" />;
      case 'RUNTIME_ERROR':
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case 'COMPILATION_ERROR':
        return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'RUNNING':
        return <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>;
      case 'QUEUED':
        return <Clock className="h-5 w-5 text-slate-400" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'WRONG_ANSWER':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'RUNTIME_ERROR':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
      case 'COMPILATION_ERROR':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
      case 'RUNNING':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'QUEUED':
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusBgStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'WRONG_ANSWER':
      case 'RUNTIME_ERROR':
      case 'COMPILATION_ERROR':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'RUNNING':
        return 'bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Submission not found</p>
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
              <h1 className="text-2xl font-bold text-white">Submission Details</h1>
              <p className="text-slate-400 text-sm font-mono">ID: {submission.id}</p>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Status Card */}
          <div className={`rounded-xl border p-5 ${getStatusBgStyle(submission.status)}`}>
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(submission.status)}
              <span className="font-medium text-slate-300">Status</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusStyle(submission.status)}`}>
              {submission.status.replace('_', ' ')}
            </span>
          </div>

          {/* Language Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Code size={20} className="text-purple-400" />
              <span className="font-medium text-slate-300">Language</span>
            </div>
            <span className="text-white font-semibold capitalize">{submission.language}</span>
          </div>

          {/* Score Card */}
          {submission.result && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Trophy size={20} className="text-amber-400" />
                <span className="font-medium text-slate-300">Score</span>
              </div>
              <span className={`text-3xl font-bold ${
                submission.result.score === 100 
                  ? 'text-emerald-400' 
                  : submission.result.score > 0 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
              }`}>
                {submission.result.score}%
              </span>
            </div>
          )}

          {/* Time Card */}
          {submission.result && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Timer size={20} className="text-cyan-400" />
                <span className="font-medium text-slate-300">Total Time</span>
              </div>
              <span className="text-white font-semibold">{submission.result.timeMsTotal}ms</span>
            </div>
          )}
        </div>

        {/* Test Cases Results */}
        {submission.result && submission.result.cases.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-cyan-400" />
              Test Cases
            </h2>
            <div className="space-y-3">
              {submission.result.cases.map((testCase: TestCaseResult, index: number) => (
                <div 
                  key={testCase.caseId} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    testCase.status === 'OK' 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {testCase.status === 'OK' ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : (
                      <XCircle size={20} className="text-rose-400" />
                    )}
                    <span className="font-medium text-white">Test Case {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      testCase.status === 'OK'
                        ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
                        : 'text-rose-400 bg-rose-500/20 border-rose-500/30'
                    }`}>
                      {testCase.status}
                    </span>
                    <span className="text-sm text-slate-400 font-mono">{testCase.timeMs}ms</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Error Message if any */}
            {submission.result.cases.some((tc: TestCaseResult) => tc.error) && (
              <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <h3 className="text-sm font-semibold text-rose-400 mb-2">Error Details</h3>
                {submission.result.cases
                  .filter((tc: TestCaseResult) => tc.error)
                  .map((tc: TestCaseResult, idx: number) => (
                    <pre key={idx} className="text-sm text-rose-300 font-mono whitespace-pre-wrap">
                      {tc.error}
                    </pre>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Code Display */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code size={20} className="text-cyan-400" />
            Submitted Code
          </h2>
          <div className="rounded-lg overflow-hidden border border-slate-600">
            <CodeEditor
              value={submission.code}
              onChange={() => {}} // Read-only
              language={submission.language}
              height="400px"
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
