import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../../api/submissions.api';
import { Submission, TestCaseResult } from '../../types/submission.types';
import { Button } from '../../components/ui/Button';
import CodeEditor from '../../components/shared/CodeEditor';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Code } from 'lucide-react';
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WRONG_ANSWER':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'TIME_LIMIT_EXCEEDED':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'RUNTIME_ERROR':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'COMPILATION_ERROR':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'RUNNING':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'QUEUED':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-700 bg-green-100';
      case 'WRONG_ANSWER':
        return 'text-red-700 bg-red-100';
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-yellow-700 bg-yellow-100';
      case 'RUNTIME_ERROR':
        return 'text-red-700 bg-red-100';
      case 'COMPILATION_ERROR':
        return 'text-red-700 bg-red-100';
      case 'RUNNING':
        return 'text-blue-700 bg-blue-100';
      case 'QUEUED':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Submission not found</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-gray-600">ID: {submission.id}</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(submission.status)}
              <span className="font-medium text-gray-900">Status</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(submission.status)}`}>
              {submission.status.replace('_', ' ')}
            </span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code size={16} className="text-gray-500" />
              <span className="font-medium text-gray-900">Language</span>
            </div>
            <span className="text-gray-700 capitalize">{submission.language}</span>
          </div>

          {submission.result && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="font-medium text-gray-900">Score</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{submission.result.score}%</span>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-medium text-gray-900">Time</span>
                </div>
                <span className="text-gray-700">{submission.result.timeMsTotal}ms</span>
              </div>
            </>
          )}
        </div>

        {/* Test Cases Results */}
        {submission.result && submission.result.cases.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h2>
            <div className="space-y-3">
              {submission.result.cases.map((testCase: TestCaseResult) => (
                <div key={testCase.caseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testCase.status)}
                    <span className="font-medium">Test Case {testCase.caseId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(testCase.status)}`}>
                      {testCase.status}
                    </span>
                    <span className="text-sm text-gray-600">{testCase.timeMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Code</h2>
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
  );
};

export default SubmissionDetail;