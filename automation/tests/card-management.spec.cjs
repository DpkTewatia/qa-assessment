const { test, expect } = require('@playwright/test');
const TrelloPage = require('../page-objects/TrelloPage.cjs');

test.describe('Card Management Tests', () => {
  let trelloPage;

  test.beforeEach(async ({ page }) => {
    trelloPage = new TrelloPage(page);
    await trelloPage.goto();
    await trelloPage.waitForPageLoad();
    await trelloPage.clearAllData();
    
    // Create a test board for card operations
    await trelloPage.createBoard('Test Board');
  });

  test('should add a card to board successfully', async () => {
    // Arrange
    const cardText = 'Test Card';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(cardText);
  });

  test('should add multiple cards to the same board', async () => {
    // Arrange
    const cardTexts = ['Card 1', 'Card 2', 'Card 3'];
    
    // Act
    for (const cardText of cardTexts) {
      await trelloPage.addCardToBoard(0, cardText);
    }
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(3);
    
    const actualCardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(actualCardTexts).toEqual(cardTexts);
  });

  test('should add cards to different boards', async () => {
    // Arrange
    await trelloPage.createBoard('Second Board');
    const card1 = 'Card in Board 1';
    const card2 = 'Card in Board 2';
    
    // Act
    await trelloPage.addCardToBoard(0, card1);
    await trelloPage.addCardToBoard(1, card2);
    
    // Assert
    const cardCount1 = await trelloPage.getCardCountInBoard(0);
    const cardCount2 = await trelloPage.getCardCountInBoard(1);
    expect(cardCount1).toBe(1);
    expect(cardCount2).toBe(1);
    
    const cardTexts1 = await trelloPage.getCardTextsInBoard(0);
    const cardTexts2 = await trelloPage.getCardTextsInBoard(1);
    expect(cardTexts1).toContain(card1);
    expect(cardTexts2).toContain(card2);
  });

  test('should delete a card from board', async () => {
    // Arrange
    await trelloPage.addCardToBoard(0, 'Card to Delete');
    await trelloPage.addCardToBoard(0, 'Card to Keep');
    
    // Act
    await trelloPage.deleteCard(0, 0);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain('Card to Keep');
    expect(cardTexts).not.toContain('Card to Delete');
  });

  test('should show alert when adding card with empty text', async () => {
    // Act
    const alertMessage = await trelloPage.tryAddCardWithEmptyText(0);
    
    // Assert
    expect(alertMessage).toBe('Card text required');
    
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(0);
  });

  test('should allow adding card with special characters', async () => {
    // Arrange
    const cardText = 'Card@#$%^&*()';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(cardText);
  });

  test('should allow adding card with numbers only', async () => {
    // Arrange
    const cardText = '12345';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(cardText);
  });

  test('should allow adding card with single character', async () => {
    // Arrange
    const cardText = 'A';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(cardText);
  });

  test('should handle very long card text', async () => {
    // Arrange
    const longCardText = 'A'.repeat(200);
    
    // Act
    await trelloPage.addCardToBoard(0, longCardText);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(longCardText);
  });

  test('should persist cards after page refresh', async ({ page }) => {
    // Arrange
    const cardText = 'Persistent Card';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    await page.reload();
    await trelloPage.waitForPageLoad();
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(1);
    
    const cardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(cardTexts).toContain(cardText);
  });

  test('should not clear card input after adding card', async () => {
    // Arrange
    const cardText = 'Test Card';
    
    // Act
    await trelloPage.addCardToBoard(0, cardText);
    
    // Assert
    const inputValue = await trelloPage.getCardInputValue(0);
    expect(inputValue).toBe(cardText); // This is actually a bug - input should be cleared
  });

  test('should delete multiple cards in sequence', async () => {
    // Arrange
    const cardTexts = ['Card 1', 'Card 2', 'Card 3', 'Card 4'];
    for (const cardText of cardTexts) {
      await trelloPage.addCardToBoard(0, cardText);
    }
    
    // Act
    await trelloPage.deleteCard(0, 1); // Delete second card
    await trelloPage.deleteCard(0, 2); // Delete fourth card (now at index 2)
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(2);
    
    const remainingCardTexts = await trelloPage.getCardTextsInBoard(0);
    expect(remainingCardTexts).toContain('Card 1');
    expect(remainingCardTexts).toContain('Card 3');
    expect(remainingCardTexts).not.toContain('Card 2');
    expect(remainingCardTexts).not.toContain('Card 4');
  });

  test('should handle deleting all cards from board', async () => {
    // Arrange
    await trelloPage.addCardToBoard(0, 'Card 1');
    await trelloPage.addCardToBoard(0, 'Card 2');
    
    // Act
    await trelloPage.deleteCard(0, 0);
    await trelloPage.deleteCard(0, 0);
    
    // Assert
    const cardCount = await trelloPage.getCardCountInBoard(0);
    expect(cardCount).toBe(0);
  });
}); 