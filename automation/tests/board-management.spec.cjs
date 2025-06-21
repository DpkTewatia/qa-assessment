const { test, expect } = require('@playwright/test');
const TrelloPage = require('../page-objects/TrelloPage.cjs');

test.describe('Board Management Tests', () => {
  let trelloPage;

  test.beforeEach(async ({ page }) => {
    trelloPage = new TrelloPage(page);
    await trelloPage.goto();
    await trelloPage.waitForPageLoad();
    await trelloPage.clearAllData();
  });

  test('should create a new board successfully', async () => {
    // Arrange
    const boardName = 'Test Board';
    
    // Act
    await trelloPage.createBoard(boardName);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain(boardName);
  });

  test('should create multiple boards', async () => {
    // Arrange
    const boardNames = ['Board 1', 'Board 2', 'Board 3'];
    
    // Act
    for (const boardName of boardNames) {
      await trelloPage.createBoard(boardName);
    }
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(3);
    
    const actualBoardNames = await trelloPage.getBoardNames();
    expect(actualBoardNames).toEqual(boardNames);
  });

  test('should show alert when creating board with empty name', async () => {
    // Act
    const alertMessage = await trelloPage.tryCreateBoardWithEmptyName();
    
    // Assert
    expect(alertMessage).toBe('Board name required');
    
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(0);
  });

  test('should allow creating board with special characters', async () => {
    // Arrange
    const boardName = 'Board@#$%^&*()';
    
    // Act
    await trelloPage.createBoard(boardName);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain(boardName);
  });

  test('should allow creating board with numbers', async () => {
    // Arrange
    const boardName = '12345';
    
    // Act
    await trelloPage.createBoard(boardName);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain(boardName);
  });

  test('should allow creating duplicate board names', async () => {
    // Arrange
    const boardName = 'Duplicate Board';
    
    // Act
    await trelloPage.createBoard(boardName);
    await trelloPage.createBoard(boardName);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(2);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toEqual([boardName, boardName]);
  });

  test('should persist boards after page refresh', async ({ page }) => {
    // Arrange
    const boardName = 'Persistent Board';
    
    // Act
    await trelloPage.createBoard(boardName);
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain(boardName);
  });

  test('should handle very long board names', async () => {
    // Arrange
    const longBoardName = 'A'.repeat(100);
    
    // Act
    await trelloPage.createBoard(longBoardName);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain(longBoardName);
  });

  test('should not clear board input after creating board', async () => {
    // Arrange
    const boardName = 'Test Board';
    
    // Act
    await trelloPage.createBoard(boardName);
    
    // Assert
    const inputValue = await trelloPage.getBoardInputValue();
    expect(inputValue).toBe(boardName); // This is actually a bug - input should be cleared
  });
}); 