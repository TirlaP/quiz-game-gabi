import { useState } from 'react'

function ReviewScreen({ questionResults, onBack }) {
  const [filter, setFilter] = useState('all') // 'all', 'correct', 'incorrect'
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const filteredResults = questionResults.filter(result => {
    if (filter === 'correct') return result.isCorrect
    if (filter === 'incorrect') return !result.isCorrect
    return true
  })

  const correctCount = questionResults.filter(r => r.isCorrect).length
  const incorrectCount = questionResults.length - correctCount

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0">
        {/* Header - Compact */}
        <div className="card mb-3 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white">Review Answers</h1>
              <p className="text-gray-400 text-sm">
                {correctCount} correct, {incorrectCount} incorrect out of {questionResults.length}
              </p>
            </div>
            <button onClick={onBack} className="btn-secondary text-sm py-2 px-4">
              Back to Results
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All ({questionResults.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'correct'
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Correct ({correctCount})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'incorrect'
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Incorrect ({incorrectCount})
          </button>
        </div>

        {/* Questions List - Scrollable */}
        <div className="flex-1 min-h-0 overflow-auto space-y-3 pr-1">
        {filteredResults.map((result, index) => {
          const { question, selectedAnswers, isCorrect } = result
          const isExpanded = expandedQuestion === index
          const originalIndex = questionResults.indexOf(result)

          return (
            <div
              key={index}
              className={`card cursor-pointer transition-all ${
                isCorrect ? 'border-green-500/30' : 'border-red-500/30'
              }`}
              onClick={() => setExpandedQuestion(isExpanded ? null : index)}
            >
              {/* Question Header */}
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {isCorrect ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400">Q{originalIndex + 1}</span>
                    <span className="chapter-badge">{question.code}</span>
                    {question.type === 'multiple' && (
                      <span className="text-xs text-amber-400">(Multiple answers)</span>
                    )}
                  </div>
                  <p className="text-white font-medium line-clamp-2">{question.text}</p>
                </div>

                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {/* Images */}
                  {question.images && question.images.length > 0 && (
                    <div className="mb-4 grid grid-cols-1 gap-4">
                      {question.images.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`Question ${originalIndex + 1} image ${imgIndex + 1}`}
                          className="rounded-lg max-w-full h-auto bg-white/5 p-2"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = selectedAnswers.includes(option.letter)
                      const isCorrectAnswer = question.correct.includes(option.letter)

                      let optionClass = 'p-3 rounded-lg border-2 flex items-start gap-3 '
                      if (isCorrectAnswer) {
                        optionClass += 'border-green-500 bg-green-500/20'
                      } else if (isSelected && !isCorrectAnswer) {
                        optionClass += 'border-red-500 bg-red-500/20'
                      } else {
                        optionClass += 'border-white/20 bg-white/5'
                      }

                      return (
                        <div key={option.letter} className={optionClass}>
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCorrectAnswer
                              ? 'bg-green-500 text-white'
                              : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-white/20 text-gray-300'
                          }`}>
                            {option.letter.toUpperCase()}
                          </span>
                          <span className="text-white">{option.text}</span>
                          {isCorrectAnswer && (
                            <svg className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isSelected && !isCorrectAnswer && (
                            <svg className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Answer Summary */}
                  <div className="mt-4 pt-4 border-t border-white/10 text-sm">
                    <p className="text-gray-400">
                      <span className="text-white font-medium">Correct answer{question.correct.length > 1 ? 's' : ''}: </span>
                      {question.correct.map(l => l.toUpperCase()).join(', ')}
                    </p>
                    {selectedAnswers.length > 0 && (
                      <p className="text-gray-400 mt-1">
                        <span className="text-white font-medium">Your answer{selectedAnswers.length > 1 ? 's' : ''}: </span>
                        {selectedAnswers.map(l => l.toUpperCase()).join(', ')}
                      </p>
                    )}
                    {selectedAnswers.length === 0 && (
                      <p className="text-amber-400 mt-1">No answer selected</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      </div>
    </div>
  )
}

export default ReviewScreen
