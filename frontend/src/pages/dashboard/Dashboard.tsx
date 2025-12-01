import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Online Judge Platform
              </h1>
              <div className="mb-6">
                <p className="text-lg text-gray-600 mb-2">
                  Hello, <span className="font-semibold">{user?.email}</span>!
                </p>
                <p className="text-sm text-gray-500">
                  Role: <span className="capitalize font-medium">{user?.role.toLowerCase()}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Link to="/challenges" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenges</h3>
                    <p className="text-gray-600 text-sm">Browse and solve programming challenges</p>
                  </Link>
                  <Link to="/courses" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses</h3>
                    <p className="text-gray-600 text-sm">Manage your enrolled courses</p>
                  </Link>
                  <Link to="/submissions" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Submissions</h3>
                    <p className="text-gray-600 text-sm">View your code submissions</p>
                  </Link>
                </div>

                <div className="pt-6">
                  <Button variant="secondary" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;