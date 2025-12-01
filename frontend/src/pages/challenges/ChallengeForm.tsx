import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { challengesApi } from '../../api/challenges.api';
import toast from 'react-hot-toast';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

const ChallengeForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
    timeLimit: 1000,
    memoryLimit: 256,
    tags: [] as string[],
  });
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentTestCase, setCurrentTestCase] = useState({
    input: '',
    expectedOutput: '',
    isHidden: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeLimit' || name === 'memoryLimit' ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddTestCase = () => {
    if (currentTestCase.input.trim() && currentTestCase.expectedOutput.trim()) {
      setTestCases(prev => [...prev, { ...currentTestCase }]);
      setCurrentTestCase({
        input: '',
        expectedOutput: '',
        isHidden: false,
      });
    }
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.timeLimit <= 0) {
      newErrors.timeLimit = 'Time limit must be greater than 0';
    }

    if (formData.memoryLimit <= 0) {
      newErrors.memoryLimit = 'Memory limit must be greater than 0';
    }

    if (testCases.length === 0) {
      newErrors.testCases = 'At least one test case is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const challengeData = {
        ...formData,
        testCases: testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        })),
      };

      await challengesApi.createChallenge(challengeData);
      toast.success('Challenge created successfully!');
      navigate('/challenges');
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      const message = error.response?.data?.message || 'Failed to create challenge';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Challenge</h1>
          <p className="mt-2 text-gray-600">Add a new programming challenge for students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Challenge Title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="e.g., Two Sum Problem"
              />

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleChange}
                className={`input ${errors.description ? 'border-danger-500' : ''}`}
                placeholder="Describe the problem, constraints, and examples..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Time Limit (ms)"
                name="timeLimit"
                type="number"
                required
                min="1"
                value={formData.timeLimit}
                onChange={handleChange}
                error={errors.timeLimit}
              />

              <Input
                label="Memory Limit (MB)"
                name="memoryLimit"
                type="number"
                required
                min="1"
                value={formData.memoryLimit}
                onChange={handleChange}
                error={errors.memoryLimit}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
              <p className="text-sm text-gray-600">Add input/output examples for your challenge</p>
            </div>

            {/* Add Test Case Form */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input
                  </label>
                  <textarea
                    value={currentTestCase.input}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, input: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Enter test input..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Output
                  </label>
                  <textarea
                    value={currentTestCase.expectedOutput}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, expectedOutput: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Enter expected output..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentTestCase.isHidden}
                    onChange={(e) => setCurrentTestCase(prev => ({ ...prev, isHidden: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hidden test case</span>
                </label>
                <Button
                  type="button"
                  onClick={handleAddTestCase}
                  disabled={!currentTestCase.input.trim() || !currentTestCase.expectedOutput.trim()}
                  variant="secondary"
                >
                  Add Test Case
                </Button>
              </div>
            </div>

            {/* Test Cases List */}
            {testCases.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Added Test Cases ({testCases.length})</h4>
                {testCases.map((testCase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Test Case {index + 1}
                        {testCase.isHidden && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Hidden
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Input:</span>
                        <pre className="mt-1 bg-gray-50 p-2 rounded text-gray-800 whitespace-pre-wrap">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Expected Output:</span>
                        <pre className="mt-1 bg-gray-50 p-2 rounded text-gray-800 whitespace-pre-wrap">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.testCases && (
              <p className="mt-2 text-sm text-danger-600">{errors.testCases}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/challenges')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Challenge
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;