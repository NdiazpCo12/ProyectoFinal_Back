import React from 'react';

interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'MEDIUM':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'HARD':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyStyles(difficulty)}`}
    >
      {difficulty}
    </span>
  );
};