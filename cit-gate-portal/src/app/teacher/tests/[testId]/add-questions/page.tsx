'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Plus, Trash2, Save, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  questionText: string;
  type: 'mcq' | 'msq' | 'nat';
  image?: File | null;
  imagePreview?: string;
  options: string[];
  answer: string | string[];
  marks: number;
}

const questionTypes = [
  { value: 'mcq', label: 'Multiple Choice (Single Answer)' },
  { value: 'msq', label: 'Multiple Choice (Multiple Answers)' },
  { value: 'nat', label: 'Numerical Answer Type' }
];

export default function TestCreator() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const response = await fetch(`/api/tests/teacher/${testId}`);
      if (!response.ok) throw new Error('Failed to fetch test details.');
      const data = await response.json();
      setTestTitle(data.title);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: any, index: number) => ({ ...q, id: index + 1, image: null, imagePreview: q.imageUrl })))
      } else {
        addQuestion();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      questionText: '',
      type: 'mcq',
      image: null,
      imagePreview: '',
      options: ['', '', '', ''],
      answer: '',
      marks: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleImageUpload = useCallback((file: File, questionIndex: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateQuestion(questionIndex, 'image', file);
      updateQuestion(questionIndex, 'imagePreview', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, idx) => idx === index ? { ...q, [field]: value } : q));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestionImage = (questionIndex: number) => {
    updateQuestion(questionIndex, 'image', null);
    updateQuestion(questionIndex, 'imagePreview', '');
  };

  const handleSaveTest = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    const processedQuestions = questions.map(q => {
      const { image, imagePreview, ...rest } = q;
      return rest;
    });

    formData.append('questions', JSON.stringify(processedQuestions));

    questions.forEach((q, index) => {
      if (q.image) {
        formData.append(`question_image_${index}`, q.image);
      }
    });

    try {
      const response = await fetch(`/api/tests/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save questions.');
      }

      alert('Test saved successfully!');
      router.push('/teacher/tests');
    } catch (error: any) { 
      console.error('Error saving test:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Loading...</div>; // Or some other placeholder
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Questions to: {testTitle}</h1>
              <p className="text-gray-600 mt-1">Design and configure your test questions</p>
            </div>
            <button onClick={() => setShowPreview(!showPreview)} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Eye className="mr-2 h-5 w-5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Question {currentQuestionIndex + 1} of {questions.length}</h2>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))} disabled={currentQuestionIndex === questions.length - 1} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button onClick={addQuestion} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Question
                </button>
              </div>
            </div>

            {/* Question Edit Form */}
            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => updateQuestion(currentQuestionIndex, 'questionText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter the question text here..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (Optional)</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    {currentQuestion.imagePreview ? (
                      <img src={currentQuestion.imagePreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`file-upload-${currentQuestion.id}`} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <Upload className="inline-block mr-2 h-4 w-4" />
                      <span>Upload Image</span>
                    </label>
                    <input id={`file-upload-${currentQuestion.id}`} name={`file-upload-${currentQuestion.id}`} type="file" className="sr-only" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], currentQuestionIndex)} accept="image/*" />
                    {currentQuestion.imagePreview && (
                      <button onClick={() => removeQuestionImage(currentQuestionIndex)} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                        <Trash2 className="inline-block mr-1 h-4 w-4" />
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => updateQuestion(currentQuestionIndex, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {questionTypes.map(qt => (
                    <option key={qt.value} value={qt.value}>{qt.label}</option>
                  ))}
                </select>
              </div>

              {/* Options for MCQ/MSQ */}
              {(currentQuestion.type === 'mcq' || currentQuestion.type === 'msq') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        type="text"
                        value={opt}
                        onChange={(e) => updateQuestionOption(currentQuestionIndex, optIdx, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                {currentQuestion.type === 'mcq' && (
                  <select
                    value={currentQuestion.answer as string}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'answer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select correct option</option>
                    {currentQuestion.options.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {currentQuestion.type === 'msq' && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, idx) => (
                      <label key={idx} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Array.isArray(currentQuestion.answer) && currentQuestion.answer.includes(opt)}
                          onChange={(e) => {
                            const newAnswer = Array.isArray(currentQuestion.answer) ? [...currentQuestion.answer] : [];
                            if (e.target.checked) {
                              newAnswer.push(opt);
                            } else {
                              const index = newAnswer.indexOf(opt);
                              if (index > -1) newAnswer.splice(index, 1);
                            }
                            updateQuestion(currentQuestionIndex, 'answer', newAnswer);
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {currentQuestion.type === 'nat' && (
                  <input
                    type="text"
                    value={currentQuestion.answer as string}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'answer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter numerical answer"
                  />
                )}
              </div>

              {/* Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                <input
                  type="number"
                  value={currentQuestion.marks}
                  onChange={(e) => updateQuestion(currentQuestionIndex, 'marks', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter marks for this question"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button onClick={handleSaveTest} className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <Save className="mr-2 h-5 w-5" />
            Save Test
          </button>
        </div>

        {/* Preview Modal (simplified) */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-full overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Test Preview</h2>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="border p-4 rounded-md">
                    <p className="font-semibold">Q{idx + 1}: {q.questionText}</p>
                    {q.imagePreview && <img src={q.imagePreview} alt="Question image" className="max-w-xs my-2" />}
                    {q.type !== 'nat' && (
                      <ul className="list-disc list-inside mt-2">
                        {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                      </ul>
                    )}
                    <p className="mt-2 text-green-600">Answer: {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</p>
                    <p className="text-sm text-gray-500">Marks: {q.marks}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowPreview(false)} className="mt-6 px-4 py-2 bg-gray-200 rounded-md">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}