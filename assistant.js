import { sources, actions } from './profile-data.js?v=assistant1';

export function createAssistant({ endpoint, entry, text, link, getCircuit, applyAction, clearHistory }) {
  const output = document.querySelector('#output');
  const status = document.querySelector('#assistant-status');
  const stop = document.querySelector('#stop-answer');
  let conversation = [];
  let pending = null;
  let ready = false;
  try { const url = new URL(endpoint); ready = url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname)); } catch { /* Disabled until a backend is connected. */ }
  status.textContent = ready ? 'AI GUIDE / ready' : 'AI GUIDE / not connected';

  function cancel(showMessage = false) {
    if (!pending) return;
    const request = pending;
    pending = null;
    request.controller.abort();
    clearTimeout(request.timeout);
    if (showMessage) request.message.textContent = 'Stopped. You can ask another question.';
    output.removeAttribute('aria-busy');
    stop.hidden = true;
    status.textContent = ready ? 'AI GUIDE / ready' : 'AI GUIDE / not connected';
  }
  stop.addEventListener('click', () => { cancel(true); document.querySelector('#command').focus(); });

  async function ask(question, block) {
    if (!ready) {
      text(block, 'p', 'The AI guide is not connected yet. Explore whoami, research, skills, or help.', 'hint');
      return;
    }
    const controller = new AbortController();
    const message = text(block, 'p', 'Thinking through your question…', 'assistant-answer hint');
    const request = { controller, message, timeout: null, timedOut: false };
    pending = request;
    request.timeout = setTimeout(() => { request.timedOut = true; controller.abort(); }, 45000);
    status.textContent = 'AI GUIDE / thinking';
    stop.hidden = false;
    output.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'omit', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: conversation, circuit: getCircuit() }),
      });
      const data = await response.json();
      if (pending !== request) return;
      if (!response.ok) {
        const errors = {
          daily_limit: 'Today’s shared AI allowance is used up. It resets at 00:00 UTC. Commands and the circuit still work.',
          visitor_limit: 'This network has reached today’s question limit. Try again after 00:00 UTC; commands still work.',
          rate_limit: `A little too fast. Try again in ${Number.isFinite(data.retry_after) ? Math.max(1, Math.min(60, data.retry_after)) : 60} seconds.`,
          invalid_question: 'Please keep your question between 1 and 1,200 characters.',
        };
        throw new Error(errors[data.error] || 'The AI guide is temporarily unavailable. Please try later, or use a command above.');
      }
      if (typeof data.answer !== 'string' || !data.answer.trim() || data.answer.length > 2400 || !Array.isArray(data.source_ids)) throw new Error('The AI guide returned an incomplete answer. Please try again.');
      message.textContent = data.answer;
      message.classList.remove('hint');
      const references = [...new Set(data.source_ids)].filter(id => typeof id === 'string' && Object.hasOwn(sources, id)).slice(0, 3);
      if (references.length) {
        const links = text(block, 'p', 'References: ', 'assistant-sources');
        references.forEach((id, index) => { if (index) text(links, 'span', ' / '); link(links, sources[id].label, sources[id].url); });
      }
      if (typeof data.action === 'string' && Object.hasOwn(actions, data.action)) {
        const button = text(block, 'button', `${actions[data.action].label} →`, 'assistant-action');
        button.type = 'button';
        button.addEventListener('click', () => {
          applyAction(actions[data.action]);
          button.textContent = 'Applied to the illustration ✓';
          button.disabled = true;
        });
      }
      text(block, 'p', 'AI-generated · Check personal and project details against the references.', 'assistant-note');
      conversation.push({ role: 'user', content: question }, { role: 'assistant', content: data.answer });
      while (conversation.length > 4 || conversation.reduce((size, item) => size + item.content.length, 0) > 4800) conversation.splice(0, 2);
    } catch (error) {
      if (pending !== request) return;
      message.textContent = request.timedOut ? 'The answer took too long. Please try again, or use a command above.' : error instanceof TypeError ? 'Could not reach the AI guide. Check your connection, or use a command above.' : error instanceof SyntaxError ? 'The AI guide returned an incomplete answer. Please try again.' : error.message;
      message.classList.add('hint');
    } finally {
      if (pending === request) {
        clearTimeout(request.timeout);
        pending = null;
        stop.hidden = true;
        output.removeAttribute('aria-busy');
        status.textContent = 'AI GUIDE / ready';
      }
    }
  }

  function clear() {
    cancel(); conversation = []; clearHistory();
    const block = entry('new conversation');
    text(block, 'p', 'Fresh context. Ask about the research, find a skill, or explore the circuit.', 'hint');
    output.scrollTop = 0;
  }
  document.querySelector('#new-conversation').addEventListener('click', () => { clear(); document.querySelector('#command').focus(); });
  return { ask, cancel, clear };
}
