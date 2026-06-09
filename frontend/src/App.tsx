import { useState, useEffect } from 'react'
import { Volume2, Save, Settings, Trash2, BookOpen } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Translation {
  id: string
  original: string
  translated: string
  sourceLang: string
  targetLang: string
  timestamp: number
}

interface Flashcard {
  id: string
  front: string
  back: string
  pronunciation: string
}

export default function App() {
  const [text, setText] = useState('')
  const [translated, setTranslated] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('hi')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Translation[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory')
    const savedFlashcards = localStorage.getItem('flashcards')
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'

    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedFlashcards) setFlashcards(JSON.parse(savedFlashcards))
    if (savedTheme) setTheme(savedTheme)
  }, [])

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history))
  }, [history])

  // Save flashcards to localStorage
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards))
  }, [flashcards])

  // Translate text
  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_URL}/api/v1/translate`, {
        text,
        source_language: sourceLang,
        target_language: targetLang,
      })

      setTranslated(response.data.translated_text || 'Translation failed')

      // Add to history
      const newEntry: Translation = {
        id: Date.now().toString(),
        original: text,
        translated: response.data.translated_text,
        sourceLang,
        targetLang,
        timestamp: Date.now(),
      }
      setHistory([newEntry, ...history.slice(0, 19)])

      toast.success('Translation complete!')
    } catch (error) {
      toast.error('Translation failed. Check your API connection.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Text to speech
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-US'
      speechSynthesis.speak(utterance)
      toast.success('Speaking...')
    } else {
      toast.error('Speech synthesis not supported')
    }
  }

  // Save to flashcards
  const handleSaveFlashcard = () => {
    if (!translated) {
      toast.error('Translate something first')
      return
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: text,
      back: translated,
      pronunciation: '',
    }

    setFlashcards([newCard, ...flashcards])
    toast.success('Saved to flashcards!')
  }

  // Delete flashcard
  const handleDeleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id))
    toast.success('Flashcard deleted')
  }

  // Delete history entry
  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(entry => entry.id !== id))
    toast.success('History deleted')
  }

  // Clear all history
  const handleClearHistory = () => {
    setHistory([])
    toast.success('History cleared')
  }

  // Swap languages
  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setText(translated)
    setTranslated(text)
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header */}
        <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                🌍 Translator
              </h1>
              <p className="text-sm text-gray-500">Learn while you translate</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings size={24} />
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Settings Panel */}
          {showSettings && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
              <h2 className="text-xl font-bold mb-4">⚙️ Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label>Dark Mode</label>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    {theme === 'dark' ? '🌙 On' : '☀️ Off'}
                  </button>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
                >
                  Clear All History
                </button>
              </div>
            </div>
          )}

          {/* Main Translator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left: Input */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <label className="block text-sm font-semibold mb-2">Source Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className={`w-full p-2 border rounded mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>

              <label className="block text-sm font-semibold mb-2">Enter Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type something to translate..."
                className={`w-full h-32 p-3 border rounded resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              <p className="text-xs text-gray-500 mt-1">{text.length} / 5000</p>
            </div>

            {/* Right: Output */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <label className="block text-sm font-semibold mb-2">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className={`w-full p-2 border rounded mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="hi">Hindi</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>

              <label className="block text-sm font-semibold mb-2">Translation</label>
              <textarea
                value={translated}
                readOnly
                placeholder="Translation will appear here..."
                className={`w-full h-32 p-3 border rounded resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={handleTranslate}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Translating...' : '🔄 Translate'}
            </button>
            <button
              onClick={handleSwapLanguages}
              className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600`}
            >
              ↔️ Swap
            </button>
            <button
              onClick={() => handleSpeak(translated)}
              className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center gap-2`}
            >
              <Volume2 size={20} /> Speak
            </button>
            <button
              onClick={handleSaveFlashcard}
              className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center gap-2`}
            >
              <Save size={20} /> Save
            </button>
          </div>

          {/* Flashcards */}
          {flashcards.length > 0 && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen /> Flashcards ({flashcards.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashcards.map((card) => (
                  <div key={card.id} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}>
                    <p className="font-semibold">{card.front}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 my-2">{card.back}</p>
                    <button
                      onClick={() => handleDeleteFlashcard(card.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <Trash2 size={16} className="inline" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-2xl font-bold mb-4">📝 Translation History</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <div key={entry.id} className={`p-3 border rounded flex justify-between items-start ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.original}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">→ {entry.translated}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHistory(entry.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
