const { Shop, Item, ITEM_AGED_BRIE, ITEM_BACKSTAGE_PASS, ITEM_SULFURAS } = require("../src/gilded_rose");

describe("Gilded Rose", function() {
  it("should decrease sellIn and quality for normal items", function() {
    const gildedRose = new Shop([new Item("foo", 10, 20)]);
    const items = gildedRose.updateQuality();
    expect(items[0].name).toBe("foo");
    expect(items[0].sellIn).toBe(9);
    expect(items[0].quality).toBe(19);
  });

  it("should increase quality for Aged Brie", function() {
    const gildedRose = new Shop([new Item(ITEM_AGED_BRIE, 2, 0)]);
    const items = gildedRose.updateQuality();
    expect(items[0].name).toBe(ITEM_AGED_BRIE);
    expect(items[0].sellIn).toBe(1);
    expect(items[0].quality).toBe(1);
  });

  it("should increase quality by 2 for expired Aged Brie", function() {
    const gildedRose = new Shop([new Item(ITEM_AGED_BRIE, 0, 10)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(12);
  });

  it("should not increase quality above 50 for Aged Brie", function() {
    const gildedRose = new Shop([new Item(ITEM_AGED_BRIE, 2, 50)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(50);
  });

  it("should increase quality by 2 when 10 >= sellIn > 5 for Backstage passes", function() {
    const gildedRose = new Shop([new Item(ITEM_BACKSTAGE_PASS, 10, 40)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(42);
  });

  it("should increase quality by 1 when sellIn is exactly 11 for Backstage passes", function() {
    const gildedRose = new Shop([new Item(ITEM_BACKSTAGE_PASS, 11, 40)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(41);
  });

  it("should increase quality by 3 when 5 >= sellIn >= 0 for Backstage passes", function() {
    const gildedRose = new Shop([new Item(ITEM_BACKSTAGE_PASS, 5, 40)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(43);
  });

  it("should increase quality by 2 when sellIn is exactly 6 for Backstage passes", function() {
    const gildedRose = new Shop([new Item(ITEM_BACKSTAGE_PASS, 6, 40)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(42);
  });

  it("should drop quality to 0 after concert for Backstage passes", function() {
    const gildedRose = new Shop([new Item(ITEM_BACKSTAGE_PASS, 0, 40)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(0);
  });

  it("should not change quality or sellIn for Sulfuras", function() {
    const gildedRose = new Shop([new Item(ITEM_SULFURAS, 0, 80)]);
    const items = gildedRose.updateQuality();
    expect(items[0].name).toBe(ITEM_SULFURAS);
    expect(items[0].sellIn).toBe(0);
    expect(items[0].quality).toBe(80);
  });

  it("should not decrease quality below 0 for normal items", function() {
    const gildedRose = new Shop([new Item("foo", 10, 0)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(0);
  });

  it("should decrease quality by 2 for expired normal items", function() {
    const gildedRose = new Shop([new Item("foo", 0, 10)]);
    const items = gildedRose.updateQuality();
    expect(items[0].quality).toBe(8);
  });

  it("should throw error for invalid Item input", function() {
    expect(() => new Item(123, 10, 20)).toThrow();
    expect(() => new Item("foo", "bad", 20)).toThrow();
    expect(() => new Item("foo", 10, "bad")).toThrow();
  });

  it("should throw error for invalid Shop input", function() {
    expect(() => new Shop("not an array")).toThrow();
  });

  it("should use default updater for unknown item type", function() {
    const gildedRose = new Shop([new Item("Unknown Item", 5, 10)]);
    const items = gildedRose.updateQuality();
    expect(items[0].sellIn).toBe(4);
    expect(items[0].quality).toBe(9);
  });
});
