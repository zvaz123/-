'use client';

import { useState } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  meta?: {
    intent: string;
    extractedData: any;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Привет! Я персональный ИИ-помощник студента. Чем я могу помочь? (Спросите про пропуски, кабинет, ДЗ или регламент)',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [lastMeta, setLastMeta] = useState<any>(null);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    // Добавляем сообщение пользователя
    const userMsg: Message = { sender: 'user', text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Имитация шагов 3-этапной обработки[cite: 1]
    setActiveStep(1); // NLU
    await new Promise((r) => setTimeout(r, 400));
    setActiveStep(2); // DB Query
    await new Promise((r) => setTimeout(r, 400));
    setActiveStep(3); // Response Generation

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply, meta: data.meta },
        ]);
        setLastMeta(data.meta);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Произошла ошибка связи с сервером бэкенда.' },
      ]);
    } finally {
      setLoading(false);
      setActiveStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Шапка */}
      <header className="border-b border-slate-800 bg-slate-950/50 p-4 backdrop-blur">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              🎓
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">AI Campus Assistant</h1>
              <p className="text-xs text-slate-400">Персональный цифровой помощник студента</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Next.js Local Dev
          </span>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Колонка 1 & 2: Чат */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950 rounded-xl border border-slate-800 h-[650px]">
          
          {/* История сообщений */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2-xl p-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs px-4 py-2.5 rounded-xl animate-pulse">
                  ИИ обрабатывает запрос и обращается к БД...
                </div>
              </div>
            )}
          </div>

          {/* Быстрые подсказки */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-900/40 flex gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => handleSend("Сколько у меня пропусков?")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              📋 Пропуски
            </button>
            <button
              onClick={() => handleSend("Где у нас сейчас пара?")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              📍 Кабинет
            </button>
            <button
              onClick={() => handleSend("Какое домашнее задание?")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              📚 Домашка
            </button>
            <button
              onClick={() => handleSend("Как оформить академический отпуск?")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              🏛 Академ
            </button>
          </div>

          {/* Поле ввода */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Впишите вопрос (например: Сколько пропусков по физике?)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Отправить
            </button>
          </form>
        </div>

        {/* Колонка 3: Визуализация NLU -> DB -> Response Cycle */}
        <div className="flex flex-col gap-4">
          
          {/* Визуализатор 3-шагового цикла */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h2 className="text-sm font-semibold mb-3 text-slate-300">
              3-Step Query Processing Cycle[cite: 1]
            </h2>
            <div className="space-y-2 text-xs">
              <div
                className={`p-3 rounded-lg border transition ${
                  activeStep === 1
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold mb-0.5">01. NLU Intent Recognition[cite: 1]</div>
                <div>Анализ намерений запроса студента</div>
                {lastMeta && (
                  <div className="mt-1.5 font-mono text-[10px] text-blue-400 bg-blue-950/80 p-1 rounded">
                    Intent: {lastMeta.intent}
                  </div>
                )}
              </div>

              <div
                className={`p-3 rounded-lg border transition ${
                  activeStep === 2
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold mb-0.5">02. Database API Query[cite: 1]</div>
                <div>Запрос данных из LMS / ERP / RAG[cite: 1]</div>
              </div>

              <div
                className={`p-3 rounded-lg border transition ${
                  activeStep === 3
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold mb-0.5">03. Response Generation[cite: 1]</div>
                <div>Формирование ответа в текстовом виде[cite: 1]</div>
              </div>
            </div>
          </div>

          {/* Отладчик исходных данных (Mock DB Data) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1">
            <h2 className="text-sm font-semibold mb-2 text-slate-300">Данные из API/БД (JSON)</h2>
            <pre className="bg-slate-900 p-3 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[220px]">
              {lastMeta
                ? JSON.stringify(lastMeta.extractedData, null, 2)
                : "// Сделайте запрос для получения ответа из БД"}
            </pre>
          </div>

        </div>
      </main>
    </div>
  );
}