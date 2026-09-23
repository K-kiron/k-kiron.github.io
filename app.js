'use strict';

const skills = [
  { name: 'RageClick', description: 'Break a local web app like an impatient user. Replay the failure.', url: 'https://github.com/K-kiron/RageClick', demo: 'https://k-kiron.github.io/RageClick/', action: 'Watch the demo' },
  { name: 'SkillClash', description: 'Find conflicting agent instructions and trace them to their source.', url: 'https://github.com/K-kiron/SkillClash' },
  { name: 'RepoQuest', description: 'Turn a reproducible bug into a playable debugging mystery.', url: 'https://github.com/K-kiron/RepoQuest', demo: 'https://k-kiron.github.io/RepoQuest/', action: 'Play the case' },
  { name: 'PaperCourt', description: 'Trace empirical ML claims to inspectable evidence.', url: 'https://github.com/K-kiron/PaperCourt' },
  { name: 'ProveIt', description: 'Check that a regression test fails without the fix.', url: 'https://github.com/K-kiron/ProveIt' },
];
const commands = ['whoami', 'research', 'skills', 'projects', 'help', 'trace rule', 'trace shortcut', 'ablate', 'reset', 'clear', ...skills.map(skill => `open ${skill.name.toLowerCase()}`)];
const output = document.querySelector('#output');
const input = document.querySelector('#command');
const graph = document.querySelector('#graph');
const history = [];
let historyIndex = 0;
let draft = '';
let path = 'rule';
let removed = false;
let selectedNode = 'rule';

function text(parent, tag, value, className) {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  parent.append(element);
  return element;
}
function link(parent, label, url) {
  const anchor = text(parent, 'a', label);
  anchor.href = url;
  return anchor;
}
function entry(command) {
  const block = document.createElement('div');
  block.className = 'entry';
  text(block, 'div', `visitor@k-kiron ~ $ ${command}`, 'command-line');
  output.replaceChildren(block);
  return block;
}
function run(raw) {
  const command = raw.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!command) return;
  history.push(raw.trim());
  if (history.length > 100) history.shift();
  historyIndex = history.length;
  draft = '';
  input.value = '';
  if (command === 'clear') { output.replaceChildren(); return; }
  const block = entry(raw.trim());
  if (command === 'whoami') {
    text(block, 'p', "I'm Wenhao XU, an AI/ML PhD student at Université de Montréal and Mila, working on rule alignment for language models.");
    text(block, 'p', 'I study how explicit rules shape model decisions. I also build open-source tools that make agent behavior easier to inspect and challenge.');
    link(block, 'GitHub ↗', 'https://github.com/K-kiron');
    text(block, 'span', ' / ');
    link(block, 'LinkedIn ↗', 'https://www.linkedin.com/in/k-kiron/');
  } else if (command === 'research') {
    text(block, 'p', 'DO THE RULES ACTUALLY DRIVE THE DECISION?', 'output-title');
    text(block, 'p', 'A correct answer is not enough to show that a model used the intended rule. I am interested in how models interpret rules, how rules influence decisions, and how we can investigate that influence.');
    text(block, 'p', 'AI Safety · Alignment · Trustworthy AI · Mechanistic Interpretability');
    text(block, 'p', 'Try the circuit: compare the two paths, then remove the rule. This is a small illustration of the question, not an experiment on a trained model.', 'hint');
  } else if (command === 'skills' || command === 'ls') {
    text(block, 'p', 'FIVE OPEN-SOURCE AGENT SKILLS', 'output-title');
    const list = document.createElement('ul'); block.append(list);
    skills.forEach(skill => {
      const item = document.createElement('li'); list.append(item);
      link(item, `${skill.name} ↗`, skill.url);
      text(item, 'span', skill.description);
      if (skill.demo) link(item, `${skill.action} →`, skill.demo);
    });
  } else if (command.startsWith('open ')) {
    const name = command.slice(5);
    const skill = skills.find(item => item.name.toLowerCase() === name || (name === 'prove-it' && item.name === 'ProveIt'));
    if (skill) { text(block, 'p', skill.description); link(block, `Open ${skill.name} on GitHub ↗`, skill.url); }
    else text(block, 'p', 'Unknown project. Run skills to see the available repositories.', 'hint');
  } else if (command === 'projects') {
    link(block, 'TaxAgent ↗', 'https://github.com/K-kiron/TaxAgent');
    text(block, 'p', 'Local tax preparation for bounded Quebec and federal salary/student cases.');
    link(block, 'ReviewBudget ↗', 'https://github.com/K-kiron/ReviewBudget');
    text(block, 'p', 'Pull request verification planning with named checks, costs, and budgets.');
  } else if (command === 'help') {
    const list = document.createElement('ul'); block.append(list);
    [ ['whoami', 'Researcher and builder, Montreal.'], ['research', 'The questions behind my work.'], ['skills', 'Five skills, their repositories, and demos.'], ['open <skill>', 'Get a link to a skill repository.'], ['projects', 'Other open-source work.'], ['trace rule / trace shortcut', 'Switch the illustrative circuit path.'], ['ablate', 'Remove or restore the rule.'], ['reset', 'Reset the circuit.'], ['clear', 'Clear this terminal.'] ].forEach(([name, description])=>{const item=text(list,'li',name);text(item,'span',description);});
  } else if (command === 'trace rule' || command === 'trace shortcut') {
    path = command.split(' ')[1]; selectedNode = path === 'rule' ? 'apply' : 'match'; renderCircuit();
    text(block, 'p', `Tracing the ${path === 'rule' ? 'rule-driven' : 'shortcut-driven'} path. Try ablate to remove the rule.`, 'hint');
  } else if (command === 'ablate') {
    removed = !removed; renderCircuit(); text(block, 'p', resultText(), 'hint');
  } else if (command === 'reset') {
    path = 'rule'; removed = false; selectedNode = 'rule'; renderCircuit(); text(block, 'p', 'Circuit reset. Rule present → decision A.', 'hint');
  } else text(block, 'p', `Unknown command: ${raw.trim()}. Try help.`, 'hint');
  output.scrollTop = 0;
}

function resultText() {
  if (!removed) return 'Rule present → decision A';
  return path === 'rule' ? 'Rule removed → decision changes to B' : 'Rule removed → decision stays A';
}
function renderCircuit() {
  graph.dataset.path = path;
  graph.classList.toggle('rule-removed', removed);
  document.querySelectorAll('[data-path]').forEach(button => { if(button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.path === path)); });
  document.querySelectorAll('[data-node]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.node===selectedNode)));
  const changed = removed && path === 'rule';
  document.querySelector('.node-answer .node-dot').textContent = changed ? 'B' : 'A';
  document.querySelector('#answer-label').textContent = changed ? 'Decision B' : 'Decision A';
  const removeButton = document.querySelector('#remove-rule');
  removeButton.setAttribute('aria-pressed', String(removed));
  removeButton.textContent = removed ? '↺ Restore rule' : '⊘ Remove rule';
  document.querySelector('#result').textContent = resultText();
  const descriptions = {
    rule: ['RULE / INPUT', removed ? 'The explicit rule is removed. Compare the two paths: only the rule-driven decision changes in this illustration.' : 'An explicit instruction. Does it change the decision, or is the model following a shortcut?'],
    context: ['CONTEXT / INPUT', 'Information about the task. The circuit separates this background context from the rule and a surface cue.'],
    cue: ['SURFACE CUE / INPUT', 'A superficial pattern can lead to the same answer as the rule. A matching output alone does not reveal which signal was used.'],
    apply: ['APPLY RULE / PROCESS', 'In this illustrative path, the rule drives the decision. Remove it and the output changes from A to B.'],
    match: ['MATCH PATTERN / PROCESS', 'In this illustrative shortcut, a surface cue drives the answer. Removing the explicit rule leaves the output unchanged.'],
    answer: ['DECISION / OUTPUT', changed ? 'The rule-driven output changed after the rule was removed. This contrast illustrates a causal question; it is not evidence about a real model.' : 'Both paths can produce decision A. Intervening on the rule reveals a difference that the answer alone cannot show.'],
  };
  document.querySelector('#node-title').textContent = descriptions[selectedNode][0];
  document.querySelector('#node-description').textContent = descriptions[selectedNode][1];
}

document.querySelector('#command-form').addEventListener('submit',event=>{event.preventDefault();run(input.value);});
document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>run(button.dataset.command)));
document.querySelectorAll('button[data-path]').forEach(button=>button.addEventListener('click',()=>{path=button.dataset.path;selectedNode=path==='rule'?'apply':'match';renderCircuit();}));
document.querySelectorAll('[data-node]').forEach(button=>button.addEventListener('click',()=>{selectedNode=button.dataset.node;renderCircuit();}));
document.querySelector('#remove-rule').addEventListener('click',()=>{removed=!removed;renderCircuit();});
input.addEventListener('keydown',event=>{
  if(event.key==='Tab' && input.value.trim()) {
    const matches=commands.filter(command=>command.startsWith(input.value.toLowerCase().trim()));
    if(matches.length===1){event.preventDefault();input.value=matches[0];}
  }
  if(event.key==='ArrowUp' && history.length){event.preventDefault();if(historyIndex===history.length)draft=input.value;historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex];}
  if(event.key==='ArrowDown' && history.length){event.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=historyIndex===history.length?draft:history[historyIndex];}
});
renderCircuit();
if(['research','skills','projects','help'].includes(location.hash.slice(1)))run(location.hash.slice(1));
