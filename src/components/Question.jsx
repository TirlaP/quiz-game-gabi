import React from 'react';

const Question = ({
  question,
  selectedAnswers = [],
  onAnswerSelect,
  showResult = false,
  questionNumber,
  totalQuestions,
  explanation = null,
  pageReferences = null
}) => {
  const isMultiple = question.type === 'multiple';

  const isSelected = (letter) => {
    return selectedAnswers.includes(letter.toLowerCase());
  };

  const isCorrect = (letter) => {
    return question.correct?.includes(letter.toLowerCase());
  };

  const getOptionClass = (letter) => {
    const baseClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-start gap-3";

    if (showResult) {
      if (isCorrect(letter)) {
        return `${baseClass} border-green-500 bg-green-500/20`;
      } else if (isSelected(letter) && !isCorrect(letter)) {
        return `${baseClass} border-red-500 bg-red-500/20`;
      }
      return `${baseClass} border-white/20 bg-white/5 opacity-60`;
    } else {
      if (isSelected(letter)) {
        return `${baseClass} border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20`;
      }
      return `${baseClass} border-white/30 bg-white/5 hover:bg-white/15 hover:border-cyan-400 cursor-pointer`;
    }
  };

  // Radio button icon for single select
  const RadioIcon = ({ selected, correct, incorrect }) => {
    let borderColor = 'border-gray-400';
    let fillColor = 'bg-transparent';

    if (showResult) {
      if (correct) {
        borderColor = 'border-green-500';
        fillColor = selected ? 'bg-green-500' : 'bg-transparent';
      } else if (incorrect) {
        borderColor = 'border-red-500';
        fillColor = 'bg-red-500';
      }
    } else if (selected) {
      borderColor = 'border-cyan-400';
      fillColor = 'bg-cyan-400';
    }

    return (
      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${borderColor} flex items-center justify-center`}>
        {(selected || (showResult && correct)) && (
          <div className={`w-3 h-3 rounded-full ${fillColor}`} />
        )}
      </div>
    );
  };

  // Checkbox icon for multi select
  const CheckboxIcon = ({ selected, correct, incorrect }) => {
    let borderColor = 'border-gray-400';
    let bgColor = 'bg-transparent';

    if (showResult) {
      if (correct) {
        borderColor = 'border-green-500';
        bgColor = selected ? 'bg-green-500' : 'bg-transparent';
      } else if (incorrect) {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-500';
      }
    } else if (selected) {
      borderColor = 'border-cyan-400';
      bgColor = 'bg-cyan-400';
    }

    return (
      <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 ${borderColor} ${bgColor} flex items-center justify-center`}>
        {(selected || (showResult && correct)) && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  };

  const handleOptionClick = (letter) => {
    if (!showResult && onAnswerSelect) {
      onAnswerSelect(letter.toLowerCase());
    }
  };

  return (
    <div className="card">
      {/* Question Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="chapter-badge">
          {question.code}
        </span>
        {/* Question Type Badge */}
        {isMultiple ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300 border border-purple-400/30">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
            </svg>
            Multiple Select
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            Single Select
          </span>
        )}
      </div>

      {/* Question Text */}
      <div className="text-lg font-medium text-white mb-6 leading-relaxed">
        {question.text}
      </div>

      {/* Question Images */}
      {question.images && question.images.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4">
          {question.images.map((imageUrl, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <img
                src={imageUrl}
                alt={`Question illustration ${index + 1}`}
                className="w-full rounded-lg max-h-96 object-contain bg-slate-800"
                onError={(e) => {
                  // Show placeholder for failed images
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-slate-400">
                      <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm">Image requires login to view</span>
                      <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-400 hover:underline mt-1">Open in new tab</a>
                    </div>
                  `;
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options?.map((option) => {
          const selected = isSelected(option.letter);
          const correct = isCorrect(option.letter);
          const incorrect = selected && !correct;

          return (
            <button
              key={option.letter}
              onClick={() => handleOptionClick(option.letter)}
              disabled={showResult}
              className={getOptionClass(option.letter)}
            >
              {/* Radio or Checkbox Icon */}
              {isMultiple ? (
                <CheckboxIcon selected={selected} correct={correct} incorrect={incorrect} />
              ) : (
                <RadioIcon selected={selected} correct={correct} incorrect={incorrect} />
              )}

              {/* Letter Badge */}
              <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs ${
                showResult
                  ? correct
                    ? 'bg-green-500/30 text-green-400'
                    : incorrect
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-white/10 text-gray-500'
                  : selected
                  ? 'bg-cyan-500/30 text-cyan-400'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {option.letter.toUpperCase()}
              </span>

              {/* Option Text */}
              <span className="flex-1 text-white">{option.text}</span>

              {/* Result Icons */}
              {showResult && correct && (
                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {showResult && incorrect && (
                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Feedback */}
      {showResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          selectedAnswers.length > 0 &&
          selectedAnswers.every(a => question.correct?.includes(a)) &&
          question.correct?.every(c => selectedAnswers.includes(c))
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {selectedAnswers.length > 0 &&
             selectedAnswers.every(a => question.correct?.includes(a)) &&
             question.correct?.every(c => selectedAnswers.includes(c)) ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 font-medium">Correct!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-400 font-medium">
                  Incorrect. The correct answer{question.correct?.length > 1 ? 's are' : ' is'}: {question.correct?.map(l => l.toUpperCase()).join(', ')}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Explanation Section */}
      {showResult && explanation && (
        <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <span>Why this is correct</span>
              </h4>
              <p className="text-slate-300 leading-relaxed mb-3">
                {explanation.explanation}
              </p>
              {/* Sources Section - prioritizes actual page references when available */}
              {(pageReferences?.pages || explanation.source || explanation.page || explanation.sources) && (
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-slate-400 font-medium">Sources:</span>

                      {/* Priority 1: Actual PDF page references (verified page numbers) */}
                      {pageReferences?.pages && Array.isArray(pageReferences.pages) ? (
                        <ul className="mt-1 space-y-1">
                          {pageReferences.pages.map((ref, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${ref.note ? 'bg-amber-400' : 'bg-green-400'} flex-shrink-0`}></span>
                              <span className="text-blue-400 font-medium">
                                {ref.pdf === 'FCOM1' ? 'A220-300_FCOM1.pdf' :
                                 ref.pdf === 'OM' ? 'Operations_Manual_Part_B_A220_TR027.6.pdf' :
                                 ref.pdf}
                              </span>
                              <span className={`${ref.note ? 'text-amber-400' : 'text-green-400'} font-semibold`}>
                                — Page {ref.page}
                                {ref.note && <span className="text-slate-400 font-normal text-xs ml-1">({ref.note})</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : explanation.sources && Array.isArray(explanation.sources) ? (
                        /* Priority 2: Sources array from explanation */
                        <ul className="mt-1 space-y-1">
                          {explanation.sources.map((src, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                              <span className="text-blue-400 font-medium">
                                {src.pdf === 'FCOM1' ? 'A220-300_FCOM1.pdf' :
                                 src.pdf === 'Operations Manual' ? 'Operations_Manual_Part_B_A220_TR027.6.pdf' :
                                 src.pdf}
                              </span>
                              {src.page && (
                                <span className="text-amber-400">— Page {src.page}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (explanation.source || explanation.page) ? (
                        /* Priority 3: Old format single source and page */
                        <div className="mt-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                          <span className="text-blue-400 font-medium">
                            {explanation.source === 'FCOM1' ? 'A220-300_FCOM1.pdf' :
                             explanation.source === 'Operations Manual' ? 'Operations_Manual_Part_B_A220_TR027.6.pdf' :
                             explanation.source}
                          </span>
                          {explanation.page && (
                            <span className="text-amber-400">— Page {explanation.page}</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
