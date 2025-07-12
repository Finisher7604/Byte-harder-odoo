import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare, CheckCircle, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import VoteButtons from '../components/VoteButtons';
import RichTextEditor from '../components/RichTextEditor';

const Question: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getQuestionById, getAnswersByQuestionId, addAnswer, acceptAnswer } = useData();
  const { addNotification } = useNotifications();
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = getQuestionById(id!);
  const answers = getAnswersByQuestionId(id!);

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to questions
        </Link>
      </div>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answerContent.trim()) return;

    setIsSubmitting(true);
    
    try {
      addAnswer({
        questionId: question.id,
        content: answerContent,
        authorId: user.id,
        authorUsername: user.username
      });

      // Send notification to question author
      if (question.authorId !== user.id) {
        addNotification({
          userId: question.authorId,
          type: 'answer',
          title: 'New Answer',
          message: `${user.username} answered your question: ${question.title}`,
          relatedId: question.id
        });
      }

      setAnswerContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (user?.id === question.authorId) {
      acceptAnswer(question.id, answerId);
    }
  };

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.votes - a.votes;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex space-x-4">
          <VoteButtons
            targetId={question.id}
            targetType="question"
            votes={question.votes}
          />
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
            
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.description }}
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
            
            {/* Question Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{answers.length} answer{answers.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>asked {formatTimeAgo(question.createdAt)} by {question.authorUsername}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      {answers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="space-y-6">
            {sortedAnswers.map(answer => (
              <div
                key={answer.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <VoteButtons
                      targetId={answer.id}
                      targetType="answer"
                      votes={answer.votes}
                    />
                    
                    {answer.isAccepted && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-5 w-5 fill-current" />
                      </div>
                    )}
                    
                    {user?.id === question.authorId && !answer.isAccepted && !question.acceptedAnswerId && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Accept this answer"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      {answer.isAccepted && (
                        <div className="flex items-center space-x-1 text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          <span>Accepted Answer</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 ml-auto">
                        <User className="h-4 w-4" />
                        <span>answered {formatTimeAgo(answer.createdAt)} by {answer.authorUsername}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {user ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                minHeight="150px"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!answerContent.trim() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Your Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to post an answer.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Question;