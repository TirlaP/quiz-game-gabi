import React, { useMemo, useState } from 'react';
import { generateSeededQuizSets, getAllQuestions } from '../utils/quizUtils';

const COMPLETED_QUIZZES_KEY = 'a220_completed_quizzes';
const QUIZ_SCORES_KEY = 'a220_quiz_scores';
const CHAPTER_PROGRESS_KEY = 'a220_chapter_progress';

const getCompletedQuizzes = () => {
  try {
    const saved = localStorage.getItem(COMPLETED_QUIZZES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getQuizScores = () => {
  try {
    const saved = localStorage.getItem(QUIZ_SCORES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const getChapterProgress = () => {
  try {
    const saved = localStorage.getItem(CHAPTER_PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const QuizSelection = ({ quizData, onSelectQuiz, onStartRandom, onPracticeChapter, onBack }) => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const quizSets = useMemo(() => generateSeededQuizSets(quizData, 100), [quizData]);
  const totalQuestions = getAllQuestions(quizData).length;
  const completedQuizzes = getCompletedQuizzes();
  const quizScores = getQuizScores();
  const chapterProgress = getChapterProgress();
  const chapters = quizData.quizzes || [];

  const completedCount = completedQuizzes.length;
  const totalQuizzes = quizSets.length;
  const progressPercent = Math.round((completedCount / totalQuizzes) * 100);

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Select a Quiz</h1>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Progress bar */}
        <div className="card mb-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{completedCount}/{totalQuizzes} quizzes</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={onStartRandom}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm rounded-lg transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Random
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'quizzes'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Quizzes ({totalQuizzes})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'chapters'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Chapters ({chapters.length})
            </span>
          </button>
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === 'quizzes' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quizSets.map((quiz) => {
                const isCompleted = completedQuizzes.includes(quiz.id);
                const score = quizScores[quiz.id];

                return (
                  <button
                    key={quiz.id}
                    onClick={() => onSelectQuiz(quiz)}
                    className={`relative p-4 rounded-xl border-2 transition-all hover:scale-102 text-left ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400'
                        : 'bg-white/5 border-white/10 hover:border-cyan-400 hover:bg-white/10'
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    <div className={`text-2xl font-bold mb-1 ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {quiz.id}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1 pr-6">{quiz.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                    {score !== undefined && (
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        score >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {score}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {chapters.map((chapter, index) => {
                const chapterKey = chapter.name.toLowerCase().replace(/\s+/g, '-');
                const progress = chapterProgress[chapterKey];
                const hasProgress = progress && progress.bestScore !== undefined;

                return (
                  <button
                    key={index}
                    onClick={() => onPracticeChapter && onPracticeChapter(chapter)}
                    className={`relative p-3 rounded-lg border transition-all hover:scale-102 text-left ${
                      hasProgress
                        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400'
                        : 'bg-white/5 border-white/10 hover:border-amber-400 hover:bg-white/10'
                    }`}
                  >
                    {hasProgress && (
                      <span className={`absolute top-2 right-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                        progress.bestScore >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {progress.bestScore}%
                      </span>
                    )}
                    <h3 className="text-xs font-medium text-white mb-1 pr-10 line-clamp-2">{chapter.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {chapter.totalQuestions}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {(completedCount > 0 || Object.keys(chapterProgress).length > 0) && (
          <div className="text-center pt-4">
            <button
              onClick={() => {
                if (confirm('Reset all progress?')) {
                  localStorage.removeItem(COMPLETED_QUIZZES_KEY);
                  localStorage.removeItem(QUIZ_SCORES_KEY);
                  localStorage.removeItem(CHAPTER_PROGRESS_KEY);
                  window.location.reload();
                }
              }}
              className="text-slate-500 hover:text-red-400 text-xs underline transition-colors"
            >
              Reset Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSelection;
export { CHAPTER_PROGRESS_KEY };
export { COMPLETED_QUIZZES_KEY, QUIZ_SCORES_KEY };
