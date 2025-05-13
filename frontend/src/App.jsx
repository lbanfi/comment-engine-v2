// React root component
import React, { useState } from 'react'
import CommentOthers from './components/CommentOthers'
import ReplyOwn from './components/ReplyOwn'
import Reciprocation from './components/Reciprocation'
import Connections from './components/Connections'
import CostAnalysis from './components/CostAnalysis'

const TABS = [
  'Comment Others',
  'Reply Own',
  'Reciprocation',
  'Connections',
  'Cost Analysis'
]

export default function App() {
  const [tab, setTab] = useState(0)
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>LinkedIn Comment Engine</h1>
      <nav style={{ marginBottom: '1rem' }}>
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              background: tab === i ? '#8B4513' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {t}
          </button>
        ))}
      </nav>
      <div>
        {tab === 0 && <CommentOthers />}
        {tab === 1 && <ReplyOwn />}
        {tab === 2 && <Reciprocation />}
        {tab === 3 && <Connections />}
        {tab === 4 && <CostAnalysis />}
      </div>
    </div>
  )
}
