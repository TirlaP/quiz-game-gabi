import { useState, useEffect, useCallback, useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import quizData from './data/quizData.json'
import explanationsData from './data/explanations.json'
import pageReferencesData from './data/page_references.json'
import StartScreen from './components/StartScreen'
import Question from './components/Question'
import Timer from './components/Timer'
import Results from './components/Results'
import ReviewScreen from './components/ReviewScreen'
import QuestionNav from './components/QuestionNav'
import QuizSelection, { COMPLETED_QUIZZES_KEY, QUIZ_SCORES_KEY, CHAPTER_PROGRESS_KEY } from './components/QuizSelection'
import { selectProportionalQuestions, shuffleArray, generateSeededQuizSets } from './utils/quizUtils'

// Get explanation for a question by code
const getExplanation = (questionCode) => {
  if (!explanationsData || !explanationsData.explanations) return null
  return explanationsData.explanations[questionCode] || null
}

// Get actual PDF page references for a question by code
// Falls back to chapter start page if no specific reference exists
const getPageReferences = (questionCode) => {
  if (!pageReferencesData) return null

  // Try specific question reference first
  if (pageReferencesData.references && pageReferencesData.references[questionCode]) {
    return pageReferencesData.references[questionCode]
  }

  // Fall back to chapter start page
  if (pageReferencesData._meta?.chapters && questionCode) {
    const chapterCode = questionCode.substring(0, 5) // e.g., "02AIR" from "02AIR01"
    const chapter = pageReferencesData._meta.chapters[chapterCode]
    if (chapter) {
      return {
        pages: [{
          pdf: "FCOM1",
          page: chapter.startPage,
          note: `${chapter.name} chapter start`
        }]
      }
    }
  }

  return null
}

const STORAGE_KEY = 'a220_quiz_progress'

// Helper to save state to localStorage
const saveProgress = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      savedAt: Date.now()
    }))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

// Helper to load state from localStorage
const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if saved less than 3 hours ago
      if (parsed.savedAt && Date.now() - parsed.savedAt < 3 * 60 * 60 * 1000) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load progress:', e)
  }
  return null
}

// Helper to clear progress
const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear progress:', e)
  }
}

// Helper to save completed quiz
const saveCompletedQuiz = (quizId, score) => {
  try {
    // Save to completed list
    const completed = JSON.parse(localStorage.getItem(COMPLETED_QUIZZES_KEY) || '[]')
    if (!completed.includes(quizId)) {
      completed.push(quizId)
      localStorage.setItem(COMPLETED_QUIZZES_KEY, JSON.stringify(completed))
    }

    // Save score (update if better)
    const scores = JSON.parse(localStorage.getItem(QUIZ_SCORES_KEY) || '{}')
    if (!scores[quizId] || score > scores[quizId]) {
      scores[quizId] = score
      localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(scores))
    }
  } catch (e) {
    console.error('Failed to save completed quiz:', e)
  }
}

// Helper to save chapter practice progress
const saveChapterProgress = (chapterName, score) => {
  try {
    const chapterKey = chapterName.toLowerCase().replace(/\s+/g, '-')
    const progress = JSON.parse(localStorage.getItem(CHAPTER_PROGRESS_KEY) || '{}')

    if (!progress[chapterKey] || score > progress[chapterKey].bestScore) {
      progress[chapterKey] = {
        bestScore: score,
        lastAttempt: Date.now()
      }
      localStorage.setItem(CHAPTER_PROGRESS_KEY, JSON.stringify(progress))
    }
  } catch (e) {
    console.error('Failed to save chapter progress:', e)
  }
}

function QuizScreen({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedAnswers,
  setSelectedAnswers,
  timeRemaining,
  showResult,
  setShowResult,
  questionResults,
  setQuestionResults,
  onFinish,
  onTimeUp,
  onExit,
  quizName
}) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswers = selectedAnswers[currentQuestionIndex] || []

  // Count answered questions (questions that have at least one answer selected)
  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).filter(key =>
      selectedAnswers[key] && selectedAnswers[key].length > 0
    ).length
  }, [selectedAnswers])

  const unansweredCount = questions.length - answeredCount

  const handleAnswerSelect = useCallback((letter) => {
    if (showResult) return

    const currentQ = questions[currentQuestionIndex]
    const currAnswers = selectedAnswers[currentQuestionIndex] || []

    let newAnswers
    if (currentQ.type === 'multiple') {
      if (currAnswers.includes(letter)) {
        newAnswers = currAnswers.filter(a => a !== letter)
      } else {
        newAnswers = [...currAnswers, letter]
      }
    } else {
      newAnswers = [letter]
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: newAnswers
    }))

    // Auto-confirm for single select questions
    if (currentQ.type !== 'multiple') {
      setShowResult(true)
    }
  }, [currentQuestionIndex, questions, selectedAnswers, showResult, setSelectedAnswers, setShowResult])

  const handleConfirmAnswer = useCallback(() => {
    setShowResult(true)
  }, [setShowResult])

  const handleNextQuestion = useCallback(() => {
    const currQ = questions[currentQuestionIndex]
    const answers = selectedAnswers[currentQuestionIndex] || []
    const correct = currQ.correct || []

    const isCorrect =
      answers.length === correct.length &&
      answers.every(a => correct.includes(a)) &&
      correct.every(c => answers.includes(c))

    setQuestionResults(prev => [...prev, {
      question: currQ,
      selectedAnswers: answers,
      isCorrect,
      chapter: currQ.chapter || 'Unknown'
    }])

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowResult(false)
    } else {
      // Check if there are unanswered questions before finishing
      // unansweredCount - 1 because current question is now answered
      if (unansweredCount > 1) {
        setShowFinishConfirm(true)
      } else {
        onFinish()
      }
    }
  }, [currentQuestionIndex, questions, selectedAnswers, setQuestionResults, setCurrentQuestionIndex, setShowResult, onFinish, unansweredCount])

  const handleConfirmFinish = useCallback(() => {
    setShowFinishConfirm(false)
    onFinish()
  }, [onFinish])

  const handleCancelFinish = useCallback(() => {
    setShowFinishConfirm(false)
  }, [])

  const handleQuestionSelect = useCallback((index) => {
    // Allow navigation to any question at any time
    // User's answer selections are preserved in selectedAnswers state
    if (index !== currentQuestionIndex) {
      setCurrentQuestionIndex(index)
      setShowResult(false)
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex, setShowResult])

  if (!currentQuestion) return null

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full min-h-0">
        {/* Header with Timer and Progress - Compact */}
        <div className="card mb-3 py-2">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Exit Button */}
              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Exit Quiz"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              <Timer timeRemaining={timeRemaining} onTimeUp={onTimeUp} />
              {quizName && (
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold hidden sm:inline">
                  {quizName}
                </span>
              )}
            </div>

            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Q{currentQuestionIndex + 1}/{questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="progress-bar h-2">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Flex 1 to fill remaining space */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Question Navigation (hidden on mobile by default) */}
          <div className="lg:w-72 flex-shrink-0 order-2 lg:order-1 hidden lg:block overflow-auto">
            <QuestionNav
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              selectedAnswers={selectedAnswers}
              questionResults={questionResults}
              showResult={showResult}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>

          {/* Right Content - Question and Actions */}
          <div className="flex-1 order-1 lg:order-2 flex flex-col min-h-0">
            {/* Question - Scrollable */}
            <div className="flex-1 min-h-0 overflow-auto">
              <Question
                question={currentQuestion}
                selectedAnswers={currentAnswers}
                onAnswerSelect={handleAnswerSelect}
                showResult={showResult}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                explanation={getExplanation(currentQuestion.code)}
                pageReferences={getPageReferences(currentQuestion.code)}
              />
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="mt-3 flex justify-between items-center flex-shrink-0">
              <div className="text-sm text-gray-400">
                {currentQuestion.type === 'multiple' && (
                  <span className="flex items-center gap-2 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Select all that apply
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {!showResult ? (
                  // Only show Check Answer button for multi-select questions
                  currentQuestion.type === 'multiple' && (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={currentAnswers.length === 0}
                      className="btn-primary"
                    >
                      Check Answer
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="btn-success"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Unanswered Questions</h3>
            </div>
            <p className="text-gray-300 mb-6">
              You have <span className="text-amber-400 font-bold">{unansweredCount - 1}</span> unanswered question{unansweredCount - 1 !== 1 ? 's' : ''}.
              Unanswered questions will be marked as incorrect.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelFinish}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmFinish}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                Finish Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Exit Quiz?</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to exit? Your progress will be saved and you can continue later.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false)
                  onExit && onExit()
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold transition-colors"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Check for saved progress on mount
  const savedProgress = loadProgress()
  const hasValidProgress = savedProgress && savedProgress.questions && savedProgress.questions.length > 0

  const [questions, setQuestions] = useState(hasValidProgress ? savedProgress.questions : [])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(hasValidProgress ? savedProgress.currentQuestionIndex : 0)
  const [selectedAnswers, setSelectedAnswers] = useState(hasValidProgress ? savedProgress.selectedAnswers : {})
  const [timeRemaining, setTimeRemaining] = useState(hasValidProgress ? savedProgress.timeRemaining : quizData.timeLimit * 60)
  const [startTime, setStartTime] = useState(hasValidProgress ? savedProgress.startTime : null)
  const [endTime, setEndTime] = useState(null)
  const [showResult, setShowResult] = useState(hasValidProgress ? savedProgress.showResult : false)
  const [questionResults, setQuestionResults] = useState(hasValidProgress ? savedProgress.questionResults : [])
  const [currentQuizId, setCurrentQuizId] = useState(hasValidProgress ? savedProgress.currentQuizId : null)
  const [currentQuizName, setCurrentQuizName] = useState(hasValidProgress ? savedProgress.currentQuizName : null)
  const [isChapterPractice, setIsChapterPractice] = useState(hasValidProgress ? savedProgress.isChapterPractice : false)
  const [currentChapterName, setCurrentChapterName] = useState(hasValidProgress ? savedProgress.currentChapterName : null)

  // Redirect to quiz if there's saved progress
  useEffect(() => {
    if (hasValidProgress && location.pathname === '/') {
      navigate('/quiz')
    }
  }, [])

  // Save progress whenever state changes during quiz
  useEffect(() => {
    if (location.pathname === '/quiz' && questions.length > 0) {
      saveProgress({
        questions,
        currentQuestionIndex,
        selectedAnswers,
        timeRemaining,
        startTime,
        showResult,
        questionResults,
        currentQuizId,
        currentQuizName,
        isChapterPractice,
        currentChapterName
      })
    }
  }, [questions, currentQuestionIndex, selectedAnswers, timeRemaining, showResult, questionResults, location.pathname, currentQuizId, currentQuizName, isChapterPractice, currentChapterName])

  // Timer effect
  useEffect(() => {
    let timer
    if (location.pathname === '/quiz' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [location.pathname, timeRemaining])

  // Start a random quiz (100 proportional questions)
  const handleStartRandom = useCallback(() => {
    clearProgress()
    const selected = selectProportionalQuestions(quizData, 100)
    const shuffled = shuffleArray(selected)
    setQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(quizData.timeLimit * 60)
    setStartTime(Date.now())
    setShowResult(false)
    setQuestionResults([])
    setEndTime(null)
    setCurrentQuizId(null)
    setCurrentQuizName('Random Quiz')
    setIsChapterPractice(false)
    setCurrentChapterName(null)
    navigate('/quiz')
  }, [navigate])

  // Start a specific quiz
  const handleSelectQuiz = useCallback((quiz) => {
    clearProgress()
    setQuestions(shuffleArray([...quiz.questions]))
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(quizData.timeLimit * 60)
    setStartTime(Date.now())
    setShowResult(false)
    setQuestionResults([])
    setEndTime(null)
    setCurrentQuizId(quiz.id)
    setCurrentQuizName(quiz.name)
    setIsChapterPractice(false)
    setCurrentChapterName(null)
    navigate('/quiz')
  }, [navigate])

  // Practice a specific chapter
  const handlePracticeChapter = useCallback((chapter) => {
    clearProgress()
    // Get all questions from this chapter
    const chapterQuestions = shuffleArray([...chapter.questions])
    setQuestions(chapterQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    // No time limit for chapter practice - set to 3 hours
    setTimeRemaining(180 * 60)
    setStartTime(Date.now())
    setShowResult(false)
    setQuestionResults([])
    setEndTime(null)
    setCurrentQuizId(null)
    setCurrentQuizName(`${chapter.name} Practice`)
    setIsChapterPractice(true)
    setCurrentChapterName(chapter.name)
    navigate('/quiz')
  }, [navigate])

  const finishQuiz = useCallback(() => {
    setEndTime(Date.now())
    clearProgress()

    // Calculate final results for any unanswered questions
    const finalResults = [...questionResults]
    for (let i = questionResults.length; i < questions.length; i++) {
      const q = questions[i]
      const answers = selectedAnswers[i] || []
      const correct = q.correct || []
      const isCorrect =
        answers.length === correct.length &&
        answers.every(a => correct.includes(a)) &&
        correct.every(c => answers.includes(c))

      finalResults.push({
        question: q,
        selectedAnswers: answers,
        isCorrect,
        chapter: q.chapter || 'Unknown'
      })
    }

    setQuestionResults(finalResults)

    // Calculate score and save if it's a numbered quiz or chapter practice
    const correctCount = finalResults.filter(r => r.isCorrect).length
    const score = Math.round((correctCount / questions.length) * 100)

    if (currentQuizId) {
      saveCompletedQuiz(currentQuizId, score)
    }

    if (isChapterPractice && currentChapterName) {
      saveChapterProgress(currentChapterName, score)
    }

    navigate('/results')
  }, [questionResults, questions, selectedAnswers, navigate, currentQuizId, isChapterPractice, currentChapterName])

  const handleTimeUp = useCallback(() => {
    finishQuiz()
  }, [finishQuiz])

  const handleRestart = useCallback(() => {
    clearProgress()
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(quizData.timeLimit * 60)
    setStartTime(null)
    setEndTime(null)
    setShowResult(false)
    setQuestionResults([])
    setCurrentQuizId(null)
    setCurrentQuizName(null)
    setIsChapterPractice(false)
    setCurrentChapterName(null)
    navigate('/select')
  }, [navigate])

  const handleBackToHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleExitQuiz = useCallback(() => {
    // Clear progress so user isn't redirected back to quiz
    clearProgress()
    // Reset state
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(quizData.timeLimit * 60)
    setStartTime(null)
    setEndTime(null)
    setShowResult(false)
    setQuestionResults([])
    setCurrentQuizId(null)
    setCurrentQuizName(null)
    setIsChapterPractice(false)
    setCurrentChapterName(null)
    navigate('/select')
  }, [navigate])

  const handleReview = useCallback(() => {
    navigate('/review')
  }, [navigate])

  const handleBackToResults = useCallback(() => {
    navigate('/results')
  }, [navigate])

  // Calculate score
  const correctCount = questionResults.filter(r => r.isCorrect).length
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const timeTaken = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={
          <StartScreen
            onStart={() => navigate('/select')}
            quizData={quizData}
            hasSavedProgress={hasValidProgress}
            onContinue={() => navigate('/quiz')}
          />
        } />

        <Route path="/select" element={
          <QuizSelection
            quizData={quizData}
            onSelectQuiz={handleSelectQuiz}
            onStartRandom={handleStartRandom}
            onPracticeChapter={handlePracticeChapter}
            onBack={handleBackToHome}
          />
        } />

        <Route path="/quiz" element={
          questions.length > 0 ? (
            <QuizScreen
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              selectedAnswers={selectedAnswers}
              setSelectedAnswers={setSelectedAnswers}
              timeRemaining={timeRemaining}
              showResult={showResult}
              setShowResult={setShowResult}
              questionResults={questionResults}
              setQuestionResults={setQuestionResults}
              onFinish={finishQuiz}
              onTimeUp={handleTimeUp}
              onExit={handleExitQuiz}
              quizName={currentQuizName}
            />
          ) : (
            <QuizSelection
              quizData={quizData}
              onSelectQuiz={handleSelectQuiz}
              onStartRandom={handleStartRandom}
              onPracticeChapter={handlePracticeChapter}
              onBack={handleBackToHome}
            />
          )
        } />

        <Route path="/results" element={
          <Results
            score={score}
            correctCount={correctCount}
            totalQuestions={questions.length || 100}
            timeTaken={timeTaken}
            questionResults={questionResults}
            onRestart={handleRestart}
            onReview={handleReview}
            passingGrade={quizData.passingGrade}
          />
        } />

        <Route path="/review" element={
          <ReviewScreen
            questionResults={questionResults}
            onBack={handleBackToResults}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
