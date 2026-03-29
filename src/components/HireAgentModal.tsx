import { useState } from 'react';

const AVATAR_OPTIONS = [
  '🦊', '🐯', '🐺', '🦅', '🐉', '🐲', '🦉', '🐰',
  '🐸', '🦋', '🌟', '⚡', '🔥', '💎', '🎯', '🚀',
];

interface Props {
  onConfirm: (name: string, role: string, avatar: string) => void;
  onCancel: () => void;
}

export default function HireAgentModal({ onConfirm, onCancel }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');

  const canConfirm = name.trim().length > 0 && role.trim().length > 0 && avatar.length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(name.trim(), role.trim(), avatar);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: '#12122a',
          border: '1px solid #2a2a5c',
          borderRadius: 16,
          padding: '28px 32px',
          width: 400,
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Title */}
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0', marginBottom: 24 }}>
          入职新成员
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6a6a9a', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>
            姓名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：张三"
            style={{
              width: '100%',
              background: '#0a0a14',
              border: '1px solid #2a2a4c',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              color: '#e0e0f0',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#60aaff')}
            onBlur={(e) => (e.target.style.borderColor = '#2a2a4c')}
          />
        </div>

        {/* Role */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6a6a9a', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>
            职位
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="例如：工程师"
            style={{
              width: '100%',
              background: '#0a0a14',
              border: '1px solid #2a2a4c',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              color: '#e0e0f0',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#60aaff')}
            onBlur={(e) => (e.target.style.borderColor = '#2a2a4c')}
          />
        </div>

        {/* Avatar */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6a6a9a', marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>
            头像
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatar(emoji)}
                style={{
                  width: 44,
                  height: 44,
                  fontSize: 22,
                  background: avatar === emoji ? '#1e2a4a' : '#0a0a14',
                  border: avatar === emoji ? '2px solid #60aaff' : '1px solid #2a2a4c',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #3a3a6c',
              borderRadius: 8,
              color: '#a0a0c0',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: '10px 20px',
              background: canConfirm ? '#60aaff' : '#1a1a3a',
              border: 'none',
              borderRadius: 8,
              color: canConfirm ? '#0a0a14' : '#4a4a6a',
              fontSize: 14,
              fontWeight: 600,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            确认入职
          </button>
        </div>
      </div>
    </div>
  );
}
