import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../backend/docs/swagger.json',
  output: {
    case: 'camelCase',
    format: 'prettier',
    lint: 'eslint',
    path: 'src/shared/api/gen',
  },
});
