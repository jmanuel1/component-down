module.exports = function plugin(md) {
  md.block.ruler.before('paragraph', 'component-down.import', importBlockRule);
  md.renderer.rules['component-down.import_open'] = renderImportOpen;
  md.renderer.rules['component-down.import_path'] = renderImportPath;
  md.renderer.rules['component-down.import_close'] = renderImportClose;

  md.block.ruler.before('code', 'component-down.template', templateBlockRule);
  md.renderer.rules['component-down.template_open'] = renderTemplateOpen;
  md.renderer.rules['component-down.template_close'] = renderTemplateClose;
};

function importBlockRule(state, startLine, endLine, checkMode) {
  let lineAfter = startLine;
  // TODO: figure out proper string parsing
  const regex = /^{{%\s*import\s+"((?:[^"]|\\")*)"\s*%}}$/;
  let lines, match;
  do {
    lineAfter++;
    lines = state.getLines(startLine, lineAfter, state.blkIndent, false).trim();
    match = regex.exec(lines);
  } while (!match && lineAfter <= endLine);
  if (match) {
    if (checkMode) {
      return true;
    }
    const path = match[1];
    // TODO: just use one import token since imports don't have any children
    state.tokens.push({
      type: 'component-down.import_open',
      lines: [startLine, startLine],
      level: state.level
    });
    state.tokens.push({
      type: 'component-down.import_path',
      lines: [startLine, lineAfter],
      level: state.level,
      path
    });
    state.tokens.push({
      type: 'component-down.import_close',
      lines: [lineAfter - 1, lineAfter],
      level: state.level
    });
    state.line = lineAfter;
    return true;
  }
  return false;
}

function renderImportOpen() {
  return '<script type="module" ';
}

function renderImportPath(tokens, idx) {
  return `src="${tokens[idx].path}">`;
}

function renderImportClose() {
  return '</script>\n';
}

function templateBlockRule(state, startLine, endLine, checkMode) {
  let lineAfter, lineAfterStart = startLine,
    lineAfterContent;
  const checkRegex = /^{{%\s*template/;
  const check = checkRegex.exec(state.getLines(startLine, startLine + 2,
    state.blkIndent, false).trim());
  if (!check) {
    return false;
  }
  const startRegex =
    /^{{%\s*template\s+((?:(?:\w+)="(?:(?:[^"]|\\")*)"\s*)*)\s*%}}$/;
  let lines, startMatch;
  do {
    lineAfterStart++;
    lines = state.getLines(startLine, lineAfterStart, state.blkIndent, false)
      .trim();
    startMatch = startRegex.exec(lines);
  } while (!startMatch && lineAfterStart <= endLine);
  // TODO: Handle nested {{% template %}} correctly
  lineAfterContent = lineAfterStart - 1;
  let endMatch;
  const endRegex = /^{{%\s*\/template\s*%}}/;
  while (!endMatch && lineAfterContent <= endLine) {
    lineAfterContent++;
    lines = state.getLines(lineAfterContent, lineAfterContent + 3,
      state.blkIndent, false).trim();
    endMatch = endRegex.exec(lines);
  }
  if (startMatch && endMatch) {
    if (checkMode) return true;

    state.tokens.push({
      type: 'component-down.template_open',
      lines: [startLine, lineAfterStart],
      level: state.level,
      attributesString: startMatch[1].trim()
    });
    state.line = lineAfterStart;
    state.level++;
    const {
      blkIndent
    } = state;
    state.blkIndent = state.tShift[startLine];
    console.log('There are', lineAfterContent - lineAfterStart,
      'lines of content in the template');
    state.parser.tokenize(state, lineAfterStart, lineAfterContent, true);
    state.level--;
    state.blkIndent = blkIndent;
    const lineAfterEnd = countLines(endMatch[0]) + lineAfterContent;
    state.tokens.push({
      type: 'component-down.template_close',
      lines: [lineAfterContent, lineAfterEnd],
      level: state.level
    });
    state.line = lineAfterEnd;
    console.log('Lines in {{% /template %}}:', countLines(endMatch[0]));
    return true;
  }
  return false;
}

function renderTemplateOpen(tokens, idx) {
  return `<template ${tokens[idx].attributesString}>\n`;
}

function renderTemplateClose() {
  return '</template>\n';
}

// utilities

function countLines(string) {
  let count = 1;
  for (let char of string) {
    if (char === '\n') {
      count++;
    }
  }
  return count;
}
