import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface VoteButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  votes: number;
  className?: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  targetId,
  targetType,
  votes,
  className = ''
}) => {
  const { user } = useAuth();
  const { vote, votes: allVotes } = useData();

  const userVote = allVotes.find(v => 
    v.userId === user?.id && 
    v.targetId === targetId && 
    v.targetType === targetType
  );

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) return;
    vote(targetId, targetType, voteType);
  };

  return (
    <div className={`flex flex-col items-center space-y-1 ${className}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={!user}
        className={`p-1 rounded transition-colors ${
          userVote?.type === 'up'
            ? 'text-green-600 bg-green-100'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!user ? 'Login to vote' : 'Upvote'}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      
      <span className={`text-sm font-medium ${
        votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {votes}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={!user}
        className={`p-1 rounded transition-colors ${
          userVote?.type === 'down'
            ? 'text-red-600 bg-red-100'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!user ? 'Login to vote' : 'Downvote'}
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
};

export default VoteButtons;