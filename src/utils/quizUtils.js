/**
 * Utility functions for the A220 Quiz React app
 */

/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles an array in place
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Select questions proportionally from each chapter based on their size
 * Each chapter contributes proportionally to the total questions to select
 * @param {Object} quizData - The quiz data object containing quizzes array
 * @param {number} totalToSelect - Total number of questions to select (default: 100)
 * @returns {Array} - Array of selected questions
 */
export const selectProportionalQuestions = (quizData, totalToSelect = 100) => {
  if (!quizData || !quizData.quizzes || quizData.quizzes.length === 0) {
    return [];
  }

  const selectedQuestions = [];
  const totalAvailableQuestions = quizData.quizzes.reduce(
    (sum, quiz) => sum + quiz.questions.length,
    0
  );

  // Calculate proportional distribution
  let remainingToSelect = totalToSelect;
  const questionsPerChapter = [];

  quizData.quizzes.forEach((quiz, index) => {
    const proportion = quiz.questions.length / totalAvailableQuestions;
    let questionsFromChapter;

    if (index === quizData.quizzes.length - 1) {
      // Last chapter gets remaining questions to ensure exact total
      questionsFromChapter = remainingToSelect;
    } else {
      questionsFromChapter = Math.round(proportion * totalToSelect);
    }

    // Ensure we don't select more questions than available in the chapter
    questionsFromChapter = Math.min(
      questionsFromChapter,
      quiz.questions.length
    );

    questionsPerChapter.push({
      quiz,
      count: questionsFromChapter,
    });

    remainingToSelect -= questionsFromChapter;
  });

  // Select questions from each chapter
  questionsPerChapter.forEach(({ quiz, count }) => {
    if (count > 0) {
      const shuffledChapterQuestions = shuffleArray(quiz.questions);
      const selected = shuffledChapterQuestions.slice(0, count);
      selectedQuestions.push(...selected);
    }
  });

  // Shuffle all selected questions together
  return shuffleArray(selectedQuestions);
};

/**
 * Format seconds as MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Calculate percentage score
 * @param {Object} answers - Object mapping question codes to selected answers
 * @param {Array} questions - Array of question objects with correct answers
 * @returns {Object} - Object containing score, correctCount, totalCount, and percentage
 */
export const calculateScore = (answers, questions) => {
  if (!questions || questions.length === 0) {
    return {
      correctCount: 0,
      totalCount: 0,
      percentage: 0,
    };
  }

  let correctCount = 0;

  questions.forEach((question) => {
    const userAnswer = answers[question.code];

    if (!userAnswer) {
      return; // Question not answered
    }

    // Compare user answer with correct answer
    const correctAnswers = question.correct || [];

    if (question.type === 'single') {
      // For single choice, check if the single answer matches
      if (
        userAnswer.length === 1 &&
        correctAnswers.length === 1 &&
        userAnswer[0] === correctAnswers[0]
      ) {
        correctCount++;
      }
    } else if (question.type === 'multiple') {
      // For multiple choice, all selected answers must match exactly
      const userSet = new Set(userAnswer);
      const correctSet = new Set(correctAnswers);

      if (
        userSet.size === correctSet.size &&
        [...userSet].every((answer) => correctSet.has(answer))
      ) {
        correctCount++;
      }
    }
  });

  const totalCount = questions.length;
  const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  return {
    correctCount,
    totalCount,
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
  };
};

/**
 * Extract chapter name from question code
 * Maps question code prefixes to chapter names
 * @param {string} code - Question code (e.g., "02AIR01", "PERF12")
 * @returns {string} - Chapter name
 */
export const getChapterFromCode = (code) => {
  if (!code || typeof code !== 'string') {
    return 'Unknown';
  }

  // Mapping of code prefixes to chapter names
  const chapterMapping = {
    '01GEN': 'General',
    '02AIR': 'Air Conditioning',
    '03AUTO': 'Automatic Flight',
    '04COM': 'Communications',
    '05ELEC': 'Electrical',
    '06EQP': 'Equipment',
    '07ENG': 'Engine',
    '08FUEL': 'Fuel',
    '09HYD': 'Hydraulics',
    '10ICE': 'Ice and Rain Protection',
    '11IND': 'Indication and Warning',
    '12LAND': 'Landing Gear',
    '13NAV': 'Navigation',
    '14OXY': 'Oxygen',
    '15PNEU': 'Pneumatics',
    '16PERF': 'Performance',
    PERF: 'Performance',
    '17FIRE': 'Fire Protection',
    '18FLT': 'Flight Controls',
    '19DOORS': 'Doors',
    '20APU': 'APU',
    '21LIGHT': 'Lighting',
    '22WATER': 'Water and Waste',
  };

  // Check for exact matches first
  for (const [prefix, name] of Object.entries(chapterMapping)) {
    if (code.toUpperCase().startsWith(prefix)) {
      return name;
    }
  }

  // Try to extract chapter from numeric prefix (e.g., "02" from "02AIR01")
  const numericMatch = code.match(/^(\d{2})/);
  if (numericMatch) {
    const chapterNumber = numericMatch[1];
    const chapterWithNumber = Object.keys(chapterMapping).find((key) =>
      key.startsWith(chapterNumber)
    );
    if (chapterWithNumber) {
      return chapterMapping[chapterWithNumber];
    }
  }

  // Try to extract from alphabetic prefix
  const alphaMatch = code.match(/^([A-Z]+)/i);
  if (alphaMatch) {
    const prefix = alphaMatch[1].toUpperCase();
    if (chapterMapping[prefix]) {
      return chapterMapping[prefix];
    }
  }

  return 'Unknown';
};

/**
 * Get all questions from quiz data as a flat array with unique IDs
 * @param {Object} quizData - The quiz data object
 * @returns {Array} - Flat array of all questions with added questionId
 */
export const getAllQuestions = (quizData) => {
  if (!quizData || !quizData.quizzes) return [];

  const allQuestions = [];
  quizData.quizzes.forEach((quiz, quizIndex) => {
    quiz.questions.forEach((question, qIndex) => {
      allQuestions.push({
        ...question,
        questionId: `${quiz.name}-${qIndex}`,
        chapter: quiz.name
      });
    });
  });
  return allQuestions;
};

/**
 * Generate multiple quiz sets that cover all questions
 * Each quiz has questionsPerQuiz questions, and together they cover all available questions
 * @param {Object} quizData - The quiz data object
 * @param {number} questionsPerQuiz - Number of questions per quiz (default: 100)
 * @param {string} seed - Optional seed for consistent shuffling
 * @returns {Array} - Array of quiz set objects
 */
export const generateQuizSets = (quizData, questionsPerQuiz = 100) => {
  const allQuestions = getAllQuestions(quizData);
  const totalQuestions = allQuestions.length;

  // Calculate number of quizzes needed
  const numQuizzes = Math.ceil(totalQuestions / questionsPerQuiz);

  // Shuffle all questions
  const shuffledQuestions = shuffleArray(allQuestions);

  // Create quiz sets
  const quizSets = [];
  for (let i = 0; i < numQuizzes; i++) {
    const startIdx = i * questionsPerQuiz;
    const endIdx = Math.min(startIdx + questionsPerQuiz, totalQuestions);
    let quizQuestions = shuffledQuestions.slice(startIdx, endIdx);

    // If this is the last quiz and has fewer questions, pad with questions from earlier
    if (quizQuestions.length < questionsPerQuiz && i > 0) {
      const needed = questionsPerQuiz - quizQuestions.length;
      const padding = shuffleArray(shuffledQuestions.slice(0, startIdx)).slice(0, needed);
      quizQuestions = [...quizQuestions, ...padding];
    }

    quizSets.push({
      id: i + 1,
      name: `Quiz ${i + 1}`,
      description: i === numQuizzes - 1 && endIdx - startIdx < questionsPerQuiz
        ? `${endIdx - startIdx} unique questions + ${questionsPerQuiz - (endIdx - startIdx)} review`
        : `${quizQuestions.length} questions`,
      questions: shuffleArray(quizQuestions),
      uniqueCount: Math.min(endIdx - startIdx, questionsPerQuiz),
      isLastQuiz: i === numQuizzes - 1
    });
  }

  return quizSets;
};

/**
 * Generate quiz sets with seeded randomization (consistent across sessions)
 * Uses a simple seeded random number generator for reproducible shuffles
 * @param {Object} quizData - The quiz data object
 * @param {number} questionsPerQuiz - Number of questions per quiz
 * @param {number} seed - Seed for random number generator
 * @returns {Array} - Array of quiz set objects
 */
export const generateSeededQuizSets = (quizData, questionsPerQuiz = 100, seed = 12345) => {
  const allQuestions = getAllQuestions(quizData);
  const totalQuestions = allQuestions.length;

  // Seeded random number generator
  const seededRandom = (s) => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  // Seeded shuffle
  const seededShuffle = (array, s) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(s + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Calculate number of quizzes needed
  const numQuizzes = Math.ceil(totalQuestions / questionsPerQuiz);

  // Shuffle all questions with seed
  const shuffledQuestions = seededShuffle(allQuestions, seed);

  // Create quiz sets
  const quizSets = [];
  for (let i = 0; i < numQuizzes; i++) {
    const startIdx = i * questionsPerQuiz;
    const endIdx = Math.min(startIdx + questionsPerQuiz, totalQuestions);
    let quizQuestions = shuffledQuestions.slice(startIdx, endIdx);

    // If this is the last quiz and has fewer questions, pad with questions from earlier
    if (quizQuestions.length < questionsPerQuiz && i > 0) {
      const needed = questionsPerQuiz - quizQuestions.length;
      const padding = seededShuffle(shuffledQuestions.slice(0, startIdx), seed + i * 1000).slice(0, needed);
      quizQuestions = [...quizQuestions, ...padding];
    }

    // Shuffle questions within each quiz
    quizQuestions = seededShuffle(quizQuestions, seed + i * 100);

    quizSets.push({
      id: i + 1,
      name: `Quiz ${i + 1}`,
      description: i === numQuizzes - 1 && endIdx - startIdx < questionsPerQuiz
        ? `${endIdx - startIdx} unique + ${questionsPerQuiz - (endIdx - startIdx)} review`
        : `${quizQuestions.length} questions`,
      questions: quizQuestions,
      uniqueCount: Math.min(endIdx - startIdx, questionsPerQuiz),
      isLastQuiz: i === numQuizzes - 1,
      coveredRange: `Questions ${startIdx + 1}-${endIdx}`
    });
  }

  return quizSets;
};
