import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function CreateCompanyModal({ onConfirm, onCancel }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('请输入公司名称');
      return;
    }
    onConfirm(trimmed);
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
          width: 360,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0', marginBottom: 6 }}>
          创建公司
        </div>
        <div style={{ fontSize: 13, color: '#6a6a9a', marginBottom: 24 }}>
          为空桌子上的新公司命名
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="例如：云爪科技"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#0a0a1e',
              border: `1px solid ${error ? '#ff4444' : '#3a3a6c'}`,
              borderRadius: 8,
              color: '#e0e0f0',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: error ? 8 : 16,
            }}
          />
          {error && (
            <div style={{ color: '#ff6666', fontSize: 12, marginBottom: 12 }}>{error}</div>
          )}

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
