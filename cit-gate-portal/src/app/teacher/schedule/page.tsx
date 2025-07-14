'use client'
import { useState, useCallback, useEffect } from 'react';
import SuccessAnimation from '@/app/components/TeacherSuccessAnimation';
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
  "CSE - Computer Science and Engineering",
  "IT - Information Technology",
  "ECE - Electronics and Communication Engineering",
  "EEE - Electrical and Electronics Engineering",
  "MECH - Mechanical Engineering",
  "CIVIL - Civil Engineering",
  "BME - Biomedical Engineering",
  "MCT - Mechatronics Engineering",
  "AIML - Computer Science and Engineering (AI & ML)",
  "CS - Computer Science and Engineering (Cyber Security)",
  "AIDS - Artificial Intelligence and Data Science",
  "CSBS - Computer Science and Business Systems",
  "ECE-ACT - Electronics and Communication Engineering (Advanced Communication Technology)",
  "VLSI - Electronics Engineering (VLSI Design & Technology)"
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
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const router = useRouter();

    // ... (keeping all your existing logic functions)
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
    
                setShowSuccessAnimation(true);
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

    if (showSuccessAnimation) {
        return <SuccessAnimation />;
    }

    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .test-creator-container {
                    min-height: 100vh;
                    background: #0f172a;
                    background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0));
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    position: relative;
                    overflow: hidden;
                    padding: 2rem 1rem;
                }

                .animated-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0));
                    animation: pulse-bg 4s ease-in-out infinite;
                }

                @keyframes pulse-bg {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }

                .test-creator-content {
                    position: relative;
                    z-index: 10;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .success-popup {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3);
                    z-index: 50;
                    animation: slideUp 0.5s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }

                .main-card {
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    margin-bottom: 2rem;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .card-header {
                    padding: 2rem;
                    border-bottom: 1px solid rgba(51, 65, 85, 0.6);
                    background: rgba(51, 65, 85, 0.3);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: white;
                    text-align: center;
                    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .card-content {
                    padding: 2rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #e2e8f0;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-label.required::after {
                    content: ' *';
                    color: #ef4444;
                }

                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(51, 65, 85, 0.5);
                    border: 2px solid #475569;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .form-select {
                    appearance: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 12px center;
                    background-repeat: no-repeat;
                    background-size: 16px;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
                    background: rgba(51, 65, 85, 0.8);
                }

                .form-input::placeholder, .form-textarea::placeholder {
                    color: #64748b;
                    font-weight: 400;
                }

                .form-select option {
                    background: #334155;
                    color: white;
                    padding: 12px;
                }

                .error-message {
                    color: #fca5a5;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                }

                .error-icon {
                    width: 16px;
                    height: 16px;
                    margin-right: 6px;
                }

                .total-marks-display {
                    background: rgba(59, 130, 246, 0.2);
                    border: 2px solid rgba(59, 130, 246, 0.3);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: #60a5fa;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .questions-section {
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    margin-bottom: 2rem;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                .questions-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(51, 65, 85, 0.6);
                    background: rgba(51, 65, 85, 0.3);
                }

                .questions-title {
                    display: flex;
                    align-items: center;
                    justify-content: between;
                    margin-bottom: 1rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }

                .question-counter {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .preview-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border-radius: 12px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .preview-button:hover {
                    background: rgba(59, 130, 246, 0.3);
                    transform: translateY(-2px);
                }

                .question-navigation {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 1rem;
                }

                .question-nav-button {
                    padding: 10px 16px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .question-nav-button.active {
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                    color: white;
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                }

                .question-nav-button.valid {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .question-nav-button.invalid {
                    background: rgba(51, 65, 85, 0.5);
                    color: #94a3b8;
                    border: 1px solid #475569;
                }

                .question-nav-button:hover {
                    transform: translateY(-2px);
                }

                .question-editor {
                    padding: 2rem;
                }

                .image-upload-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .upload-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: rgba(51, 65, 85, 0.5);
                    color: #e2e8f0;
                    border: 2px solid #475569;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .upload-button:hover {
                    background: rgba(51, 65, 85, 0.8);
                    border-color: #3b82f6;
                    color: #60a5fa;
                }

                .remove-image-button {
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .remove-image-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
                }

                .image-preview {
                    margin-top: 1rem;
                    border-radius: 12px;
                    border: 2px solid rgba(51, 65, 85, 0.6);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    height: auto;
                }

                .options-section {
                    margin-top: 2rem;
                }

                .option-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .option-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    font-weight: 700;
                    border-radius: 10px;
                    margin-right: 12px;
                    font-size: 0.875rem;
                }

                .option-input {
                    flex: 1;
                    padding: 12px 16px;
                    background: rgba(51, 65, 85, 0.5);
                    border: 2px solid #475569;
                    border-radius: 10px;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                }

                .option-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }

                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .checkbox-option {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: rgba(51, 65, 85, 0.5);
                    border: 2px solid #475569;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .checkbox-option:hover {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.1);
                }

                .checkbox-option input {
                    width: 18px;
                    height: 18px;
                    accent-color: #3b82f6;
                }

                .checkbox-option label {
                    color: #e2e8f0;
                    font-weight: 600;
                    cursor: pointer;
                }

                .navigation-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.6);
                }

                .nav-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                }

                .nav-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
                }

                .nav-button:disabled {
                    background: #475569;
                    cursor: not-allowed;
                    box-shadow: none;
                    opacity: 0.5;
                }

                .error-display {
                    color: #fca5a5;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    padding: 12px 16px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                }

                .preview-section {
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    margin-bottom: 2rem;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                .preview-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(51, 65, 85, 0.6);
                    background: rgba(51, 65, 85, 0.3);
                }

                .preview-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                }

                .preview-content {
                    padding: 2rem;
                }

                .test-info {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: rgba(51, 65, 85, 0.3);
                    border-radius: 16px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }

                .info-item {
                    color: #94a3b8;
                    margin-bottom: 8px;
                    font-size: 0.875rem;
                }

                .info-value {
                    color: white;
                    font-weight: 600;
                }

                .preview-questions {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .preview-question {
                    padding: 1.5rem;
                    background: rgba(51, 65, 85, 0.3);
                    border-radius: 16px;
                    border-left: 4px solid #3b82f6;
                }

                .question-text {
                    font-weight: 600;
                    color: white;
                    margin-bottom: 1rem;
                    line-height: 1.6;
                }

                .question-options {
                    margin-left: 1rem;
                    margin-bottom: 1rem;
                }

                .option-text {
                    color: #cbd5e1;
                    margin-bottom: 4px;
                    font-size: 0.875rem;
                }

                .question-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.6);
                }

                .meta-item {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .correct-answer {
                    color: #4ade80;
                }

                .save-section {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }

                .save-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 32px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.3);
                }

                .save-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 20px 40px rgba(34, 197, 94, 0.4);
                }

                .save-icon {
                    width: 20px;
                    height: 20px;
                }

                @media (max-width: 768px) {
                    .test-creator-container {
                        padding: 1rem;
                    }
                    
                    .page-title {
                        font-size: 2rem;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .navigation-buttons {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .nav-button {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .checkbox-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="test-creator-container">
                <div className="animated-background"></div>
                
                <div className="test-creator-content">
                    {/* Success Popup */}
                    {showPopup && (
                        <div className="success-popup">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Test saved successfully! Redirecting...
                            </div>
                        </div>
                    )}

                    {/* Main Information Card */}
                    <div className="main-card">
                        <div className="card-header">
                           <h1
  className="text-4xl font-extrabold tracking-wide text-center mt-6 mb-4"
  style={{ fontFamily: "Verdana" }}
>
  Schedule New Test
</h1>

                        </div>

                        <div className="card-content">
                            <div className="form-grid">
                                {/* Department */}
                                <div className="form-group">
                                    <label className="form-label required">Department</label>
                                    <select
                                        value={testForm.department}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, department: e.target.value }));
                                            validateErrorMessage('department', e.target.value ? '' : 'Department is required');
                                        }}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    {validationErrors.department && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.department}
                                        </div>
                                    )}
                                </div>

                                {/* Test Title */}
                                <div className="form-group">
                                    <label className="form-label required">Test Title</label>
                                    <input
                                        type="text"
                                        value={testForm.testTitle}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, testTitle: e.target.value }));
                                            validateErrorMessage('testTitle', e.target.value ? '' : 'Test Title is required');
                                        }}
                                        className="form-input"
                                        placeholder="Eg: CSE GATE 2025 Set A"
                                        required
                                    />
                                    {validationErrors.testTitle && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.testTitle}
                                        </div>
                                    )}
                                </div>

                                {/* Subject Name */}
                                <div className="form-group">
                                    <label className="form-label required">Subject Name</label>
                                    <input
                                        type="text"
                                        value={testForm.subjectName}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, subjectName: e.target.value }));
                                            validateErrorMessage('subjectName', e.target.value ? '' : 'Subject Name is required');
                                        }}
                                        className="form-input"
                                        placeholder="Eg: Data Structures"
                                        required
                                    />
                                    {validationErrors.subjectName && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.subjectName}
                                        </div>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="form-group">
                                    <label className="form-label required">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={testForm.duration || ""}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, duration: Number(e.target.value) }))
                                            validateErrorMessage('duration', e.target.value ? '' : 'Duration is required');
                                        }}
                                        className="form-input"
                                        placeholder="Eg: 60"
                                        required
                                    />
                                    {validationErrors.duration && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.duration}
                                        </div>
                                    )}
                                </div>

                                {/* Start Time */}
                                <div className="form-group">
                                    <label className="form-label required">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={testForm.startTime}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, startTime: e.target.value }))
                                            validateErrorMessage('startTime', e.target.value ? '' : 'Start Time is required');
                                        }}
                                        className="form-input"
                                        required
                                    />
                                    {validationErrors.startTime && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.startTime}
                                        </div>
                                    )}
                                </div>

                                {/* End Time */}
                                <div className="form-group">
                                    <label className="form-label required">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={testForm.endTime}
                                        onChange={(e) => {
                                            setTestForm(prev => ({ ...prev, endTime: e.target.value }));
                                            validateErrorMessage('endTime', e.target.value ? '' : 'End Time is required');
                                        }}
                                        className="form-input"
                                        required
                                    />
                                    {validationErrors.endTime && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.endTime}
                                        </div>
                                    )}
                                </div>

                                {/* Number of Questions */}
                                <div className="form-group">
                                    <label className="form-label required">Number of Questions</label>
                                    <select
                                        value={testForm.numberOfQuestions || ""}
                                        onChange={(e) => {
                                            handleNumberOfQuestionsChange(parseInt(e.target.value))
                                            validateErrorMessage("numberOfQuestions", Number(e.target.value) > 0 ? "" : "Question must be atleast 1.")
                                        }}
                                        className="form-select"
                                        required
                                    >
                                        {Array.from({ length: 100 }, (_, i) => i).map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                    {validationErrors.numberOfQuestions && (
                                        <div className="error-message">
                                            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {validationErrors.numberOfQuestions}
                                        </div>
                                    )}
                                </div>

                                {/* Total Marks */}
                                <div className="form-group">
                                    <label className="form-label">Total Marks</label>
                                    <div className="total-marks-display">
                                        {getTotalQuestions()} Marks
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    {testForm.questions.length > 0 && (
                        <div className="questions-section">
                            <div className="questions-header">
                                <div className="questions-title">
                                    <h2 className="section-title">Questions</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span className="question-counter">
                                            Question {currentQuestionIndex + 1} of {testForm.numberOfQuestions}
                                        </span>
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="preview-button"
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                                        </button>
                                    </div>
                                </div>

                                {/* Question Navigation */}
                                <div className="question-navigation">
                                    {testForm.questions.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={`question-nav-button ${
                                                currentQuestionIndex === index
                                                    ? 'active'
                                                    : validateQuestions(index) === true
                                                        ? 'valid'
                                                        : 'invalid'
                                            }`}
                                        >
                                            Q{index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Editor */}
                            {currentQuestion && (
                                <div className="question-editor">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Question Text */}
                                        <div className="form-group">
                                            <label className="form-label required">
                                                Question {currentQuestionIndex + 1}
                                            </label>
                                            <textarea
                                                value={currentQuestion.questionText}
                                                onChange={(e) => updateQuestion(currentQuestionIndex, 'questionText', e.target.value)}
                                                className="form-textarea"
                                                placeholder="Enter your question here..."
                                                required
                                            />
                                        </div>

                                        <div className="form-grid">
                                            {/* Question Type */}
                                            <div className="form-group">
                                                <label className="form-label required">Question Type</label>
                                                <select
                                                    value={currentQuestion.type}
                                                    onChange={(e) => updateQuestion(currentQuestionIndex, 'type', e.target.value)}
                                                    className="form-select"
                                                >
                                                    {questionTypes.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Marks */}
                                            <div className="form-group">
                                                <label className="form-label required">Marks Allotted</label>
                                                <input
                                                    type="number"
                                                    value={currentQuestion.mark || ''}
                                                    onChange={(e) => updateQuestion(currentQuestionIndex, 'mark', e.target.value)}
                                                    className="form-input"
                                                    placeholder="Enter marks"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="form-group">
                                            <label className="form-label">Question Image (Optional)</label>
                                            <div className="image-upload-section">
                                                <label className="upload-button">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Upload Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(file, currentQuestionIndex);
                                                        }}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                                {currentQuestion.imagePreview && (
                                                    <button
                                                        onClick={() => removeQuestionImage(currentQuestionIndex)}
                                                        className="remove-image-button"
                                                    >
                                                        Remove Image
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        {currentQuestion.imagePreview && (
                                            <div>
                                                <img
                                                    src={currentQuestion.imagePreview}
                                                    alt="Question"
                                                    className="image-preview"
                                                />
                                            </div>
                                        )}

                                        {/* Options (MCQ/MSQ) */}
                                        {(currentQuestion.type === 'mcq' || currentQuestion.type === 'msq') && (
                                            <div className="options-section">
                                                <label className="form-label required">Answer Options</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {currentQuestion.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="option-row">
                                                            <div className="option-label">
                                                                {String.fromCharCode(65 + optionIndex)}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => updateQuestionOption(currentQuestionIndex, optionIndex, e.target.value)}
                                                                className="option-input"
                                                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Correct Answer - MCQ */}
                                        {currentQuestion.type === "mcq" && (
                                            <div className="form-group">
                                                <label className="form-label required">Correct Answer</label>
                                                <select
                                                    value={currentQuestion.correctAnswerMCQ || ''}
                                                    onChange={(e) => updateQuestion(currentQuestionIndex, 'correctAnswerMCQ', e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="">Select Correct Option</option>
                                                    {mcqOptions.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            Option {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Correct Answer - MSQ */}
                                        {currentQuestion.type === "msq" && (
                                            <div className="form-group">
                                                <label className="form-label required">Correct Answers (Multiple)</label>
                                                <div className="checkbox-grid">
                                                    {mcqOptions.map((option) => (
                                                        <div key={option.value} className="checkbox-option">
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
                                                            />
                                                            <label>{option.label}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Correct Answer - NAT */}
                                        {currentQuestion.type === "nat" && (
                                            <div className="form-group">
                                                <label className="form-label required">Correct Answer</label>
                                                <input
                                                    type="text"
                                                    value={currentQuestion.correctAnswerNAT || ''}
                                                    onChange={(e) => updateQuestion(currentQuestionIndex, 'correctAnswerNAT', e.target.value)}
                                                    className="form-input"
                                                    placeholder="Enter correct numerical answer"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="navigation-buttons">
                                        <button
                                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                            disabled={currentQuestionIndex === 0}
                                            className="nav-button"
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous Question
                                        </button>

                                        <button
                                            onClick={() => setCurrentQuestionIndex(Math.min(testForm.questions.length - 1, currentQuestionIndex + 1))}
                                            disabled={currentQuestionIndex === testForm.questions.length - 1}
                                            className="nav-button"
                                        >
                                            Next Question
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {formError.length > 0 && (
                                        <div className="error-display">{formError}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Section */}
                    {showPreview && testForm.questions.length > 0 && (
                        <div className="preview-section">
                            <div className="preview-header">
                                <h3 className="preview-title">Test Preview</h3>
                            </div>
                            <div className="preview-content">
                                <div className="test-info">
                                    <div className="info-item">Test Title: <span className="info-value">{testForm.testTitle}</span></div>
                                    <div className="info-item">Subject: <span className="info-value">{testForm.subjectName}</span></div>
                                    <div className="info-item">Department: <span className="info-value">{testForm.department}</span></div>
                                    <div className="info-item">Total Marks: <span className="info-value">{testForm.totalMarks}</span></div>
                                    <div className="info-item">Duration: <span className="info-value">{testForm.duration} minutes</span></div>
                                </div>

                                <div className="preview-questions">
                                    {testForm.questions.map((question, index) => (
                                        <div key={index} className="preview-question">
                                            <div className="question-text">
                                                Q{index + 1}. {question.questionText || 'Question not entered yet'}
                                            </div>
                                            {question.imagePreview && (
                                                <img
                                                    src={question.imagePreview}
                                                    alt={`Question ${index + 1}`}
                                                    style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px', margin: '1rem 0' }}
                                                />
                                            )}
                                            {(question.type === 'mcq' || question.type === 'msq') && (
                                                <div className="question-options">
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="option-text">
                                                            {String.fromCharCode(65 + optIndex)}. {option || 'Option not entered'}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {question.type === 'nat' && (
                                                <div style={{ marginLeft: '1rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                                    Numerical Answer Required
                                                </div>
                                            )}
                                            <div className="question-meta">
                                                <div className="meta-item">
                                                    Type: {questionTypes.find(t => t.value === question.type)?.label}
                                                </div>
                                                <div className="meta-item">
                                                    Marks: {question.mark} Marks
                                                </div>
                                                {question.type === 'mcq' && (
                                                    <div className="meta-item correct-answer">
                                                        Correct Answer: {question.correctAnswerMCQ}
                                                    </div>
                                                )}
                                                {question.type === 'msq' && (
                                                    <div className="meta-item correct-answer">
                                                        Correct Answers: {question.correctAnswerMSQ?.join(', ') || 'None'}
                                                    </div>
                                                )}
                                                {question.type === 'nat' && (
                                                    <div className="meta-item correct-answer">
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
                    <div className="save-section">
                        <button
                            onClick={handleSaveTest}
                            className="save-button"
                        >
                            <svg className="save-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Save Test
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
