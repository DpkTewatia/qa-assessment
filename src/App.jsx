import { useState, useEffect } from 'react';

export default function App() {
  const [boards, setBoards] = useState([]);
  const [boardInput, setBoardInput] = useState('');
  const [cardInputs, setCardInputs] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('trelloBoards');
    if (saved) setBoards(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('trelloBoards', JSON.stringify(boards));
  }, [boards]);

  const addBoard = () => {
    if (!boardInput) return alert('Board name required');
    setBoards([...boards, { name: boardInput, cards: [] }]);
  };

  const handleCardInputChange = (boardIndex, value) => {
    setCardInputs({ ...cardInputs, [boardIndex]: value });
  };

  const addCard = (boardIndex) => {
    const text = cardInputs[boardIndex];
    if (!text) return alert('Card text required');
    const updated = [...boards];
    updated[boardIndex].cards.push({ text });
    setBoards(updated);
  };

  const deleteCard = (boardIndex, cardIndex) => {
    const updated = [...boards];
    updated[boardIndex].cards.splice(cardIndex, 1);
    setBoards(updated);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Buggy Trello Clone</h1>
      <input
        value={boardInput}
        onChange={(e) => setBoardInput(e.target.value)}
        placeholder="Board name"
        style={{ border: '1px solid #ccc', padding: '8px', marginRight: '8px', borderRadius: '4px' }}
      />
      <button
        onClick={addBoard}
        style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Add Board
      </button>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', overflowX: 'auto' }}>
        {boards.map((board, boardIndex) => (
          <div
            key={boardIndex}
            style={{ width: '256px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
          >
            <h2 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '12px', color: '#333' }}>{board.name}</h2>

            <input
              value={cardInputs[boardIndex] || ''}
              onChange={(e) => handleCardInputChange(boardIndex, e.target.value)}
              placeholder="Card text"
              style={{ border: '1px solid #ccc', padding: '6px', width: '100%', marginBottom: '8px', borderRadius: '4px' }}
            />
            <button
              onClick={() => addCard(boardIndex)}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', width: '100%', cursor: 'pointer', marginBottom: '12px' }}
            >
              + Add Card
            </button>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {board.cards.map((card, cardIndex) => (
                <li
                  key={cardIndex}
                  style={{ backgroundColor: '#f9fafb', padding: '8px', marginBottom: '8px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#111' }}
                >
                  <span>{card.text}</span>
                  <button
                    onClick={() => deleteCard(boardIndex, cardIndex)}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
