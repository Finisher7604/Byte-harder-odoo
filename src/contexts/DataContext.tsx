import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  authorUsername: string;
  createdAt: Date;
  votes: number;
  answerCount: number;
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorUsername: string;
  createdAt: Date;
  votes: number;
  isAccepted: boolean;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string; // question or answer id
  targetType: 'question' | 'answer';
  type: 'up' | 'down';
}

interface DataContextType {
  questions: Question[];
  answers: Answer[];
  votes: Vote[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'votes' | 'answerCount'>) => void;
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'votes' | 'isAccepted'>) => void;
  vote: (targetId: string, targetType: 'question' | 'answer', voteType: 'up' | 'down') => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  getQuestionById: (id: string) => Question | undefined;
  getAnswersByQuestionId: (questionId: string) => Answer[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement authentication in React?',
    description: '<p>I\'m building a React application and need to implement user authentication. What are the best practices for handling login, logout, and protecting routes?</p><p><strong>Requirements:</strong></p><ul><li>JWT token management</li><li>Protected routes</li><li>Persistent login state</li></ul>',
    tags: ['React', 'Authentication', 'JWT', 'Security'],
    authorId: '2',
    authorUsername: 'jane_smith',
    createdAt: new Date('2024-01-20'),
    votes: 15,
    answerCount: 3,
    acceptedAnswerId: '1'
  },
  {
    id: '2',
    title: 'Best practices for state management in large React apps?',
    description: '<p>I\'m working on a large React application with complex state requirements. Should I use Redux, Zustand, or stick with React Context?</p><p>The app has:</p><ul><li>User authentication</li><li>Real-time data updates</li><li>Complex form state</li><li>Caching requirements</li></ul>',
    tags: ['React', 'State Management', 'Redux', 'Zustand', 'Context'],
    authorId: '1',
    authorUsername: 'john_doe',
    createdAt: new Date('2024-01-18'),
    votes: 8,
    answerCount: 2
  }
];

const mockAnswers: Answer[] = [
  {
    id: '1',
    questionId: '1',
    content: '<p>For implementing authentication in React, I recommend using a combination of <strong>Context API</strong> and <strong>JWT tokens</strong>. Here\'s a comprehensive approach:</p><h3>1. Create an Auth Context</h3><pre><code>const AuthContext = createContext();</code></pre><h3>2. Token Management</h3><ul><li>Store tokens in localStorage or httpOnly cookies</li><li>Implement token refresh logic</li><li>Handle token expiration gracefully</li></ul><h3>3. Protected Routes</h3><p>Use a higher-order component or custom hook to protect routes that require authentication.</p>',
    authorId: '1',
    authorUsername: 'john_doe',
    createdAt: new Date('2024-01-20'),
    votes: 12,
    isAccepted: true
  },
  {
    id: '2',
    questionId: '1',
    content: '<p>Another great approach is using libraries like <strong>Auth0</strong> or <strong>Firebase Auth</strong> for production applications. They handle the complexity for you:</p><ul><li>Multi-factor authentication</li><li>Social login providers</li><li>Security best practices</li></ul><p>For learning purposes, implementing your own is great, but for production, consider these managed solutions.</p>',
    authorId: '2',
    authorUsername: 'jane_smith',
    createdAt: new Date('2024-01-21'),
    votes: 5,
    isAccepted: false
  }
];

const mockVotes: Vote[] = [
  { id: '1', userId: '1', targetId: '1', targetType: 'question', type: 'up' },
  { id: '2', userId: '2', targetId: '1', targetType: 'answer', type: 'up' }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers);
  const [votes, setVotes] = useState<Vote[]>(mockVotes);
  const { user } = useAuth();

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'votes' | 'answerCount'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      votes: 0,
      answerCount: 0
    };
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'votes' | 'isAccepted'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      votes: 0,
      isAccepted: false
    };
    setAnswers(prev => [...prev, newAnswer]);
    
    // Update answer count
    setQuestions(prev => prev.map(q => 
      q.id === answerData.questionId 
        ? { ...q, answerCount: q.answerCount + 1 }
        : q
    ));
  };

  const vote = (targetId: string, targetType: 'question' | 'answer', voteType: 'up' | 'down') => {
    if (!user) return;

    // Remove existing vote if any
    setVotes(prev => prev.filter(v => 
      !(v.userId === user.id && v.targetId === targetId && v.targetType === targetType)
    ));

    // Add new vote
    const newVote: Vote = {
      id: Date.now().toString(),
      userId: user.id,
      targetId,
      targetType,
      type: voteType
    };
    setVotes(prev => [...prev, newVote]);
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => prev.map(a => ({
      ...a,
      isAccepted: a.questionId === questionId ? a.id === answerId : a.isAccepted
    })));
    
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, acceptedAnswerId: answerId } : q
    ));
  };

  const getQuestionById = (id: string) => questions.find(q => q.id === id);
  
  const getAnswersByQuestionId = (questionId: string) => 
    answers.filter(a => a.questionId === questionId);

  // Calculate votes for questions and answers
  useEffect(() => {
    setQuestions(prev => prev.map(q => {
      const questionVotes = votes.filter(v => v.targetId === q.id && v.targetType === 'question');
      const upVotes = questionVotes.filter(v => v.type === 'up').length;
      const downVotes = questionVotes.filter(v => v.type === 'down').length;
      return { ...q, votes: upVotes - downVotes };
    }));

    setAnswers(prev => prev.map(a => {
      const answerVotes = votes.filter(v => v.targetId === a.id && v.targetType === 'answer');
      const upVotes = answerVotes.filter(v => v.type === 'up').length;
      const downVotes = answerVotes.filter(v => v.type === 'down').length;
      return { ...a, votes: upVotes - downVotes };
    }));
  }, [votes]);

  const value = {
    questions,
    answers,
    votes,
    addQuestion,
    addAnswer,
    vote,
    acceptAnswer,
    getQuestionById,
    getAnswersByQuestionId
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};