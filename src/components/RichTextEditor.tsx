import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  minHeight = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ✅ Set editor content only when value updates (not every render)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '👏', '🚀'];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button type="button" onClick={() => execCommand('bold')} title="Bold" className="p-2 hover:bg-gray-200 rounded">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="Italic" className="p-2 hover:bg-gray-200 rounded">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} title="Strikethrough" className="p-2 hover:bg-gray-200 rounded">
          <Strikethrough className="h-4 w-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Bullet List" className="p-2 hover:bg-gray-200 rounded">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Numbered List" className="p-2 hover:bg-gray-200 rounded">
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('justifyLeft')} title="Align Left" className="p-2 hover:bg-gray-200 rounded">
          <AlignLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Align Center" className="p-2 hover:bg-gray-200 rounded">
          <AlignCenter className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Align Right" className="p-2 hover:bg-gray-200 rounded">
          <AlignRight className="h-4 w-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={insertLink} title="Insert Link" className="p-2 hover:bg-gray-200 rounded">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" onClick={insertImage} title="Insert Image" className="p-2 hover:bg-gray-200 rounded">
          <Image className="h-4 w-4" />
        </button>
        <div className="relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Insert Emoji" className="p-2 hover:bg-gray-200 rounded">
            <Smile className="h-4 w-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 focus:outline-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* Placeholder styling */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>

    </div>
  );
};

export default RichTextEditor;
