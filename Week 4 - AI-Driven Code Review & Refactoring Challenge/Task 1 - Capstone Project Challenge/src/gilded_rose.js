// Constants for magic numbers and strings
const MAX_QUALITY = 50;
const MIN_QUALITY = 0;
const BACKSTAGE_PASS_10_DAY = 11;
const BACKSTAGE_PASS_5_DAY = 6;

const ITEM_AGED_BRIE = 'Aged Brie';
const ITEM_BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert';
const ITEM_SULFURAS = 'Sulfuras, Hand of Ragnaros';

/**
 * @module gilded_rose
 *
 * @overview
 * This module implements the Gilded Rose inventory system, which updates the quality and sell-in values of various items according to specific business rules.
 *
 * - Each item has a name, a sell-in value (days to sell), and a quality value.
 * - Different item types have different update rules, handled by dedicated updater classes.
 * - The Shop class manages a collection of items and updates them all at once.
 *
 * @performance
 * - The update process is O(n) with respect to the number of items, which is optimal for this use case.
 *
 * @security
 * - Input validation is performed in constructors to prevent invalid item or shop creation.
 *
 * @example
 * const { Shop, Item } = require('./src/gilded_rose');
 * const items = [
 *   new Item(ITEM_AGED_BRIE, 2, 0),
 *   new Item(ITEM_SULFURAS, 0, 80)
 * ];
 * const shop = new Shop(items);
 * shop.updateQuality();
 */

/**
 * Represents an item in the Gilded Rose inventory.
 */
class Item {
  /**
   * @param {string} name - The name of the item.
   * @param {number} sellIn - The number of days to sell the item.
   * @param {number} quality - The quality of the item.
   * @throws {Error} If input types are invalid.
   */
  constructor(name, sellIn, quality){
    if (typeof name !== 'string' || typeof sellIn !== 'number' || typeof quality !== 'number') {
      throw new Error('Invalid input types for Item: name must be string, sellIn and quality must be numbers');
    }
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

/**
 * Base class for item updaters. Handles default item update logic.
 */
class ItemUpdater {
  /**
   * Updates the item according to default rules.
   * @param {Item} item - The item to update.
   */
  update(item) {
    this.decreaseQuality(item);
    this.updateSellIn(item);
    if (item.sellIn < 0) {
      this.handleExpired(item);
    }
  }

  /**
   * Decreases the quality of the item by 1 if above MIN_QUALITY.
   * @param {Item} item
   */
  decreaseQuality(item) {
    if (item.quality > MIN_QUALITY) {
      item.quality -= 1;
    }
  }

  /**
   * Increases the quality of the item by 1 if below MAX_QUALITY.
   * @param {Item} item
   */
  increaseQuality(item) {
    if (item.quality < MAX_QUALITY) {
      item.quality += 1;
    }
  }

  /**
   * Decreases the sellIn value by 1.
   * @param {Item} item
   */
  updateSellIn(item) {
    item.sellIn -= 1;
  }

  /**
   * Handles item update after expiration (sellIn < 0).
   * @param {Item} item
   */
  handleExpired(item) {
    this.decreaseQuality(item);
  }
}

/**
 * Updater for "Aged Brie" items. Increases quality as it ages.
 */
class AgedBrieUpdater extends ItemUpdater {
  /**
   * Updates the item according to "Aged Brie" rules.
   * @param {Item} item
   */
  update(item) {
    this.increaseQuality(item);
    this.updateSellIn(item);
    if (item.sellIn < 0) {
      this.increaseQuality(item);
    }
  }
}

/**
 * Updater for "Backstage passes" items. Increases quality as sell-in approaches, drops to 0 after concert.
 */
class BackstagePassUpdater extends ItemUpdater {
  /**
   * Updates the item according to "Backstage passes" rules.
   * @param {Item} item
   */
  update(item) {
    this.increaseQuality(item);
    if (item.sellIn < BACKSTAGE_PASS_10_DAY) {
      this.increaseQuality(item);
    }
    if (item.sellIn < BACKSTAGE_PASS_5_DAY) {
      this.increaseQuality(item);
    }
    this.updateSellIn(item);
    if (item.sellIn < 0) {
      this.resetQuality(item);
    }
  }

  /**
   * Sets the quality of the item to MIN_QUALITY.
   * @param {Item} item
   */
  resetQuality(item) {
    item.quality = MIN_QUALITY;
  }
}

/**
 * Updater for "Sulfuras" items. Legendary items do not change.
 */
class SulfurasUpdater extends ItemUpdater {
  /**
   * Updates the item according to "Sulfuras" rules (no-op).
   * @param {Item} item
   */
  update(item) {
    // Legendary item, do nothing
  }
}

/**
 * Maps item names to their updater classes.
 * @type {Object.<string, ItemUpdater>}
 */
const updaters = {
  [ITEM_AGED_BRIE]: new AgedBrieUpdater(),
  [ITEM_BACKSTAGE_PASS]: new BackstagePassUpdater(),
  [ITEM_SULFURAS]: new SulfurasUpdater(),
  'default': new ItemUpdater()
};

/**
 * Represents the Gilded Rose shop, managing a collection of items.
 */
class Shop {
  /**
   * @param {Item[]} items - The array of items in the shop.
   * @throws {Error} If items is not an array.
   */
  constructor(items=[]){
    if (!Array.isArray(items)) {
      throw new Error('Invalid input: items must be an array');
    }
    this.items = items;
  }

  /**
   * Updates the quality and sell-in values of all items in the shop.
   * Delegates to the appropriate updater for each item type.
   * @returns {Item[]} The updated array of items.
   */
  updateQuality() {
    for (let item of this.items) {
      const updater = updaters[item.name] || updaters['default'];
      updater.update(item);
    }
    return this.items;
  }
}

module.exports = {
  Item,
  Shop,
  // Export constants for external use and testing
  MAX_QUALITY,
  MIN_QUALITY,
  BACKSTAGE_PASS_10_DAY,
  BACKSTAGE_PASS_5_DAY,
  ITEM_AGED_BRIE,
  ITEM_BACKSTAGE_PASS,
  ITEM_SULFURAS
}
