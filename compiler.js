"use strict";

const fs = require("fs");

const bcodeType = {
    "#line": 10,
    "#id": 11,
    "#const": 12,
    "#if": 13,
    "#goto": 14,
    "#print": 15,
    "#stop": 16,
    "#op": 17
};

const nextSet = {
    "1": ["line", "pgm"],
    "2": ["EOF"],
    "3": ["line_num", "stmt"],
    "4": ["asgmnt"],
    "5": ["if"],
    "6": ["print"],
    "7": ["goto"],
    "8": ["stop"],
    "9": ["id", "=", "exp"],
    "10": ["term", "exp'"],
    "11": ["+", "term"],
    "12": ["-", "term"],
    "13": [],
    "14": ["id"],
    "15": ["const"],
    "16": ["IF", "cond", "line_num"],
    "17": ["term", "cond'"],
    "18": ["<", "term"],
    "19": ["=", "term"],
    "20": ["PRINT", "id"],
    "21": ["GOTO", "line_num"],
    "22": ["STOP"]
};

const parsingTable = {
    pgm: { line_num: 1, EOF: 2 },
    line: { line_num: 3 },
    stmt: { id: 4, IF: 5, PRINT: 6, GOTO: 7, STOP: 8 },
    asgmnt: { id: 9 },
    exp: { id: 10, const: 10 },
    "exp'": { line_num: 13, "+": 11, "-": 12, EOF: 13 },
    term: { id: 14, const: 15 },
    if: { IF: 16 },
    cond: { id: 17, const: 17 },
    "cond'": { "<": 18, "=": 19 },
    print: { PRINT: 20 },
    goto: { GOTO: 21 },
    stop: { STOP: 22 }
};

const isTerminal = symbol => !parsingTable.hasOwnProperty(symbol);

const getTerminalType = token => {
    if (/^\d+$/.test(token)) {
        return "number";
    }
    if (token.length === 1 && token.match(/[A-Z]/i)) {
        return "id";
    }
    for (const terminal of [
        "IF",
        "PRINT",
        "GOTO",
        "STOP",
        "<",
        "=",
        "+",
        "-",
        "EOF"
    ]) {
        if (terminal === token) {
            return terminal;
        }
    }
    throw new Error(`Compilation Error: ${token} is not recognized.`);
};

const isSameTerminal = (token, topOfStack) => {
    const tokenType = getTerminalType(token);
    if (tokenType === "number") {
        return topOfStack === "line_num" || topOfStack === "const";
    }
    return tokenType == topOfStack;
};

const getRule = (stackTop, token) => {
    const tokenType = getTerminalType(token);
    // console.log(stackTop, token);
    if (tokenType === "number") {
        if (parsingTable[stackTop].line_num) {
            return parsingTable[stackTop].line_num;
        } else if (parsingTable[stackTop].const) {
            return parsingTable[stackTop].const;
        }
    }
    if (parsingTable[stackTop][tokenType]) {
        return parsingTable[stackTop][tokenType];
    }
    throw new Error("Compilation Error: No rule to derive!");
};

const getBcode = (terminal, value) => {
    switch (terminal) {
        case "line_num":
            return ["#line", +value];
        case "id":
            return ["#id", value.charCodeAt(0) - 64];
        case "const":
            return ["#const", +value];
        case "IF":
            return ["#if", 0];
        case "GOTO":
            return ["#goto", +value];
        case "PRINT":
            return ["#print", 0];
        case "STOP":
            return ["#stop", 0];
        case "+":
            return ["#op", 1];
        case "-":
            return ["#op", 2];
        case "<":
            return ["#op", 3];
        case "=":
            return ["#op", 4];
    }
    throw new Error("Compilation Error: cannot convert to bcode!");
};

const src = fs.readFileSync(process.argv[2], "utf8");
const tokens = src.trim().split(/\s+/);
const stack = ["EOF", "pgm"];
const parseTokens = [];
const bcodes = [];

// Parsing stream of tokens
for (const token of tokens) {
    while (!isSameTerminal(token, stack[stack.length - 1])) {
        // console.log("Current Stack: ", stack);
        // console.log("Current token: ", token);
        const stackTop = stack.pop();
        if (isTerminal(stackTop)) {
            throw new Error(`Compilation Error: ${stackTop} is unexpected!`);
        }
        const rule = getRule(stackTop, token);
        if (nextSet[rule] && nextSet[rule].length !== 0) {
            // console.log("Reverse Rules: ", nextSet[rule].slice().reverse());
            stack.push(...nextSet[rule].slice().reverse());
            // console.log("After push: ", stack);
        }
    }
    if (
        stack[stack.length - 1] == "line_num" &&
        (+token < 1 || +token > 1000)
    ) {
        throw new Error("Compilation Error: Line number not in range!");
    }
    if (stack[stack.length - 1] == "const" && (+token < 0 || +token > 100)) {
        throw new Error("Compilation Error: Const value not in range");
    }
    // console.log("Match: ", token, stack[stack.length - 1]);
    parseTokens.push(stack.pop());
}

// console.log(parseTokens);

// Convert to bcode
for (const i in tokens) {
    // console.log(i, ":", tokens[i], ":", parseTokens[i]);
    // special if goto case
    if (
        parseTokens[i] === "line_num" &&
        ((+i + 1 < parseTokens.length && parseTokens[+i + 1] === "line_num") ||
            +i + 1 === parseTokens.length)
    ) {
        bcodes.push(...getBcode("GOTO", tokens[i]));
        bcodes[bcodes.length - 2] = bcodeType[bcodes[bcodes.length - 2]];
    } else if (parseTokens[i] != "GOTO") {
        bcodes.push(...getBcode(parseTokens[i], tokens[i]));
        bcodes[bcodes.length - 2] = bcodeType[bcodes[bcodes.length - 2]];
    }
}

// console.log(bcodes);

fs.writeFileSync(process.argv[2] + ".out.txt", bcodes.join(" "));
console.log("Compile Successful!, output: " + process.argv[2] + ".out.txt");
