import React from 'react';
import { User, Calendar, Award, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { questions, answers } = useData();

  if (!user) return null;

  const userQuestions = questions.filter(q => q.authorId === user.id);
  const userAnswers = answers.filter(a => a.authorId === user.id);
  const acceptedAnswers = userAnswers.filter(a => a.isAccepted);
  
  const totalQuestionVotes = userQuestions.reduce((sum, q) => sum + q.votes, 0);
  const totalAnswerVotes = userAnswers.reduce((sum, a) => sum + a.votes, 0);
  const totalVotes = totalQuestionVotes + totalAnswerVotes;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const stats = [
    {
      label: 'Questions Asked',
      value: userQuestions.length,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      label: 'Answers Given',
      value: userAnswers.length,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      label: 'Accepted Answers',
      value: acceptedAnswers.length,
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      label: 'Total Votes',
      value: totalVotes,
      icon: ThumbsUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center space-x-6">
          <div className="bg-blue-600 text-white p-6 rounded-full">
            <User className="h-12 w-12" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              {user.role === 'admin' && (
                <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{user.email}</p>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Questions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Questions</h2>
          
          {userQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions asked yet</p>
          ) : (
            <div className="space-y-4">
              {userQuestions.slice(0, 3).map(question => (
                <div key={question.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {question.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{question.votes} votes</span>
                      <span>•</span>
                      <span>{question.answerCount} answers</span>
                    </div>
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Answers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Answers</h2>
          
          {userAnswers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No answers posted yet</p>
          ) : (
            <div className="space-y-4">
              {userAnswers.slice(0, 3).map(answer => {
                const question = questions.find(q => q.id === answer.questionId);
                return (
                  <div key={answer.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-2 mb-2">
                      {answer.isAccepted && (
                        <Award className="h-4 w-4 text-yellow-600 mt-0.5" />
                      )}
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {question?.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{answer.votes} votes</span>
                        {answer.isAccepted && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-600">Accepted</span>
                          </>
                        )}
                      </div>
                      <span>{formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;