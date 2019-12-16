/* Remarkable does not support tag names containing hyphens. This matches
CommonMark 0.12, which remarkable seems to follow because the CommonMark
reference implementation is pinned to 0.12 in Remarkable's dev dependencies and
in its yarn.lock.

QUESTION: Should I file an issue? */

module.exports = function plugin(md) {
  // completely replace the htmlblock rule
  md.block.ruler.at('htmlblock', () => false, {});

  // even a 4-space indented tag will start an html block
  md.block.ruler.before('code', 'htmlblock', htmlBlockRule, {});
};

function htmlBlockRule(state, startLine, endLine, checkMode) {
  // TODO: disable based on options.html
  let lineAfterStart = startLine;
  // we'll allow closing tags to start a block
  const startRegex = /^<\s*\/?[a-zA-Z][a-zA-Z0-9-]+/;
  let lines,
    match;
  do {
    lineAfterStart++;
    lines = state.getLines(startLine, lineAfterStart, state.blkIndent, false)
      .trim();
    match = startRegex.exec(lines);
  } while (!match && lineAfterStart <= endLine);

  let lineAfterEnd = lineAfterStart;
  // the block stops when we reach an empty line or the endLine
  // (CommonMark 0.12 says until the end of input)
  while (!state.isEmpty(lineAfterEnd) && lineAfterEnd < endLine)
    lineAfterEnd++;
  if (match) {
    if (checkMode) {
      return true;
    }

    const content = state
      .getLines(startLine, lineAfterEnd, state.blkIndent, false).trim();
    state.tokens.push({
      type: 'htmlblock',
      lines: [
        startLine, lineAfterEnd
      ],
      level: state.level,
      content
    });
    state.line = lineAfterEnd;
    return true;
  }
  return false;
}