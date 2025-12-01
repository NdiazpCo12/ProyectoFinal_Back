import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { coursesApi } from '../../api/courses.api';
import toast from 'react-hot-toast';

const CourseForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nrc: '',
    period: '',
    group: 1,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'group' ? parseInt(value) || 1 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.nrc.trim()) {
      newErrors.nrc = 'NRC is required';
    }

    if (!formData.period.trim()) {
      newErrors.period = 'Period is required';
    }

    if (formData.group < 1) {
      newErrors.group = 'Group must be at least 1';
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
      await coursesApi.createCourse(formData);
      toast.success('Course created successfully!');
      navigate('/courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      const message = error.response?.data?.message || 'Failed to create course';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-gray-600">Add a new course to the system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Course Name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g., Programming Fundamentals"
              />

              <Input
                label="NRC"
                name="nrc"
                type="text"
                required
                value={formData.nrc}
                onChange={handleChange}
                error={errors.nrc}
                placeholder="e.g., 12345"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Period"
                name="period"
                type="text"
                required
                value={formData.period}
                onChange={handleChange}
                error={errors.period}
                placeholder="e.g., 2025-1"
              />

              <Input
                label="Group"
                name="group"
                type="number"
                required
                min="1"
                value={formData.group}
                onChange={handleChange}
                error={errors.group}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/courses')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;