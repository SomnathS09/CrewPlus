# Contributing to CrewPlus

Thank you for your interest in contributing to the CrewPlus Retail Ordering Portal!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CrewPlus.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Set up the development environment (see README.md)

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
node seed.js
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your settings
npm start
```

## Code Style

### Backend (Node.js)
- Use ES6+ features
- Async/await for asynchronous operations
- Clear function and variable names
- Comments for complex logic
- Error handling with try-catch
- Express Router for routes

### Frontend (React)
- Functional components with hooks
- Clear component names
- CSS modules or separate CSS files
- Props validation
- Error boundaries for error handling

## Testing

### Writing Tests
- Add tests for new features
- Ensure existing tests pass
- Aim for good coverage

### Running Tests
```bash
cd backend
npm test

cd frontend
npm test
```

## Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where needed
   - Update documentation

3. **Test your changes**
   - Run existing tests
   - Add new tests for new features
   - Test manually in browser

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## Commit Message Format

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add user authentication
fix: resolve cart calculation error
docs: update API documentation
```

## Pull Request Process

1. **Update documentation** - If you've changed APIs or functionality
2. **Update tests** - Ensure all tests pass
3. **Update README** - If needed for new features
4. **Create Pull Request**:
   - Use a clear title
   - Describe what changed and why
   - Reference any related issues
   - Add screenshots for UI changes

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #issue_number
```

## Areas for Contribution

### High Priority
- [ ] User authentication (JWT)
- [ ] Email notifications
- [ ] Order history
- [ ] Admin dashboard
- [ ] Payment integration

### Medium Priority
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Advanced search
- [ ] Product categories management
- [ ] Order status tracking

### Low Priority
- [ ] Product reviews
- [ ] Promotional codes
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA features

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation updates
- Breaking changes
- Performance implications

## Bug Reports

### Before Submitting
- Check existing issues
- Try to reproduce on latest version
- Collect relevant information

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Node version: [e.g., 18.0.0]
```

## Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other relevant information
```

## Project Structure

Understand the project structure before contributing:
```
backend/
  config/     - Configuration files
  middleware/ - Express middleware
  models/     - Database models
  routes/     - API routes
  tests/      - Test files
  
frontend/
  components/ - React components
  pages/      - Page components
  services/   - API services
  utils/      - Helper functions
```

## Environment Variables

Never commit:
- `.env` files
- API keys
- Passwords
- Connection strings

Always use:
- `.env.example` as template
- Environment variables for secrets
- Configuration files for non-secrets

## Documentation

When adding features, update:
- README.md - If it affects setup or usage
- docs/API.md - For API changes
- docs/ARCHITECTURE.md - For structural changes
- Code comments - For complex logic
- Inline documentation - For functions and components

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Open a new issue with the "question" label
- Reach out to maintainers

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement
Instances of unacceptable behavior may be reported to the project team.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Thank You!

Thank you for contributing to CrewPlus! Your efforts help make this project better for everyone.
