'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  imageUrl?: string;
  options: { text: string; isCorrect: boolean; _id: string }[];
  correctAnswer: string;
  type: 'MCQ' | 'MSQ' | 'NAT'; // Fixed type definition
  mark: number;
}

interface Test {
  _id: string;
  testTitle: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  department: string;
  duration?: string;
  questions: Question[];
}

export const useTest = (testId: string) => {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/tests/${testId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched test data:', data);
        
        // Normalize question types to uppercase
        const normalizedTest = {
          ...data,
          questions: data.questions.map((q: any) => ({
            ...q,
            type: q.type.toUpperCase() === 'NUMERICAL' ? 'NAT' : q.type.toUpperCase()
          }))
        };
        
        setTest(normalizedTest);

        // Initialize selected options from localStorage
        const initialOptions: { [key: string]: string } = {};
        normalizedTest.questions.forEach((question: Question) => {
          const storedAnswer = localStorage.getItem(`test-${normalizedTest._id}-question-${question._id}`);
          if (storedAnswer) {
            initialOptions[question._id] = storedAnswer;
            console.log(`Loaded from localStorage: ${question._id} = ${storedAnswer}`);
          }
        });
        setSelectedOptions(initialOptions);
        console.log('Initial selected options:', initialOptions);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  // Handle option changes for all question types
  const handleOptionChange = (questionId: string, value: string, optionText: string) => {
    console.log(`Option changed - Question: ${questionId}, Value: ${value}, Text: ${optionText}`);
    
    setSelectedOptions((prev) => {
      const newSelectedOptions = {
        ...prev,
        [questionId]: optionText,
      };
      
      // Save to localStorage only if there's a meaningful answer
      if (optionText && optionText.trim() !== '') {
        localStorage.setItem(`test-${test?._id}-question-${questionId}`, optionText);
        console.log(`Saved to localStorage: test-${test?._id}-question-${questionId} = ${optionText}`);
      } else {
        localStorage.removeItem(`test-${test?._id}-question-${questionId}`);
        console.log(`Removed from localStorage: test-${test?._id}-question-${questionId}`);
      }
      
      console.log('Updated selected options:', newSelectedOptions);
      return newSelectedOptions;
    });
  };

  const submitTest = async () => {
    if (!test || isSubmitting) return;

    setIsSubmitting(true);

    // Debug: Check current state before submission
    console.log('Current selectedOptions before submission:', selectedOptions);

    // Prepare answers - ensure we're getting the actual values
    const answers = test.questions.map((question) => {
      const selectedValue = selectedOptions[question._id];
      
      // Additional check: try to get from localStorage if not in state
      const fallbackValue = localStorage.getItem(`test-${test._id}-question-${question._id}`);
      const finalAnswer = selectedValue || fallbackValue || '';
      
      console.log(`Question ${question._id}:`);
      console.log(`  - From state: "${selectedValue}"`);
      console.log(`  - From localStorage: "${fallbackValue}"`);
      console.log(`  - Final answer: "${finalAnswer}"`);
      
      return {
        questionId: question._id,
        answer: finalAnswer,
      };
    });

    console.log('Final answers array being sent:', answers);

    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        testId: test._id,
        answers,
      };
      
      console.log('Request body being sent:', requestBody);

      const response = await fetch('/api/tests/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Submission response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Store submission result for display
      setSubmissionResult(result);

      // Clear localStorage after successful submission
      test.questions.forEach((question) => {
        localStorage.removeItem(`test-${test._id}-question-${question._id}`);
      });

      setIsSubmitted(true);
      
    } catch (e: any) {
      console.error('Error submitting test:', e);
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    test, 
    loading, 
    error, 
    selectedOptions, 
    handleOptionChange, 
    submitTest, 
    isSubmitted, 
    isSubmitting,
    submissionResult 
  };
};
