/** @type {import('eslint').Linter.FlatConfig} */
module.exports = [
  {
    files: ['*.js','*.ts', '*.vue'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Define global variables here
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {
      // Add specific rules or overrides here
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'vue/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
      // Include more rules as needed
    },
    settings: {
      vue: {
        version: 'detect'
      }
    }
  },
  {
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
    rules: {
      // Cypress specific rules
      'cypress/no-unnecessary-waiting': 'warn',
      'cypress/assertion-before-screenshot': 'warn'
    }
  }
]
