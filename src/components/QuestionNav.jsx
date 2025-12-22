import React from 'react';

const QuestionNav = ({
  questions,
  currentQuestionIndex,
  selectedAnswers,
  questionResults,
  showResult,
  onQuestionSelect
}) => {
  const getQuestionStatus = (index) => {
    // Check if this question has been answered and confirmed
    const result = questionResults.find((r, i) => i === index);
    if (result) {
      return result.isCorrect ? 'correct' : 'incorrect';
    }

    // Check if question has selected answers
    const answers = selectedAnswers[index] || [];
    if (answers.length > 0) {
      return 'answered';
    }

    return 'unanswered';
  };

  const getButtonClass = (index) => {
    const status = getQuestionStatus(index);
    const isCurrent = index === currentQuestionIndex;

    let baseClass = 'w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center';

    if (isCurrent) {
      baseClass += ' ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-800';
    }

    switch (status) {
      case 'correct':
        return `${baseClass} bg-green-500/30 text-green-400 border border-green-500/50`;
      case 'incorrect':
        return `${baseClass} bg-red-500/30 text-red-400 border border-red-500/50`;
      case 'answered':
        return `${baseClass} bg-cyan-500/30 text-cyan-400 border border-cyan-500/50`;
      default:
        return `${baseClass} bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-white/20`;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 h-fit sticky top-6">
      <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Questions
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10"></div>
          <span className="text-gray-500">Empty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/50"></div>
          <span className="text-gray-500">Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50"></div>
          <span className="text-gray-500">Correct</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50"></div>
          <span className="text-gray-500">Wrong</span>
        </div>
      </div>
      {/* Dot legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs border-t border-white/10 pt-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-gray-500">Single</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <span className="text-gray-500">Multiple</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <span className="text-gray-500">Has Image</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto py-1">
        {questions.map((question, index) => {
          const hasImages = question.images && question.images.length > 0;
          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={`${getButtonClass(index)} relative`}
              title={`Question ${index + 1} - ${question.type === 'multiple' ? 'Multiple Select' : 'Single Select'}${hasImages ? ' (Has Image)' : ''}`}
            >
              {index + 1}
              {/* Type indicator dot (top-right) */}
              <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                question.type === 'multiple'
                  ? 'bg-purple-400'
                  : 'bg-emerald-400'
              }`} />
              {/* Image indicator (bottom-right) */}
              {hasImages && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-400">
            Answered: <span className="text-cyan-400 font-semibold">
              {Object.keys(selectedAnswers).filter(k => selectedAnswers[k]?.length > 0).length}
            </span>
          </div>
          <div className="text-gray-400">
            Remaining: <span className="text-white font-semibold">
              {questions.length - Object.keys(selectedAnswers).filter(k => selectedAnswers[k]?.length > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNav;
