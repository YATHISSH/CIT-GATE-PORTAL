'use client'
import { useState, useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';

interface Question {
    id: number;
    questionText: string;
    mark: number;
    type: 'mcq' | 'msq' | 'nat';
    image?: File | null;
    imagePreview?: string;
    correctAnswerMCQ: string | null;
    correctAnswerMSQ: string[] | null;
    correctAnswerNAT: string | null;
    options: string[];
}

interface TestForm {
    department: string;
    testTitle: string;
    subjectName: string;
    duration: number;
    startTime: string;
    endTime: string;
    totalMarks: number;
    numberOfQuestions: number;
    questions: Question[];
}

interface ValidationErrors {
    testTitle?: string;
    subjectName?: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
    department?: string;
    numberOfQuestions?: string;
}

const departments = [
    'CSE',
    'IT',
    'AIDS',
    'AIML',
    'CS',
    'CSBS',
    'ECE',
    'EEE',
    'MCT',
    'MECH'
];

const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice Questions' },
    { value: 'msq', label: 'Multiple Select Questions' },
    { value: 'nat', label: 'Numerical Answer Type' }
];

export default function TestCreator() {
    const [testForm, setTestForm] = useState<TestForm>({
        department: "",
        testTitle: "",
        subjectName: "",
        duration: 0,
        startTime: "",
        endTime: "",
        totalMarks: 0,
        numberOfQuestions: 0,
        questions: []
    });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        testTitle: '',
        subjectName: '',
        startTime: '',
        endTime: '',
        duration: '',
        department: '',
        numberOfQuestions: ''
    });
    const mcqOptions = [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' },];

    const [formError, setformError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();


    const validateErrorMessage = (field: keyof ValidationErrors, value: any) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const validateQuestion = (question: Question): string => {
    
        if (!question.questionText.trim()) {
          return "Question text is required";
        }
    
        if (!question.mark || question.mark <= 0) {
          return "Marks must be greater than 0";
        }
    
        if (question.type === 'mcq' || question.type === 'msq') {
          const emptyOptions = question.options.filter(opt => !opt.trim());
          if (emptyOptions.length > 0) {
            return "All options must be filled"
          }
        }
    
        if (question.type === 'mcq' && !question.correctAnswerMCQ) {
          return "Correct answer must be selected for MCQ";
        }
    
        if (question.type === 'msq' && (!question.correctAnswerMSQ || question.correctAnswerMSQ.length === 0)) {
          return "At least one correct answer must be selected for MSQ";
        }
    
        if (question.type === 'nat' && !question.correctAnswerNAT?.trim()) {
          return "Correct answer is required for NAT";
        }
    
        return "";
      };
    
      const validateForm = (): boolean => {
    
        if (testForm.department.trim().length == 0) {
          validateErrorMessage('department', 'Department is required');
          setformError("Department is required")
          return false;
        }
    
        if (testForm.testTitle.trim().length === 0) {
          validateErrorMessage('testTitle', 'Test Title is required');
          setformError("Test Title is required")
          return false;
        }
    
        if (testForm.subjectName.trim().length === 0) {
          validateErrorMessage('subjectName', 'Subject Name is required');
          setformError("Subject Name is required");
          return false;
        }
    
        if (testForm.duration <= 0) {
          validateErrorMessage('duration', 'Duration is required');
          setformError("Duration is required");
          return false;
        }
    
        if (testForm.startTime.trim().length === 0) {
          validateErrorMessage('startTime', 'Start Time is required');
          setformError("Start Time is required")
          return false;
        }
    
        if (testForm.endTime.trim().length === 0) {
          validateErrorMessage('endTime', 'End Time is required');
          setformError("End Time is required")
          return false;
        }
    
        if (testForm.numberOfQuestions < 1) {
          validateErrorMessage("numberOfQuestions", "Questions must be atleast 1.");
          return false;
        }
    
        if (testForm.startTime && testForm.endTime) {
          const startDate = new Date(testForm.startTime);
          const endDate = new Date(testForm.endTime);
          if (endDate <= startDate) {
            setformError("Start time must be less than End Time.");
            return false;
          }
        }
    
        return true;
      };
    
      const validateAllQuestions = (): boolean => {
    
        for (let index = 0; index < testForm.questions.length; index++) {
          const errors = validateQuestions(index);
          if (!errors) {
            setCurrentQuestionIndex(index);
            setformError(validateQuestion(testForm.questions[index]));
            return false;
          }
        }
        return true;
      };
    
      const handleNumberOfQuestionsChange = (num: number) => {
        const questions: Question[] = Array.from({ length: num }, (_, index) => ({
          id: index + 1,
          questionText: '',
          mark: 1,
          correctAnswerMCQ: null,
          correctAnswerMSQ: null,
          correctAnswerNAT: null,
          type: 'mcq',
          image: null,
          imagePreview: '',
          options: ['', '', '', '']
        }));
    
        const storedQuestions = localStorage.getItem('testForm');
        if (storedQuestions) {
          const parsedQuestions: TestForm = JSON.parse(storedQuestions);
          questions.forEach((question, index) => {
            if (parsedQuestions.questions[index]) {
              question.questionText = parsedQuestions.questions[index].questionText || '';
              question.mark = parsedQuestions.questions[index].mark || 0;
              question.type = parsedQuestions.questions[index].type || 'mcq';
              question.image = parsedQuestions.questions[index].image || null;
              question.imagePreview = parsedQuestions.questions[index].imagePreview || '';
              question.correctAnswerMCQ = parsedQuestions.questions[index].correctAnswerMCQ || null;
              question.correctAnswerMSQ = parsedQuestions.questions[index].correctAnswerMSQ || null;
              question.correctAnswerNAT = parsedQuestions.questions[index].correctAnswerNAT || null;
              question.options = parsedQuestions.questions[index].options || ['', '', '', ''];
            }
          });
        }
    
        setTestForm(prev => ({
          ...prev,
          numberOfQuestions: num,
          questions
        }));
        setCurrentQuestionIndex(0);
      };
    
    
      const validateQuestions = (index: number) => {
        const question = testForm.questions[index];
        if (!question) return false;
    
        const isValid =
          (question.type === 'mcq' || question.type === 'msq') ?
            question.questionText.trim() !== '' &&
            question.mark > 0 &&
            (question.options.every(opt => opt.trim() !== '')) &&
            ((question.correctAnswerMCQ !== null && question.correctAnswerMCQ.trim().length > 0) || (question.correctAnswerMSQ !== null && question.correctAnswerMSQ.join("").trim().length > 0) || (question.correctAnswerNAT !== null && question.correctAnswerNAT.trim().length > 0)) :
            (question.type === 'nat') ?
              question.questionText.trim() !== '' &&
              question.mark > 0 &&
              (question.correctAnswerNAT !== null && question.correctAnswerNAT.trim().length > 0) :
              false;
        return isValid;
      };
    
      const getTotalQuestions = () => {
        const total: number = testForm.questions.reduce((sum, question) => sum + Number(question.mark || 0), 0);
        testForm.totalMarks = total;
        return total > 0 ? total : testForm.numberOfQuestions * 1;
      };
    
      const handleImageUpload = useCallback((file: File, questionIndex: number) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTestForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
              idx === questionIndex
                ? { ...q, image: file, imagePreview: e.target?.result as string }
                : q
            )
          }));
        };
        reader.readAsDataURL(file);
      }, []);
    
      const updateQuestion = (index: number, field: keyof Question, value: any) => {
        setTestForm(prev => ({
          ...prev,
          questions: prev.questions.map((q, idx) =>
            idx === index ? { ...q, [field]: value } : q
          )
        }));
      };
    
      // Update question option
      const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
        setTestForm(prev => ({
          ...prev,
          questions: prev.questions.map((q, idx) =>
            idx === questionIndex
              ? {
                ...q,
                options: q.options.map((opt, optIdx) =>
                  optIdx === optionIndex ? value : opt
                )
              }
              : q
          )
        }));
      };
    
      // Remove image from question
      const removeQuestionImage = (questionIndex: number) => {
        setTestForm(prev => ({
          ...prev,
          questions: prev.questions.map((q, idx) =>
            idx === questionIndex
              ? { ...q, image: null, imagePreview: '' }
              : q
          )
        }));
      };

    // Save test (placeholder function)
    const handleSaveTest = async () => {
      const formErrorMessage2 = validateForm();
      if (!formErrorMessage2) return;
      const formErrorMessage = validateAllQuestions();
      if (!formErrorMessage) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/tests/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(testForm)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save test");
            }

            alert("Test saved successfully!");
            console.log("Saved test:", data.test);

            localStorage.removeItem("testForm");
            setTestForm({
                department: "",
                testTitle: "",
                subjectName: "",
                duration: 0,
                startTime: "",
                endTime: "",
                totalMarks: 0,
                numberOfQuestions: 1,
                questions: []
            });
        } catch (err: any) {
            console.error("Error saving test:", err.message);
            alert("Error saving test: " + err.message);
        }
    };

    const currentQuestion = testForm.questions[currentQuestionIndex];

    useEffect(() => {
        const getStoredQuestions = () => {
            const storedQuestions = localStorage.getItem('testForm');
            if (storedQuestions) {
                const parsedQuestions: TestForm = JSON.parse(storedQuestions);
                setTestForm(parsedQuestions);
                setCurrentQuestionIndex(0);
            }
        };
        getStoredQuestions();
    }, []);

    useEffect(() => {
        localStorage.setItem('testForm', JSON.stringify(testForm));
    }, [testForm]);

    return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {showPopup && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
            Test saved successfully! Redirecting...
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4">
            <h1 className="text-3xl w-full text-center font-bold text-gray-900">Create New Test</h1>
          </div>

          {/* Basic Test Information */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className='text-black'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={testForm.department}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, department: e.target.value }));
                    validateErrorMessage('department', e.target.value ? '' : 'Department is required');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {validationErrors.department && (<p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>)}
              </div>

              {/* Test Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={testForm.testTitle}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, testTitle: e.target.value }));
                    validateErrorMessage('testTitle', e.target.value ? '' : 'Test Title is required');
                  }}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Eg: CSE GATE 2025 Set A"
                  required
                />
                {validationErrors.testTitle && (<p className="text-red-500 text-sm mt-1">{validationErrors.testTitle}</p>)}
              </div>
            </div>

            {/* Subject Name and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={testForm.subjectName}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, subjectName: e.target.value }));
                    validateErrorMessage('subjectName', e.target.value ? '' : 'Subject Name is required');
                  }}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Eg: Data Structures"
                  required
                />
                {validationErrors.subjectName && (<p className="text-red-500 text-sm mt-1">{validationErrors.subjectName}</p>)}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="number"
                  value={testForm.duration || ""}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, duration: Number(e.target.value) }))
                    validateErrorMessage('duration', e.target.value ? '' : 'Duration is required');
                  }}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Eg: 60 (in minutes)"
                  required
                />
                {validationErrors.duration && (<p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>)}
              </div>
            </div>


            {/* Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={testForm.startTime}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, startTime: e.target.value }))
                    validateErrorMessage('startTime', e.target.value ? '' : 'Start Time is required');
                  }}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Test Title"
                  required
                />
                {validationErrors.startTime && (<p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>)}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={testForm.endTime}
                  onChange={(e) => {
                    setTestForm(prev => ({ ...prev, endTime: e.target.value }));
                    validateErrorMessage('endTime', e.target.value ? '' : 'End Time is required');
                  }}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Test Title"
                  required
                />
                {validationErrors.endTime && (<p className="text-red-500 text-sm mt-1">{validationErrors.endTime}</p>)}
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions *
                </label>
                <select
                  value={testForm.numberOfQuestions || ""}
                  onChange={(e) => {
                    handleNumberOfQuestionsChange(parseInt(e.target.value))
                    validateErrorMessage("numberOfQuestions", Number(e.target.value) > 0 ? "" : "Question must be atleast 1.")
                  }}
                  className="w-full  text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Array.from({ length: 100 }, (_, i) => i).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                {validationErrors.numberOfQuestions && (<p className="text-red-500 text-sm mt-1">{validationErrors.numberOfQuestions}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks
                </label>
                <div className="w-full text-black bg-blue-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {getTotalQuestions()} Marks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        {testForm.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {testForm.numberOfQuestions}
                  </span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >

                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="mt-4 flex flex-wrap gap-2">
                {testForm.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentQuestionIndex === index
                      ? 'bg-blue-600 text-white'
                      : validateQuestions(index) === true
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Editor */}
            {currentQuestion && (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question {currentQuestionIndex + 1} *
                    </label>
                    <textarea
                      value={currentQuestion.questionText}
                      onChange={(e) => updateQuestion(currentQuestionIndex, 'questionText', e.target.value)}
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type *
                      </label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'type', e.target.value)}
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Image (Optional)
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">

                          <span className="text-sm text-gray-700">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, currentQuestionIndex);
                            }}
                            className="hidden"
                          />
                        </label>
                        {currentQuestion.imagePreview && (
                          <button
                            onClick={() => removeQuestionImage(currentQuestionIndex)}
                            className="p-2 text-white text-sm bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>


                  {/* Image Preview */}
                  {currentQuestion.imagePreview && (
                    <div className="mt-4">
                      <img
                        src={currentQuestion.imagePreview}
                        alt="Question"
                        className="max-w-md h-auto rounded-lg border border-gray-300 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Total Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks Alloted *
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.mark || ''}
                      onChange={(e) => updateQuestion(currentQuestionIndex, 'mark', e.target.value)}
                      className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter the mark for this question"
                      required
                    />
                  </div>

                  {/* Options (only for MCQ and MSQ) */}
                  {(currentQuestion.type === 'mcq' || currentQuestion.type === 'msq') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Answer Options *
                      </label>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center">
                            <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-black text-md font-medium rounded-full mr-3">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <input
                              type="text"
                              required value={option}
                              onChange={(e) => updateQuestionOption(currentQuestionIndex, optionIndex, e.target.value)}
                              className="flex-1 text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentQuestion.type === "mcq" &&
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <select
                        value={currentQuestion.correctAnswerMCQ || ''}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'correctAnswerMCQ', e.target.value)}
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Options</option>
                        {mcqOptions.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>}
                  {currentQuestion.type === "msq" &&
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <div className="flex flex-wrap justify-between gap-4">
                        {mcqOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex w-1/5 items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={currentQuestion.correctAnswerMSQ?.includes(option.value) === true}
                              value={option.value}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const selectedValue = option.value;

                                setTestForm(prev => ({
                                  ...prev,
                                  questions: prev.questions.map((q, idx) => {
                                    if (idx !== currentQuestionIndex) return q;

                                    const currentAnswers = q.correctAnswerMSQ || [];

                                    let updatedAnswers;
                                    if (isChecked) {
                                      updatedAnswers = [...new Set([...currentAnswers, selectedValue])];
                                    } else {
                                      updatedAnswers = currentAnswers.filter(val => val !== selectedValue);
                                    }

                                    return { ...q, correctAnswerMSQ: updatedAnswers };
                                  })
                                }));
                              }}
                              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="text-gray-700 group-hover:text-indigo-700 font-medium">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  }
                  {currentQuestion.type === "nat" &&
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={currentQuestion.correctAnswerNAT || ''}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'correctAnswerNAT', e.target.value)}
                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter correct answer"
                        required
                      />
                    </div>}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous Question
                  </button>

                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(testForm.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === testForm.questions.length - 1}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next Question
                  </button>
                </div>
                {formError.length > 0 && <p className='text-red-500 text-sm font-semibold mt-2'>{formError}</p>}
              </div>
            )}
          </div>
        )}

        {/* Preview Section */}
        {showPreview && testForm.questions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Test Preview</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mt-1">Test Title: {testForm.testTitle}</p>
                <p className="text-gray-600 mt-1">Subject Name: {testForm.subjectName}</p>
                <p className="text-gray-600 mt-1">Department: {testForm.department}</p>
                <p className="text-gray-600 mt-1">Total Marks: {testForm.totalMarks}</p>
              </div>

              <div className="space-y-8">
                {testForm.questions.map((question, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-medium text-gray-900 mb-2">
                      Q{index + 1}. {question.questionText || 'Question not entered yet'}
                    </div>
                    {question.imagePreview && (
                      <img
                        src={question.imagePreview}
                        alt={`Question ${index + 1}`}
                        className="max-w-sm h-auto rounded border border-gray-300 mb-3"
                      />
                    )}
                    {(question.type === 'mcq' || question.type === 'msq') && (
                      <div className="ml-4 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-gray-700">
                            {String.fromCharCode(65 + optIndex)}. {option || 'Option not entered'}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'nat' && (
                      <div className="ml-4 text-gray-600 italic">
                        Numerical Answer Required
                      </div>
                    )}
                    <div className='flex flex-col gap-1'>
                      <div className="text-xs text-gray-700 mt-2">
                        Type: {questionTypes.find(t => t.value === question.type)?.label}
                      </div>
                      <div className="text-xs text-gray-700 ">
                        Marks: {" " + question.mark + " Marks"}
                      </div>
                      {question.type === 'mcq' && (
                        <div className="text-xs text-green-600">
                          Correct Answer: {question.correctAnswerMCQ}
                        </div>
                      )}
                      {question.type === 'msq' && (
                        <div className="text-xs text-green-600">
                          Correct Answers: {question.correctAnswerMSQ?.join(', ') || 'None'}
                        </div>
                      )}
                      {question.type === 'nat' && (
                        <div className="text-xs text-green-600">
                          Correct Answer: {question.correctAnswerNAT || 'None'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSaveTest}
            className="flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >

            Save Test
          </button>
        </div>
      </div>
    </div>
  );
}