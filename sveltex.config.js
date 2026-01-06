import { sveltex } from '@nvl/sveltex';

export default await sveltex(
  {
    markdownBackend: 'unified',
    mathBackend: 'mathjax'
  },
  {
    extensions: ['.sveltex'],

    math: {
      css: {
        type: 'hybrid',
        cdn: 'jsdelivr'
      },
      outputFormat: 'svg',
      mathjax: {}
    }
  }
);
