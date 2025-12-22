import React from 'react';

const StartScreen = ({ onStart, quizData, hasSavedProgress, onContinue }) => {
  const totalQuestions = quizData?.totalQuestions || 100;
  const timeLimit = quizData?.timeLimit || 120;
  const passingGrade = quizData?.passingGrade || 75;

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center py-4 md:py-6">
          <div className="inline-flex items-center gap-4">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-cyan-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                A220 Aircraft Quiz
              </h1>
              <p className="text-cyan-300 text-sm md:text-base">Type Rating Exam Preparation</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="card mb-4">
          <div className="flex justify-around items-center py-2">
            <div className="text-center px-4">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{totalQuestions}</div>
              <div className="text-slate-400 text-xs uppercase">Questions</div>
            </div>
            <div className="w-px h-10 bg-slate-600"></div>
            <div className="text-center px-4">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{timeLimit}</div>
              <div className="text-slate-400 text-xs uppercase">Minutes</div>
            </div>
            <div className="w-px h-10 bg-slate-600"></div>
            <div className="text-center px-4">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{passingGrade}%</div>
              <div className="text-slate-400 text-xs uppercase">Pass Grade</div>
            </div>
          </div>
        </div>

        {/* Instructions - compact */}
        <div className="card flex-1 flex flex-col min-h-0 mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-auto">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-sm">1</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Select a Quiz</div>
                <div className="text-slate-400 text-xs">Choose from 6 quizzes or practice by chapter</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-sm">2</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Answer Questions</div>
                <div className="text-slate-400 text-xs">Single or multiple choice with instant feedback</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-sm">3</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Learn from Explanations</div>
                <div className="text-slate-400 text-xs">See why each answer is correct with sources</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-sm">4</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Track Progress</div>
                <div className="text-slate-400 text-xs">Complete all quizzes to cover 517 questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
          {hasSavedProgress && (
            <button
              onClick={onContinue}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continue Quiz
            </button>
          )}
          <button
            onClick={onStart}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold text-white rounded-xl transition-all hover:scale-105 ${
              hasSavedProgress
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:shadow-slate-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {hasSavedProgress ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              )}
            </svg>
            {hasSavedProgress ? 'Start New' : 'Select Quiz'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
