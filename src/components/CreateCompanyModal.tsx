import React, { useState, useRef, useEffect } from 'react';

const AVATAR_OPTIONS = ['🦁', '🦊', '🐯', '🐺', '🦅', '🐉', '🦅', '🐲', '🦉', '🐰', '🐸', '🐵', '🦄', '🐝', '🦋', '🌟', '🔥', '💎', '🌈', '🎯'];

interface Props {
  companyName: string;
  onConfirm: (ceoName: string, ceoAvatar: string) => void;
  onCancel: () => void;
}

export default function CreateCompanyModal({ companyName, onConfirm, onCancel }: Props) {
  const [ceoName, setCeoName] = useState(companyName ? `${companyName} CEO` : '');
  const [ceoAvatar, setCeoAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ceoName.trim();
    if (!trimmed) {
      setError('请输入 CEO 姓名');
      return;
    }
    onConfirm(trimmed, ceoAvatar);
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#12122a',
          border: '1px solid #3a3a6c',
          borderRadius: 16,
          padding: '32px 36px',
          width: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0', marginBottom: 6 }}>
          任命 CEO
        </div>
        <div style={{ fontSize: 13, color: '#6a6a9a', marginBottom: 24 }}>
          为 {companyName} 任命一位 CEO，他将同步创建为 OpenClaw Agent
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>CEO 姓名 *</div>
            <input
              ref={inputRef}
              value={ceoName}
              onChange={(e) => { setCeoName(e.target.value); setError(''); }}
              placeholder="例如：阿尔瓦·洛克菲勒"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a0a1e',
                border: `1px solid ${error ? '#ff4444' : '#3a3a6c'}`,
                borderRadius: 8,
                color: '#e0e0f0',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && <div style={{ color: '#ff6666', fontSize: 12, marginTop: 4 }}>{error}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 8 }}>CEO 头像</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AVATAR_OPTIONS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setCeoAvatar(a)}
                  style={{
                    width: 36,
                    height: 36,
                    fontSize: 20,
                    background: ceoAvatar === a ? '#2a2a5a' : '#0a0a1e',
                    border: `1px solid ${ceoAvatar === a ? '#6a6aff' : '#3a3a6c'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
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
              type="submit"
              style={{
                padding: '10px 24px',
                background: '#4a4a9a',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              确认入驻
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
