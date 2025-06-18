Contributing to Prisma Canvas
Thank you for your interest in contributing to Prisma Canvas, an open-source tool for visually designing Prisma schemas with a drag-and-drop interface! We welcome contributions from the community, whether it's reporting bugs, suggesting features, or submitting code changes. This guide outlines how you can contribute effectively.
Table of Contents

Code of Conduct
How to Contribute
Reporting Bugs
Suggesting Features
Submitting Pull Requests


Development Setup
Prerequisites
Setting Up the Project
Running the Project
Testing


Code Guidelines
License

Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct. Please ensure a respectful and inclusive environment for everyone. (Note: If a CODE_OF_CONDUCT.md file doesn’t exist, you may want to create one or remove this reference.)
How to Contribute
Reporting Bugs
If you find a bug, please open an issue on the GitHub Issues page with the following details:

A clear title describing the issue.
Steps to reproduce the bug.
Expected and actual behavior.
Screenshots or code snippets, if applicable.
Environment details (e.g., Node.js version, browser, OS).

Use the "Bug Report" issue template if available.
Suggesting Features
We love hearing ideas for improving Prisma Canvas! To suggest a feature:

Open an issue on the GitHub Issues page.
Use the "Feature Request" issue template if available.
Describe the feature, its use case, and why it would benefit users.
Add a 👍 reaction to existing feature requests to show support.

Submitting Pull Requests
To contribute code, follow these steps:

Fork the Repository:

Fork the prisma-schema-canvas-main repository to your GitHub account.


Clone and Branch:

Clone your fork:git clone https://github.com/YOUR_USERNAME/prisma-schema-canvas-main.git
cd prisma-schema-canvas-main


Create a feature branch:git checkout -b feature/your-feature-name




Make Changes:

Follow the Code Guidelines.
Ensure your changes align with the project’s goals (e.g., improving the visual schema editor or adding new features).


Test Your Changes:

Run tests (if available) to ensure your changes don’t break existing functionality.
Test locally with npm run dev to verify the app works as expected.


Commit and Push:

Write clear, concise commit messages (e.g., Add support for schema import validation).
Push your branch:git push origin feature/your-feature-name




Open a Pull Request:

Go to the repository and create a pull request from your branch.
Use the pull request template (if available) and include:
A description of your changes.
Reference to any related issues (e.g., Fixes #123).
Screenshots or videos for UI changes.


Ensure all CI checks (e.g., linting, tests) pass.


Respond to Feedback:

Be open to code review feedback and make necessary updates.
Once approved, your changes will be merged!



Development Setup
Prerequisites

Node.js: Version 18.x or higher (recommended: 20.x for Vercel compatibility).
npm: Version 8.x or higher.
Git: For cloning and managing the repository.
A code editor like VS Code with the following extensions (optional):
ESLint
Prettier
TypeScript



Setting Up the Project

Clone the Repository:
git clone https://github.com/udaypankhaniya/prisma-schema-canvas-main.git
cd prisma-schema-canvas-main


Install Dependencies:
npm install


Configure Environment Variables:

Copy .env.example to .env.local (if available) and fill in any required variables (e.g., DATABASE_URL for Prisma integration).
If no .env.example exists, check the documentation for required variables.



Running the Project

Start the development server:
npm run dev


Open http://localhost:5173 (or the port specified by Vite) to view the app.

Make changes and test in your browser.

Build for production:
npm run build


Preview the production build:
npm run preview



Testing

Run linting to check code style:
npm run lint


If tests are available (e.g., using Jest or Vitest), run:
npm test

(Note: If no test suite exists, consider adding tests for your contributions.)

For UI changes, manually test the drag-and-drop interface, schema preview, and export functionality to ensure they work as expected.


Code Guidelines

Code Style:

Follow the existing ESLint and Prettier configurations (see .eslintrc and .prettierrc).
Use TypeScript for type safety.
Write clean, modular React components using functional components and hooks.


File Structure:

Place new components in src/components/ or appropriate subfolders (e.g., src/components/ui/ for UI components).
Add new features to relevant directories (e.g., src/features/ if applicable).


Commits:

Use descriptive commit messages (e.g., fix: resolve schema export bug or feat: add dark mode toggle).
Follow conventional commits if enforced by the project.


Dependencies:

Avoid adding new dependencies unless necessary. If needed, justify their inclusion in your pull request.
Ensure compatibility with existing dependencies (see package.json).


Prisma Integration:

If contributing to schema-related features, ensure compatibility with Prisma’s schema syntax (.prisma files).
Test schema generation and import/export functionality thoroughly.
Refer to Prisma’s documentation for schema best practices.



License
Prisma Canvas is licensed under the MIT License. By contributing, you agree to license your contributions under the same license.

Thank you for helping make Prisma Canvas better! If you have questions, join our community (e.g., via GitHub Discussions or Discord, if available) or open an issue for assistance.
