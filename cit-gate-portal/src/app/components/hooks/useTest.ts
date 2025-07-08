'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  imageUrl?: string;
  options: { text: string; isCorrect: boolean; _id: string }[];
  correctAnswer: string;
  type: 'MCQ' | 'MSQ' | 'NAT';
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
        console.log('Fetched test data:', data); // Add this line for debugging
        setTest(data);

        const initialOptions: { [key: string]: string } = {};
        data.questions.forEach((question: Question) => {
          const storedAnswerText = localStorage.getItem(`test-${data._id}-question-${question._id}`);
          // Find the option text based on the stored value (which is now the text itself)
          initialOptions[question._id] = storedAnswerText || '';
        });
        setSelectedOptions(initialOptions);
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

  // Handles option changes for all question types
  const handleOptionChange = (questionId: string, value: string, optionText: string) => {
    setSelectedOptions((prev) => {
      // For MSQ, the value/optionText is a comma-separated string of selected option texts
      // For MCQ/NAT, it's the single selected option text/value
      const newSelectedOptions = {
        ...prev,
        [questionId]: optionText, // Store the option text(s)
      };
      localStorage.setItem(`test-${test?._id}-question-${questionId}`, optionText); // Store option text(s)
      return newSelectedOptions;
    });
  };

  const submitTest = async () => {
    if (!test || isSubmitting) return;

    setIsSubmitting(true);

    const answers = Object.keys(selectedOptions).map((questionId) => ({
      questionId,
      answer: selectedOptions[questionId],
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tests/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: test._id,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      test.questions.forEach((question) => {
        localStorage.removeItem(`test-${test._id}-question-${question._id}`);
      });

      setIsSubmitted(true);
    } catch (e: any) {
      setError(e.message);
      alert(`Error submitting test: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { test, loading, error, selectedOptions, handleOptionChange, submitTest, isSubmitted, isSubmitting };
};