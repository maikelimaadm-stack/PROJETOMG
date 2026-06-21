import assert from "node:assert/strict";
import {
  CARD_FIELD_LINE_HEIGHT,
  CARD_FIELD_ROW_GAP,
  CARD_HEADER_HEIGHT,
  CARD_VERTICAL_PADDING,
  estimateCardRowHeight,
} from "@/shared/hooks/useGridVirtualizer";

const run = () => {
  assert.equal(estimateCardRowHeight(0, 1), CARD_VERTICAL_PADDING + CARD_HEADER_HEIGHT);

  assert.equal(
    estimateCardRowHeight(3, 1),
    CARD_VERTICAL_PADDING + CARD_HEADER_HEIGHT + 3 * CARD_FIELD_LINE_HEIGHT + 2 * CARD_FIELD_ROW_GAP
  );

  assert.equal(
    estimateCardRowHeight(4, 2),
    CARD_VERTICAL_PADDING + CARD_HEADER_HEIGHT + 2 * CARD_FIELD_LINE_HEIGHT + CARD_FIELD_ROW_GAP
  );

  assert.equal(
    estimateCardRowHeight(5, 5),
    CARD_VERTICAL_PADDING + CARD_HEADER_HEIGHT + CARD_FIELD_LINE_HEIGHT
  );

  console.log("cards-row-height.unit: OK");
};

run();
