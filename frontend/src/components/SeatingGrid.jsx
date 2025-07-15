import React, { useEffect, useState } from 'react';

export default function SeatingGrid({ arrangementId }) {
  const [seats, setSeats] = useState([]);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/arrangement/${arrangementId}/full`)
      .then(res => res.json())
      .then(data => {
        setSeats(data.seats);
        setMeta({ strategy: data.strategy, date: data.createdAt });
      })
      .catch(err => console.error('Error fetching arrangement:', err));
  }, [arrangementId]);

  return (
    <div>
      <h3>Seating Plan ({meta.strategy})</h3>
      <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(...seats.map(s => s.col)) + 1}, 60px)`,
        gap: '5px'
      }}>
        {seats.map((seat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: seat.subject ? getSubjectColor(seat.subject) : '#ccc',
              padding: '8px',
              textAlign: 'center',
              borderRadius: '4px'
            }}
            title={`${seat.name || 'Empty'} (${seat.subject || ''})`}
          >
            {seat.name || '—'}
          </div>
        ))}
      </div>
    </div>
  );
}

function getSubjectColor(subject) {
  const colors = {
    Math: '#FFD700',
    Physics: '#1E90FF',
    Chemistry: '#FF6347',
    Biology: '#32CD32'
  };
  return colors[subject] || '#ddd';
}
