/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 * 
 * Script to extract vt features documented in docstrings.
 */
const fs = require('fs');
const Mustache = require('mustache');

/**
 * regexp to fetch all comments
 * Fetches all multiline comments and single lines containing '// @vt:'.
 */
const REX_COMMENTS = /^\s*?[/][*][*]([\s\S]*?)[*][/]|^\s*?\/\/ ([@]vt[:].*?)$/mug;

/**
 * regexp to parse the @vt line
 * expected data - "@vt: <status> <kind> <mnemonic> "<name>" "<sequence>" "<short description>"
 */
const REX_VT_LINE = /^[@]vt\:\s*(\w+)\s*(\w+)\s*(\w+)\s*"(.*?)"\s*"(.*?)"\s*"(.*?)".*$/;

// known vt command types
const TYPES = [
  'C0',
  'C1',
  'ESC',
  'CSI',
  'DCS',
  'OSC',
  'APC',
  'PM',
  'SOS'
];

const MARKDOWN_TMPL = `

### TODO
- improve table sorting:
  - sort C0/C1 in byte order
  - sort OSC in numerical order
  - sort CSI/ESC/DCS in final byte order
- references


xterm.js version: {{version}}

### Table of Contents

- [General notes](#general-notes)
{{#C0.length}}
- [C0](#c0)
{{/C0.length}}
{{#C1.length}}
- [C1](#c1)
{{/C1.length}}
{{#CSI.length}}
- [CSI](#csi)
{{/CSI.length}}
{{#DCS.length}}
- [DCS](#dcs)
{{/DCS.length}}
{{#ESC.length}}
- [ESC](#esc)
{{/ESC.length}}
{{#OSC.length}}
- [OSC](#osc)
{{/OSC.length}}

### General notes

This document lists xterm.js' support of terminal sequences. The sequences are grouped by their type:

- C0: single byte command (7bit control characters, byte range \\x00 .. \\x1f)
- C1: single byte command (8bit control characters, byte range \\x80 .. \\x9f)
- ESC: sequence starting with \`ESC\` (\`\\x1b\`)
- CSI - Control Sequence Introducer: sequence starting with \`ESC [\` (7bit) or CSI (\`\\x9b\` 8bit)
- DCS - Device Control String: sequence starting with \`ESC P\` (7bit) or DCS (\`\\x90\` 8bit)
- OSC - Operating System Command: sequence starting with \`ESC ]\` (7bit) or OSC (\`\\x9d\` 8bit)

Application Program Command (APC), Privacy Message (PM) and Start of String (SOS) are recognized but not supported,
any sequence of these types will be ignored. They are also not hookable by the API.

Note that the list only contains sequences implemented in xterm.js' core codebase. Missing sequences are either
not supported or unstable/experimental. Furthermore addons or integrations can provide additional custom sequences.

To denote the sequences the following tables use the same abbreviations as xterm does:
- \`Ps\`: A single (usually optional) numeric parameter, composed of one or more decimal digits.
- \`Pm\`: A multiple numeric parameter composed of any number of single numeric parameters, separated by ; character(s),
  e.g. \` Ps ; Ps ; ... \`.
- \`Pt\`: A text parameter composed of printable characters. Note that for most commands with \`Pt\` only
  ASCII printables are specified to work. Additionally the parser will let pass any codepoint greater than C1 as printable.


{{#C0.length}}
### C0

| Mnemonic | Name | Sequence | Short Description | Status |
| -------- | ---- | -------- | ----------------- | ------ |
{{#C0}}
| {{mnemonic}} | {{name}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/C0}}

{{#C0.hasLongDescriptions}}
{{#C0}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/C0}}
{{/C0.hasLongDescriptions}}

{{/C0.length}}


{{#C1.length}}
### C1

| Mnemonic | Name | Sequence | Short Description | Status |
| -------- | ---- | -------- | ----------------- | ------ |
{{#C1}}
| {{mnemonic}} | {{name}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/C1}}

{{#C1.hasLongDescriptions}}
{{#C1}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/C1}}
{{/C1.hasLongDescriptions}}

{{/C1.length}}


{{#CSI.length}}
### CSI

| Mnemonic | Name | Sequence | Short Description | Status |
| -------- | ---- | -------- | ----------------- | ------ |
{{#CSI}}
| {{mnemonic}} | {{name}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/CSI}}

{{#CSI.hasLongDescriptions}}
{{#CSI}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/CSI}}
{{/CSI.hasLongDescriptions}}

{{/CSI.length}}


{{#DCS.length}}
### DCS

| Mnemonic | Name | Sequence | Short Description | Status |
| -------- | ---- | -------- | ----------------- | ------ |
{{#DCS}}
| {{mnemonic}} | {{name}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/DCS}}

{{#DCS.hasLongDescriptions}}
{{#DCS}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/DCS}}
{{/DCS.hasLongDescriptions}}

{{/DCS.length}}


{{#ESC.length}}
### ESC

| Mnemonic | Name | Sequence | Short Description | Status |
| -------- | ---- | -------- | ----------------- | ------ |
{{#ESC}}
| {{mnemonic}} | {{name}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/ESC}}

{{#ESC.hasLongDescriptions}}
{{#ESC}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/ESC}}
{{/ESC.hasLongDescriptions}}

{{/ESC.length}}


{{#OSC.length}}
### OSC

| Identifier | Sequence | Short Description | Status |
| ---------- | -------- | ----------------- | ------ |
{{#OSC}}
| {{mnemonic}} | \`{{sequence}}\` | {{{shortDescription}}} {{#longDescription.length}}_[more](#{{longTarget}})_{{/longDescription.length}} | {{status}} |
{{/OSC}}

{{#OSC.hasLongDescriptions}}
{{#OSC}}
{{#longDescription.length}}
#### {{name}}
{{#longDescription}}
{{{.}}}
{{/longDescription}}
{{/longDescription.length}}
{{/OSC}}
{{/OSC.hasLongDescriptions}}

{{/OSC.length}}
`

function createAnchorSlug(s) {
  return s.toLowerCase().split(' ').join('-');
}

function* parseMultiLineGen(filename, s) {
  if (!~s.indexOf('@vt:')) {
    return;
  }
  const lines = s.split('\n').map(el => el.trim().replace(/[*]/, '').replace(/\s/, ''));
  let grabLine = false;
  let longDescription = [];
  let feature = undefined;
  for (const line of lines) {
    if (grabLine) {
      if (!line) {
        if (feature) {
          feature.longDescription = longDescription;
          feature.longTarget = createAnchorSlug(feature.name);
          yield feature;
        }
        grabLine = false;
        longDescription = [];
        feature = undefined;
        continue;
      }
      longDescription.push(line);
    }
    if (~line.indexOf('@vt:')) {
      feature = parseSingleLine(filename, line);
      grabLine = true;
    }
  }
}

function parseSingleLine(filename, s) {
  const line = s.trim();
  const match = line.match(REX_VT_LINE);
  if (match !== null) {
    if (!~TYPES.indexOf(match[2])) {
      throw new Error(`unkown vt-command type "${match[2]}" specified in "${filename}"`);
    }
    return {
      status: match[1],
      type: match[2],
      mnemonic: match[3],
      name: match[4],
      sequence: match[5],
      shortDescription: match[6],
      longDescription: [],
      longTarget: '',
      source: filename
    };
  }
}

function postProcessData(features) {
  const featureTable = {};
  for (const feature of features) {
    if (featureTable[feature.type] === undefined) {
      featureTable[feature.type] = [];
    }
    featureTable[feature.type].push(feature);
    if (feature.longDescription.length) {
      featureTable[feature.type].hasLongDescriptions = true;
    }
  }
  for (const entry in featureTable) {
    featureTable[entry].sort((a, b) => a.sequence.slice(-1) > b.sequence.slice(-1));
  }
  // console.error(featureTable);
  featureTable.version = require('../package.json').version;
  console.log(Mustache.render(MARKDOWN_TMPL, featureTable));
}

function main(filenames) {
  // console.error(filenames);
  let leftToProcess = filenames.length;
  const features = [];
  for (const filename of filenames) {
    fs.readFile(filename, 'utf-8', (err, data) => {
      let match;
      while ((match = REX_COMMENTS.exec(data)) !== null) {
        if (match.index === REX_COMMENTS.lastIndex) {
          REX_COMMENTS.lastIndex++;
        }
        if (match[1]) {
          for (let feature of parseMultiLineGen(filename, match[1])) {
            if (feature) features.push(feature);
          }
        } else {
          const feature = parseSingleLine(filename, match[2]);
          if (feature) features.push(feature);
        }
      }
      leftToProcess--;
      if (!leftToProcess) {
        postProcessData(features);
      }
    });
  }
}

main(process.argv.slice(2))
