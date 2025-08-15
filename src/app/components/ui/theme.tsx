import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from '@chakra-ui/react';

const headingRecipe = defineRecipe({
  variants: {
    variant: {
      'section-title': {
        textDecoration: 'underline',
        textUnderlineOffset: '6px',
        textDecorationColor: '#525252',
        textDecorationThickness: '4px',
        marginTop: '3',
        marginBottom: '4',
        fontSize: '20px',
      },
    },
  },
});

const linkRecipe = defineRecipe({
  base: { textUnderlineOffset: '3px' },
});

const config = defineConfig({
  theme: {
    tokens: {
      colors: { glassTeal: { value: '#88ccca' } },
      fonts: {
        heading: { value: "'M PLUS Rounded 1c', system-ui, sans-serif" },
      },
    },
    recipes: {
      heading: headingRecipe,
      link: linkRecipe,
    },
  },
});

const system = createSystem(defaultConfig, config);
export default system;
