class TrelloPage {
  constructor(page) {
    this.page = page;
    
    // Board elements
    this.boardInput = page.locator('input[placeholder="Board name"]');
    this.addBoardButton = page.locator('button:has-text("Add Board")');
    this.boardCards = page.locator('div[style*="width: 256px"]');
    this.boardTitles = page.locator('h2[style*="font-weight: 600"]');
    
    // Card elements
    this.cardInputs = page.locator('input[placeholder="Card text"]');
    this.addCardButtons = page.locator('button:has-text("+ Add Card")');
    this.cardItems = page.locator('li[style*="background-color: #f9fafb"]');
    this.deleteCardButtons = page.locator('button[style*="color: #ef4444"]');
    
    // Page elements
    this.pageTitle = page.locator('h1:has-text("Buggy Trello Clone")');
  }

  /**
   * Navigate to the application
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Create a new board
   * @param {string} boardName - Name of the board to create
   */
  async createBoard(boardName) {
    await this.boardInput.fill(boardName);
    await this.addBoardButton.click();
  }

  /**
   * Get the number of boards currently displayed
   * @returns {Promise<number>} Number of boards
   */
  async getBoardCount() {
    return await this.boardCards.count();
  }

  /**
   * Get all board names
   * @returns {Promise<string[]>} Array of board names
   */
  async getBoardNames() {
    const names = [];
    const count = await this.boardTitles.count();
    for (let i = 0; i < count; i++) {
      names.push(await this.boardTitles.nth(i).textContent());
    }
    return names;
  }

  /**
   * Add a card to a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @param {string} cardText - Text for the card
   */
  async addCardToBoard(boardIndex, cardText) {
    const cardInput = this.cardInputs.nth(boardIndex);
    const addCardButton = this.addCardButtons.nth(boardIndex);
    
    await cardInput.fill(cardText);
    await addCardButton.click();
  }

  /**
   * Get the number of cards in a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @returns {Promise<number>} Number of cards in the board
   */
  async getCardCountInBoard(boardIndex) {
    const board = this.boardCards.nth(boardIndex);
    return await board.locator('li[style*="background-color: #f9fafb"]').count();
  }

  /**
   * Get all card texts in a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @returns {Promise<string[]>} Array of card texts
   */
  async getCardTextsInBoard(boardIndex) {
    const board = this.boardCards.nth(boardIndex);
    const cards = board.locator('li[style*="background-color: #f9fafb"] span');
    const texts = [];
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      texts.push(await cards.nth(i).textContent());
    }
    return texts;
  }

  /**
   * Delete a card from a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @param {number} cardIndex - Index of the card (0-based)
   */
  async deleteCard(boardIndex, cardIndex) {
    const board = this.boardCards.nth(boardIndex);
    const deleteButton = board.locator('button[style*="color: #ef4444"]').nth(cardIndex);
    await deleteButton.click();
  }

  /**
   * Check if board input field is empty
   * @returns {Promise<boolean>} True if empty, false otherwise
   */
  async isBoardInputEmpty() {
    const value = await this.boardInput.inputValue();
    return value === '';
  }

  /**
   * Check if card input field is empty for a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @returns {Promise<boolean>} True if empty, false otherwise
   */
  async isCardInputEmpty(boardIndex) {
    const cardInput = this.cardInputs.nth(boardIndex);
    const value = await cardInput.inputValue();
    return value === '';
  }

  /**
   * Try to create a board with empty name
   * @returns {Promise<string|null>} Alert message if any, null otherwise
   */
  async tryCreateBoardWithEmptyName() {
    const [alert] = await Promise.all([
      this.page.waitForEvent('dialog'),
      this.addBoardButton.click()
    ]);
    return alert.message();
  }

  /**
   * Try to add a card with empty text
   * @param {number} boardIndex - Index of the board (0-based)
   * @returns {Promise<string|null>} Alert message if any, null otherwise
   */
  async tryAddCardWithEmptyText(boardIndex) {
    const addCardButton = this.addCardButtons.nth(boardIndex);
    const [alert] = await Promise.all([
      this.page.waitForEvent('dialog'),
      addCardButton.click()
    ]);
    return alert.message();
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  /**
   * Clear all data by clearing localStorage
   */
  async clearAllData() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Get the current board input value
   * @returns {Promise<string>} Current value in board input
   */
  async getBoardInputValue() {
    return await this.boardInput.inputValue();
  }

  /**
   * Get the current card input value for a specific board
   * @param {number} boardIndex - Index of the board (0-based)
   * @returns {Promise<string>} Current value in card input
   */
  async getCardInputValue(boardIndex) {
    const cardInput = this.cardInputs.nth(boardIndex);
    return await cardInput.inputValue();
  }
}

module.exports = TrelloPage; 