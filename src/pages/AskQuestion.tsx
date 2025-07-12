import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';

const AskQuestion: React.FC = () => {
  const { user } = useAuth();
  const { addQuestion } = useData();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (title.length > 150) {
      newErrors.title = 'Title must be less than 150 characters';
    }

    if (!description.trim() || description === '<p></p>' || description === '<p><br></p>') {
      newErrors.description = 'Description is required';
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    
    try {
      addQuestion({
        title: title.trim(),
        description,
        tags,
        authorId: user.id,
        authorUsername: user.username
      });
      
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">
            Get help from the community by asking a clear, specific question with relevant details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Be specific and imagine you're asking a question to another person.
            </p>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., How do I implement authentication in React with JWT tokens?"
              maxLength={150}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{title.length}/150 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Include all the information someone would need to answer your question. Use the formatting tools to make your question clear and readable.
            </p>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide details about your problem. What did you try? What exactly are you trying to achieve?"
              minHeight="250px"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
            </p>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="e.g., React, JavaScript, Authentication"
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{tags.length}/5 tags</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Publishing...' : 'Post Your Question'}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for asking a great question:</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Make your title specific and descriptive</li>
          <li>• Include what you've already tried</li>
          <li>• Show relevant code or examples</li>
          <li>• Use proper formatting and tags</li>
          <li>• Be respectful and clear in your language</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestion;