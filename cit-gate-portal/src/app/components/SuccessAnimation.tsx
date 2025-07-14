'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SuccessAnimation.module.css';
const SuccessAnimation = () => {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/student/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.successAnimation}>
        <svg
          className={styles.checkmark}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            className={styles.checkmarkCircle}
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className={styles.checkmarkCheck}
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>

        <p className={styles.successMessage}>Test Submitted Successfully!</p>
       <p className={styles.redirectMessage}> 
  You will be automatically redirected to <span style={{ color: '#007bff', fontStyle: 'normal' }}>Dashboard</span> in 5 seconds...
</p>
      </div>
    </div>
  );
};

export default SuccessAnimation;