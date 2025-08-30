'use client'

import { useState } from 'react'

interface Flashcard {
  front: string
  back: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

type Message = {
  role: 'user' | 'bot'
  content: string
}

export default function StudyBotDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flashcards' | 'quiz' | 'study-buddy'>('dashboard')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Flashcard states
  const [notes, setNotes] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [flashProgress, setFlashProgress] = useState(0)

  // Quiz states
  const [quizText, setQuizText] = useState('')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Chat states
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  // Helper to add messages
  const addMessage = (role: 'user' | 'bot', content: string) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  // Flashcard logic
  const handleFlashcardSubmit = async () => {
    if (!notes.trim()) return
    setLoading(true)
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      const data = await response.json()
      if (data.flashcards) {
        setFlashcards(data.flashcards)
        setCurrentCard(0)
        setFlipped(false)
        setFlashProgress(0)
        setActiveTab('flashcards')
      }
    } catch (error) {
      alert('Error generating flashcards.')
    }
    setLoading(false)
    setNotes('')
  }

  // Quiz logic
  const handleQuizSubmit = async () => {
    if (!quizText.trim()) return
    setLoading(true)
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quizText })
      })
      const data = await response.json()
      if (data.quiz) {
        setQuiz(data.quiz)
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowResults(false)
        setScore(0)
        setActiveTab('quiz')
      }
    } catch (error) {
      alert('Error generating quiz.')
    }
    setLoading(false)
    setQuizText('')
  }

  // Study Buddy logic
  const handleChatSubmit = async () => {
    if (!input.trim()) return
    addMessage('user', input)
    setLoading(true)
    try {
      const response = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      })
      const data = await response.json()
      if (data.answer) {
        addMessage('bot', data.answer)
      }
    } catch (error) {
      addMessage('bot', 'Error answering your question.')
    }
    setLoading(false)
    setInput('')
  }

  // Quiz answer logic
  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    if (answerIndex === quiz[currentQuestion].correct) {
      setScore(score + 1)
    }
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }, 1200)
  }

  // Flashcard navigation
  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setFlipped(false)
      setFlashProgress(((currentCard + 2) / flashcards.length) * 100)
    }
  }
  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setFlipped(false)
      setFlashProgress(((currentCard) / flashcards.length) * 100)
    }
  }

  // Sidebar tabs
  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard' },
    { id: 'flashcards', label: '🃏 Flashcards' },
    { id: 'quiz', label: '📝 Quiz' },
    { id: 'study-buddy', label: '🤖 Study Buddy' }
  ]

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-gray-900 shadow-lg flex flex-col py-8 px-6 border-r border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-10 text-blue-700 dark:text-blue-400 text-center tracking-tight">StudyBot</h1>
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-lg text-left font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-8 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <div className="mt-auto text-xs text-gray-400 dark:text-gray-500 text-center pt-8">
            Modern Dashboard &mdash; StudyBot
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-transparent">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Flashcards Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <div className="text-4xl mb-4">🃏</div>
                <div className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Flashcards</div>
                <div className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Generate interactive flashcards from your notes and track your progress.
                </div>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                >
                  Go to Flashcards
                </button>
                {flashcards.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Progress</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                        style={{ width: `${flashProgress || ((currentCard+1)/flashcards.length)*100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {currentCard + 1} / {flashcards.length} cards
                    </div>
                  </div>
                )}
              </div>
              {/* Quiz Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Quiz Maker</div>
                <div className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Create quizzes from your study material and see your score.
                </div>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-800 transition"
                >
                  Go to Quiz
                </button>
                {quiz.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Progress</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                        style={{ width: `${((currentQuestion+1)/quiz.length)*100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {currentQuestion + 1} / {quiz.length} questions
                    </div>
                  </div>
                )}
              </div>
              {/* Study Buddy Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <div className="text-4xl mb-4">🤖</div>
                <div className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Study Buddy</div>
                <div className="text-gray-500 dark:text-gray-400 mb-4 text-center">
                  Ask any study question and get instant AI-powered answers.
                </div>
                <button
                  onClick={() => setActiveTab('study-buddy')}
                  className="px-6 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-700 dark:hover:bg-purple-800 transition"
                >
                  Go to Study Buddy
                </button>
                {messages.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Questions asked</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {messages.filter(m => m.role === 'user').length}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flashcards UI */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              {flashcards.length === 0 ? (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleFlashcardSubmit()
                  }}
                  className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col gap-4"
                >
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Generate Flashcards</h2>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Paste your study notes here..."
                    className="h-32 resize-none rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !notes.trim()}
                    className="px-6 py-3 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Flashcards'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="mb-2 text-gray-500 dark:text-gray-400">
                    Card {currentCard + 1} of {flashcards.length}
                  </div>
                  <div
                    className={`w-96 h-56 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg transition-transform duration-300 ${
                      flipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <div className="text-2xl font-semibold text-blue-700 dark:text-blue-300 text-center px-4">
                      {flipped
                        ? flashcards[currentCard]?.back
                        : flashcards[currentCard]?.front}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={prevCard}
                      disabled={currentCard === 0}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setFlashcards([])
                        setCurrentCard(0)
                        setFlipped(false)
                        setFlashProgress(0)
                        setActiveTab('dashboard')
                      }}
                      className="px-4 py-2 bg-red-500 dark:bg-red-700 text-white rounded-lg"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={nextCard}
                      disabled={currentCard === flashcards.length - 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="w-96 bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-4">
                    <div
                      className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                      style={{ width: `${((currentCard+1)/flashcards.length)*100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz UI */}
          {activeTab === 'quiz' && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              {quiz.length === 0 ? (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleQuizSubmit()
                  }}
                  className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col gap-4"
                >
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Create a Quiz</h2>
                  <textarea
                    value={quizText}
                    onChange={e => setQuizText(e.target.value)}
                    placeholder="Paste text here to create a quiz..."
                    className="h-32 resize-none rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !quizText.trim()}
                    className="px-6 py-3 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Quiz'}
                  </button>
                </form>
              ) : !showResults ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="mb-2 text-gray-500 dark:text-gray-400">
                    Question {currentQuestion + 1} of {quiz.length}
                  </div>
                  <div className="w-full max-w-xl bg-green-100 dark:bg-green-950 rounded-2xl p-6 shadow-lg">
                    <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-4">
                      {quiz[currentQuestion]?.question}
                    </div>
                    <div className="flex flex-col gap-2">
                      {quiz[currentQuestion]?.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left px-4 py-3 rounded-lg transition ${
                            selectedAnswer === null
                              ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-300 dark:hover:bg-green-800'
                              : selectedAnswer === idx
                              ? idx === quiz[currentQuestion].correct
                                ? 'bg-green-500 dark:bg-green-700 text-white'
                                : 'bg-red-500 dark:bg-red-700 text-white'
                              : idx === quiz[currentQuestion].correct
                              ? 'bg-green-500 dark:bg-green-700 text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {selectedAnswer !== null && (
                      <div className="mt-4 p-4 bg-green-200 dark:bg-green-900 rounded-lg text-green-900 dark:text-green-200">
                        <div className="font-medium mb-1">Explanation:</div>
                        <div>{quiz[currentQuestion]?.explanation}</div>
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-xl bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-4">
                    <div
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                      style={{ width: `${((currentQuestion+1)/quiz.length)*100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                    Quiz Complete!
                  </div>
                  <div className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                    You scored {score} out of {quiz.length} (
                    {Math.round((score / quiz.length) * 100)}%)
                  </div>
                  <button
                    onClick={() => {
                      setQuiz([])
                      setShowResults(false)
                      setScore(0)
                      setActiveTab('dashboard')
                    }}
                    className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Study Buddy UI */}
          {activeTab === 'study-buddy' && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">Ask StudyBot</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleChatSubmit()
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask any study question..."
                    className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Thinking...' : 'Ask'}
                  </button>
                </form>
                <div className="flex flex-col gap-3 mt-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xl px-5 py-3 rounded-2xl shadow ${
                          msg.role === 'user'
                            ? 'bg-purple-500 dark:bg-purple-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}