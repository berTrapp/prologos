export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'chore',
        'ci',
        'revert',
      ],
    ],
    // Descriptions are written in Portuguese, so proper nouns and acronyms are allowed.
    'subject-case': [0],
  },
};
