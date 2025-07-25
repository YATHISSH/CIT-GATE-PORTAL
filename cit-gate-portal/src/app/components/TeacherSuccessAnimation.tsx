'use client';

import React from 'react';
import styles from './SuccessAnimation.module.css';

const SuccessAnimation = () => {
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
        <p className={styles.successMessage}>Test Scheduled Successfully!</p>
        <p className={styles.instructions}>
          Please close this window.
        </p>
      </div>
    </div>
  );
};

export default SuccessAnimation;