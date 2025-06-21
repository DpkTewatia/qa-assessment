# Automation Framework for Buggy Trello Clone

This directory contains automated tests for the Buggy Trello Clone application using Playwright, a modern end-to-end testing framework.

## 🏗️ Project Structure

```
automation/
├── README.md                 # This file
├── page-objects/
│   └── TrelloPage.cjs       # Page Object Model for the application
└── tests/
    ├── board-management.spec.cjs    # Board management test flows
    ├── card-management.spec.cjs     # Card management test flows
    └── data-persistence.spec.cjs    # Data persistence and error handling tests
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- The application should be running on `http://localhost:5173`

### Installation

1. **Install Playwright** (already done in the main project):
   ```bash
   npm install --save-dev @playwright/test
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Start the application** (if not already running):
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Tests in Specific Browser
```bash
# Chrome
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Run Specific Test File
```bash
# Board management tests only
npx playwright test board-management.spec.cjs

# Card management tests only
npx playwright test card-management.spec.cjs

# Data persistence tests only
npx playwright test data-persistence.spec.cjs
```

### Run Tests in Headed Mode (with browser visible)
```bash
npx playwright test --headed
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests with Codegen (record new tests)
```bash
npx playwright codegen http://localhost:5173
```

## 📊 Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Generate Report
```bash
npx playwright test --reporter=html
```

## 🎯 Test Coverage

### 1. Board Management Tests (`board-management.spec.cjs`)
- ✅ Create new boards
- ✅ Create multiple boards
- ✅ Validation for empty board names
- ✅ Special characters in board names
- ✅ Duplicate board names
- ✅ Data persistence after page refresh
- ✅ Long board names
- ✅ Input field behavior (bug verification)

### 2. Card Management Tests (`card-management.spec.cjs`)
- ✅ Add cards to boards
- ✅ Add multiple cards to same board
- ✅ Add cards to different boards
- ✅ Delete cards from boards
- ✅ Validation for empty card text
- ✅ Special characters in card text
- ✅ Data persistence after page refresh
- ✅ Input field behavior (bug verification)
- ✅ Multiple card deletions

### 3. Data Persistence Tests (`data-persistence.spec.cjs`)
- ✅ Complex data structure persistence
- ✅ Browser restart simulation
- ✅ Corrupted localStorage handling
- ✅ localStorage quota exceeded
- ✅ Data integrity after multiple operations
- ✅ Concurrent operations
- ✅ Special characters and unicode
- ✅ Empty localStorage handling
- ✅ Disabled localStorage handling

## 🐛 Known Bugs Being Tested

The automation framework specifically tests for the following known bugs:

1. **Input Field Not Cleared After Submission**
   - Board input retains value after board creation
   - Card input retains value after card creation

2. **Missing Board Deletion Functionality**
   - No way to delete boards (feature gap)

3. **No Input Validation for Duplicate Board Names**
   - Multiple boards can be created with identical names

4. **Missing Error Handling for localStorage**
   - Application may crash with corrupted localStorage

5. **No Confirmation for Card Deletion**
   - Cards are deleted immediately without confirmation

## 🏗️ Page Object Model

The `TrelloPage.cjs` file implements the Page Object Model pattern, providing:

### Key Methods:
- `goto()` - Navigate to the application
- `createBoard(boardName)` - Create a new board
- `addCardToBoard(boardIndex, cardText)` - Add card to specific board
- `deleteCard(boardIndex, cardIndex)` - Delete card from board
- `getBoardCount()` - Get number of boards
- `getCardCountInBoard(boardIndex)` - Get number of cards in board
- `clearAllData()` - Clear localStorage data
- `waitForPageLoad()` - Wait for page to load completely

### Error Handling Methods:
- `tryCreateBoardWithEmptyName()` - Test empty board name validation
- `tryAddCardWithEmptyText(boardIndex)` - Test empty card text validation

## 🔧 Configuration

The `playwright.config.js` file in the root directory configures:

- **Test Directory**: `./automation/tests`
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Web Server**: Automatically starts `npm run dev`
- **Reporting**: HTML reports with screenshots and videos on failure
- **Retries**: 2 retries on CI, 0 locally

## 🚨 Troubleshooting

### Common Issues:

1. **Application not running**:
   ```bash
   npm run dev
   ```

2. **Port already in use**:
   - The config will automatically try port 5174 if 5173 is busy

3. **Tests failing due to timing**:
   - Increase timeout in `playwright.config.js`
   - Add explicit waits in test code

4. **Browser not found**:
   ```bash
   npx playwright install
   ```

### Debug Mode:
```bash
npx playwright test --debug
```

## 📈 Continuous Integration

The framework is ready for CI/CD integration:

```yaml
# Example GitHub Actions workflow
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run dev &
    - run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 🤝 Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use the Page Object Model for all interactions
3. Include both positive and negative test cases
4. Add appropriate assertions
5. Document any new bugs discovered

## 📝 Notes

- Tests are designed to be independent and can run in any order
- Each test cleans up its own data using `clearAllData()`
- The framework automatically handles browser startup/shutdown
- Screenshots and videos are captured on test failures
- Tests run in parallel by default for faster execution 