import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, CheckCircle, Filter, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import VoteButtons from '../components/VoteButtons';

const Home: React.FC = () => {
  const { questions } = useData();
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'activity'>('newest');
  const [filterTag, setFilterTag] = useState<string>('');

  const allTags = Array.from(
    new Set(questions.flatMap(q => q.tags))
  ).sort();

  const filteredQuestions = questions.filter(q => 
    !filterTag || q.tags.includes(filterTag)
  );

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'activity':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Questions</h1>
          <p className="text-gray-600">
            {questions.length} question{questions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        <Link
          to="/ask"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ask Question
        </Link>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="votes">Most Votes</option>
              <option value="activity">Recent Activity</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by tag:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {sortedQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-4">
            {filterTag ? `No questions with the tag "${filterTag}"` : 'Be the first to ask a question!'}
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ask Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map(question => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-4">
                {/* Vote Buttons */}
                <VoteButtons
                  targetId={question.id}
                  targetType="question"
                  votes={question.votes}
                />
                
                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      to={`/question/${question.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {question.title}
                    </Link>
                  </div>
                  
                  <div
                    className="text-gray-600 mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: question.description.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...'
                    }}
                  />
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answerCount} answer{question.answerCount !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {question.acceptedAnswerId && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Accepted</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>asked {formatTimeAgo(question.createdAt)} by {question.authorUsername}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;