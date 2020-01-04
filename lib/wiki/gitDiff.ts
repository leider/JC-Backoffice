export default class Diff {
  diff: string;
  constructor(diffString: string) {
    this.diff = diffString;
  }

  asLines(): {
    text: string;
    ldln: string;
    rdln: string;
    class: string;
  }[] {
    let ldln = 0;
    let rdln = 0;

    function leftDiffLineNumber(id: number, line: string): string {
      if (line.slice(0, 2) === "@@") {
        const match = line.match(/-(\d+)/);
        if (!match) {
          return "";
        }
        const li = match[1];
        ldln = parseInt(li, 10);
        return "...";
      }
      if (line.slice(0, 1) === "+") {
        return "";
      }
      rdln = rdln + 1;
      return (ldln - 1).toString();
    }

    function rightDiffLineNumber(id: number, line: string): string {
      if (line.slice(0, 2) === "@@") {
        const match = line.match(/\+(\d+)/);
        if (!match) {
          return "";
        }
        const ri = match[1];
        rdln = parseInt(ri, 10);
        return "...";
      }
      if (line.slice(0, 1) === "-") {
        return " ";
      }
      rdln = rdln + 1;
      return (rdln - 1).toString();
    }

    function lineClass(line: string): string {
      if (line.slice(0, 2) === "@@") {
        return "gc";
      }
      if (line.slice(0, 1) === "-") {
        return "gd";
      }
      if (line.slice(0, 1) === "+") {
        return "gi";
      }
      return "";
    }

    const lines: {
      text: string;
      ldln: string;
      rdln: string;
      class: string;
    }[] = [];
    this.diff
      .split("\n")
      .slice(4)
      .forEach(line => {
        if (line.slice(0, 1) !== "\\") {
          lines.push({
            text: line,
            ldln: leftDiffLineNumber(0, line),
            rdln: rightDiffLineNumber(0, line),
            class: lineClass(line)
          });
        }
      });
    return lines;
  }
}
