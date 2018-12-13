# Retro Basic Compiler
A part pf Programming Principle Project

-----

## Introduction
This is a compiler for Retro Basic language written in javascript language on Node.js emvironment using LL(1) parser as a final project for programming principle subject.

## Prerequisite

* Install Node.js (version >= 8.6) from https://nodejs.org
* Add Node.js to your environment path

You can check correct installation of Node.js by using following command.

```sh
node -v
```

There should be an output like if the installation is correct.

```
v10.12.0
```

## Usage

You can call the compiler by using following syntax.

```sh
node compiler.js "path to your source code"
```

For example to compile retroBasicSample.txt

```sh
node compiler.js retroBasicSample.txt
```

If the compilation is successful, it will output like

```sh
Compile Successful!, output: retroBasicSample.txt.out.txt
```

If the compilation have error, it will output the error message like

```sh
...
Error: Compilation Error: Line number not in range!
...
```