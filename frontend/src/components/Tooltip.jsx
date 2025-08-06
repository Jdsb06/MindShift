import React, { useState } from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            [position]: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 41, 59, 0.95)',
            color: 'white',
            padding: '0.5em 1em',
            borderRadius: '0.5em',
            whiteSpace: 'nowrap',
            zIndex: 100,
            marginTop: position === 'top' ? '-2.5em' : '0.5em',
            fontSize: '0.95em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
} 