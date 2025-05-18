import { useCallback, useMemo } from "react";
import map from "lodash/map";
import { useGlobalContext } from "@/app/GlobalContext.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import createTaggies from "@/components/team/TeamBlock/createTaggies.ts";

function useColWidth() {
  const { viewport } = useGlobalContext();

  const width = viewport.width - 16;
  const { xs, lg, xl, xxl } = useBreakpoint();
  if (xs) {
    return width;
  }
  if (xxl) {
    return width / 6;
  }
  if (xl) {
    return width / 4;
  }
  if (lg) {
    return width / 3;
  }
  return width / 2;
}

const tagsWidth = 70;
const previewWidth = 21;
const buttonsHeight = 26;

function calcNoOfLines(text: string, context: CanvasRenderingContext2D, width: number) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const segmenter = new Intl.Segmenter("de", { granularity: "word" });
  const words: string[] = map([...segmenter.segment(text)], "segment");
  const { lines, currentLine } = words.reduce(
    ({ lines, currentLine }: { lines: string[]; currentLine: string }, word) => {
      const testLine = currentLine + word;
      const testWidth = context.measureText(testLine).width;

      return testWidth <= width || currentLine === ""
        ? { lines, currentLine: testLine }
        : { lines: [...lines, currentLine], currentLine: word };
    },
    { lines: [], currentLine: "" },
  );
  return (currentLine ? [...lines, currentLine] : lines).length;
}

export default function useCalcHeight() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const colWidth = useColWidth();
  const { isCompactMode } = useGlobalContext();

  if (context) {
    context.font = "normal 600 " + (isCompactMode ? "18px" : "20px") + " Montserrat, Helvetica, Arial, sans-serif";
  }

  const collapseArrowWidth = useMemo(() => (isCompactMode ? 25 : 31), [isCompactMode]);

  const textLineHeight = useMemo(() => (isCompactMode ? 26 : 28), [isCompactMode]);
  const staffHeight = useMemo(() => (isCompactMode ? 58 : 68), [isCompactMode]);
  const staffExtraHeight = useMemo(() => (isCompactMode ? 14 : 24), [isCompactMode]);
  const tagsHeight = useMemo(() => (isCompactMode ? 19 : 20), [isCompactMode]);

  return useCallback(
    ({ expanded, isAdmin, veranstaltung }: { expanded: boolean; isAdmin: boolean; veranstaltung: Veranstaltung }) => {
      if (!context) {
        return 1;
      }
      const expandedAndNotGhost = expanded && !veranstaltung.ghost;
      const previewEyeWidth = veranstaltung.ghost ? 0 : previewWidth;

      const delta = collapseArrowWidth + (expandedAndNotGhost && isAdmin ? tagsWidth : previewEyeWidth);
      const text = veranstaltung.kopf.titel;
      const noOfLines = calcNoOfLines(text, context, colWidth - delta);
      const height = (noOfLines + 1) * textLineHeight + 2;
      if (!expandedAndNotGhost) {
        return height;
      }
      if (isAdmin) {
        const noOfTags = createTaggies(veranstaltung).length;
        return Math.max(noOfTags * tagsHeight, height) + buttonsHeight;
      } else {
        const noOfStaff = veranstaltung.staff.noOfRowsNeeded;
        return noOfStaff ? noOfStaff * staffHeight + height + staffExtraHeight : staffHeight + height - 2;
      }
    },
    [colWidth, collapseArrowWidth, context, staffExtraHeight, staffHeight, tagsHeight, textLineHeight],
  );
}
