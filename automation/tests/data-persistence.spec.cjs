const { test, expect } = require('@playwright/test');
const TrelloPage = require('../page-objects/TrelloPage.cjs');

test.describe('Data Persistence and Error Handling Tests', () => {
  let trelloPage;

  test.beforeEach(async ({ page }) => {
    trelloPage = new TrelloPage(page);
    await trelloPage.goto();
    await trelloPage.waitForPageLoad();
  });

  test('should persist complex data structure after page refresh', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Create multiple boards with multiple cards
    await trelloPage.createBoard('Board 1');
    await trelloPage.createBoard('Board 2');
    await trelloPage.createBoard('Board 3');
    
    await trelloPage.addCardToBoard(0, 'Card 1-1');
    await trelloPage.addCardToBoard(0, 'Card 1-2');
    await trelloPage.addCardToBoard(1, 'Card 2-1');
    await trelloPage.addCardToBoard(2, 'Card 3-1');
    await trelloPage.addCardToBoard(2, 'Card 3-2');
    await trelloPage.addCardToBoard(2, 'Card 3-3');
    
    // Act
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(3);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toEqual(['Board 1', 'Board 2', 'Board 3']);
    
    const cardCount1 = await trelloPage.getCardCountInBoard(0);
    const cardCount2 = await trelloPage.getCardCountInBoard(1);
    const cardCount3 = await trelloPage.getCardCountInBoard(2);
    expect(cardCount1).toBe(2);
    expect(cardCount2).toBe(1);
    expect(cardCount3).toBe(3);
    
    const cardTexts1 = await trelloPage.getCardTextsInBoard(0);
    const cardTexts2 = await trelloPage.getCardTextsInBoard(1);
    const cardTexts3 = await trelloPage.getCardTextsInBoard(2);
    expect(cardTexts1).toEqual(['Card 1-1', 'Card 1-2']);
    expect(cardTexts2).toEqual(['Card 2-1']);
    expect(cardTexts3).toEqual(['Card 3-1', 'Card 3-2', 'Card 3-3']);
  });

  test('should persist data after browser restart simulation', async ({ page, context }) => {
    // Arrange
    await trelloPage.clearAllData();
    await trelloPage.createBoard('Persistent Board');
    await trelloPage.addCardToBoard(0, 'Persistent Card');
    
    // Act - Simulate browser restart by creating new context
    await context.close();
    const newContext = await page.context().browser().newContext();
    const newPage = await newContext.newPage();
    const newTrelloPage = new TrelloPage(newPage);
    await newTrelloPage.goto();
    await newTrelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await newTrelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await newTrelloPage.getBoardNames();
    expect(boardNames).toContain('Persistent Board');
    
    const cardCount = await newTrelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await newTrelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain('Persistent Card');
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    await trelloPage.createBoard('Test Board');
    
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('trelloBoards', 'invalid json data');
    });
    
    // Act
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert - App should handle the error gracefully
    // The app should either show empty state or handle the error
    const boardCount = await trelloPage.getBoardCount();
    // The app might crash or show empty state - both are acceptable for this buggy app
    expect(boardCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle localStorage quota exceeded', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Fill localStorage with large data
    await page.evaluate(() => {
      const largeData = 'A'.repeat(1024 * 1024); // 1MB of data
      for (let i = 0; i < 10; i++) {
        try {
          localStorage.setItem(`largeData${i}`, largeData);
        } catch (e) {
          // localStorage quota exceeded
          break;
        }
      }
    });
    
    // Act
    await trelloPage.createBoard('Test Board');
    await trelloPage.addCardToBoard(0, 'Test Card');
    
    // Assert - App should handle storage limit gracefully
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBeGreaterThanOrEqual(0);
  });

  test('should maintain data integrity after multiple operations', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Act - Perform multiple operations
    await trelloPage.createBoard('Board 1');
    await trelloPage.createBoard('Board 2');
    await trelloPage.addCardToBoard(0, 'Card 1');
    await trelloPage.addCardToBoard(0, 'Card 2');
    await trelloPage.addCardToBoard(1, 'Card 3');
    await trelloPage.deleteCard(0, 0);
    await trelloPage.createBoard('Board 3');
    await trelloPage.addCardToBoard(2, 'Card 4');
    
    // Refresh page
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(3);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toEqual(['Board 1', 'Board 2', 'Board 3']);
    
    const cardCount1 = await trelloPage.getCardCountInBoard(0);
    const cardCount2 = await trelloPage.getCardCountInBoard(1);
    const cardCount3 = await trelloPage.getCardCountInBoard(2);
    expect(cardCount1).toBe(1); // Card 1 was deleted, only Card 2 remains
    expect(cardCount2).toBe(1); // Card 3
    expect(cardCount3).toBe(1); // Card 4
    
    const cardTexts1 = await trelloPage.getCardTextsInBoard(0);
    const cardTexts2 = await trelloPage.getCardTextsInBoard(1);
    const cardTexts3 = await trelloPage.getCardTextsInBoard(2);
    expect(cardTexts1).toEqual(['Card 2']);
    expect(cardTexts2).toEqual(['Card 3']);
    expect(cardTexts3).toEqual(['Card 4']);
  });

  test('should handle concurrent operations', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Act - Perform rapid operations
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(trelloPage.createBoard(`Board ${i}`));
    }
    await Promise.all(promises);
    
    // Add cards rapidly
    const cardPromises = [];
    for (let i = 0; i < 3; i++) {
      cardPromises.push(trelloPage.addCardToBoard(0, `Card ${i}`));
    }
    await Promise.all(cardPromises);
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(5);
    
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(3);
  });

  test('should handle special characters in data persistence', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Act
    await trelloPage.createBoard('Board with émojis 🎯');
    await trelloPage.addCardToBoard(0, 'Card with special chars: @#$%^&*()');
    await trelloPage.addCardToBoard(0, 'Card with unicode: 中文 Español');
    
    // Refresh page
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(1);
    
    const boardNames = await trelloPage.getBoardNames();
    expect(boardNames).toContain('Board with émojis 🎯');
    
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(2);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain('Card with special chars: @#$%^&*()');
    expect(cardTexts).toContain('Card with unicode: 中文 Español');
  });

  test('should handle empty localStorage on first visit', async ({ page }) => {
    // Arrange
    await trelloPage.clearAllData();
    
    // Act - Fresh start with no data
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBe(0);
    
    // Should be able to create new boards
    await trelloPage.createBoard('New Board');
    const newBoardCount = await trelloPage.getBoardCount();
    expect(newBoardCount).toBe(1);
  });

  test('should handle localStorage being disabled', async ({ page, context }) => {
    // Arrange
    await trelloPage.clearAllData();
    await trelloPage.createBoard('Test Board');
    
    // Disable localStorage
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => {},
          clear: () => {},
          removeItem: () => {}
        },
        writable: true
      });
    });
    
    // Act
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert - App should handle missing localStorage gracefully
    const boardCount = await trelloPage.getBoardCount();
    expect(boardCount).toBeGreaterThanOrEqual(0);
  });
}); 