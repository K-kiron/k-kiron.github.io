// Curated public facts. Keep private notes and unpublished research out of this file.
export const sources = {
  profile: { label: 'Public profile', url: 'https://github.com/K-kiron', facts: 'Wenhao XU is an AI/ML PhD student at Université de Montréal and Mila, based in Montreal. He works on rule alignment for language models. Interests: AI Safety, Alignment, Trustworthy AI, and Mechanistic Interpretability. He studies whether explicit rules actually influence model decisions, and builds open-source agent skills.' },
  contact: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/k-kiron/', facts: 'Public contact link. No statement about availability for work or collaboration is provided.' },
  rageclick: { label: 'RageClick', url: 'https://github.com/K-kiron/RageClick', facts: 'A skill for breaking a local web app like an impatient user and replaying the failure.' },
  skillclash: { label: 'SkillClash', url: 'https://github.com/K-kiron/SkillClash', facts: 'A skill for finding conflicting agent instructions and tracing them to their source.' },
  repoquest: { label: 'RepoQuest', url: 'https://github.com/K-kiron/RepoQuest', facts: 'A skill for turning a reproducible bug into a playable debugging mystery.' },
  papercourt: { label: 'PaperCourt', url: 'https://github.com/K-kiron/PaperCourt', facts: 'A skill for tracing empirical ML claims to inspectable evidence.' },
  proveit: { label: 'ProveIt', url: 'https://github.com/K-kiron/ProveIt', facts: 'A skill for checking that a regression test fails without the fix.' },
  taxagent: { label: 'TaxAgent', url: 'https://github.com/K-kiron/TaxAgent', facts: 'Local tax preparation for bounded Quebec and federal salary/student cases.' },
  reviewbudget: { label: 'ReviewBudget', url: 'https://github.com/K-kiron/ReviewBudget', facts: 'Pull request verification planning with named checks, costs, and budgets.' },
  circuit: { label: 'Circuit illustration', url: 'https://k-kiron.github.io/#circuit-title', facts: 'This hand-designed illustration is not a trained model, an experiment, or a research result. Both paths initially output A. Removing the rule changes the rule-driven output to B, while the shortcut-driven output remains A. Matching outputs alone do not identify which signal caused the decision. This is a conceptual illustration, not proof that ablation identifies all real model reasoning.' },
};

export const actions = {
  trace_rule: { label: 'Explore the rule-driven path', path: 'rule', removed: false },
  trace_shortcut: { label: 'Explore the shortcut-driven path', path: 'shortcut', removed: false },
  ablate_rule: { label: 'Remove the rule · rule-driven path', path: 'rule', removed: true },
  ablate_shortcut: { label: 'Remove the rule · shortcut path', path: 'shortcut', removed: true },
  restore_rule: { label: 'Restore the rule', removed: false },
  reset: { label: 'Reset the illustration', path: 'rule', removed: false },
};
