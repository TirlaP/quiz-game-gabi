import React, { useEffect, useState } from 'react';
import {
  TrophyIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

const Results = ({
  score,
  correctCount,
  totalQuestions,
  timeTaken,
  questionResults = [],
  onRestart,
  onReview,
  passingGrade = 75
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const isPassing = score >= passingGrade;
  const incorrectCount = totalQuestions - correctCount;

  useEffect(() => {
    if (isPassing) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPassing]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEncouragingMessage = () => {
    if (score >= 95) return "Outstanding! You're an A220 expert!";
    if (score >= 85) return "Excellent work! You really know your stuff!";
    if (score >= 75) return "Great job! You passed the quiz!";
    if (score >= 60) return "Good effort! Review the material and try again.";
    return "Keep studying! You'll get there!";
  };

  const getPerformanceByChapter = () => {
    const chapterStats = {};

    questionResults.forEach(result => {
      const chapter = result.chapter || 'Unknown';
      if (!chapterStats[chapter]) {
        chapterStats[chapter] = {
          total: 0,
          correct: 0,
          percentage: 0
        };
      }
      chapterStats[chapter].total++;
      if (result.isCorrect) {
        chapterStats[chapter].correct++;
      }
    });

    Object.keys(chapterStats).forEach(chapter => {
      const stats = chapterStats[chapter];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return chapterStats;
  };

  const chapterPerformance = getPerformanceByChapter();

  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      color: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'][Math.floor(Math.random() * 5)]
    }));

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 animate-fall"
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: 'rotate(45deg)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0">
        {/* Header - Compact */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-3">
            {isPassing ? (
              <TrophyIcon className="w-10 h-10 text-yellow-400 animate-bounce" />
            ) : (
              <XCircleIcon className="w-10 h-10 text-red-400" />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Quiz Complete!</h1>
              <p className="text-slate-400 text-sm">{getEncouragingMessage()}</p>
            </div>
          </div>
        </div>

        {/* Score Display - Compact */}
        <div className="card mb-3 py-4">
          <div className="flex items-center justify-center gap-6">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {score}%
            </div>
            <div className={`px-4 py-2 rounded-full text-lg font-semibold ${
              isPassing
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                : 'bg-red-500/20 text-red-400 border-2 border-red-500'
            }`}>
              {isPassing ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>

        {/* Statistics Grid - Compact */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="card py-3 text-center">
            <DocumentTextIcon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{totalQuestions}</div>
            <div className="text-slate-500 text-xs">Total</div>
          </div>
          <div className="card py-3 text-center">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{correctCount}</div>
            <div className="text-slate-500 text-xs">Correct</div>
          </div>
          <div className="card py-3 text-center">
            <XCircleIcon className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{incorrectCount}</div>
            <div className="text-slate-500 text-xs">Wrong</div>
          </div>
          <div className="card py-3 text-center">
            <ClockIcon className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{formatTime(timeTaken)}</div>
            <div className="text-slate-500 text-xs">Time</div>
          </div>
        </div>

        {/* Performance by Chapter - Scrollable */}
        {Object.keys(chapterPerformance).length > 0 && (
          <div className="card flex-1 min-h-0 mb-3 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Performance by Chapter</h2>
            </div>
            <div className="flex-1 overflow-auto space-y-2 pr-1">
              {Object.entries(chapterPerformance).map(([chapter, stats]) => (
                <div key={chapter} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium truncate pr-2">{chapter}</span>
                    <span className="text-slate-400 flex-shrink-0">
                      {stats.correct}/{stats.total} ({stats.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.percentage >= 75
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                          : stats.percentage >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                          : 'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={onReview}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Review Answers
          </button>
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            New Quiz
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Results;
