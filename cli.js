#!/usr/bin/env node
const inPath = relatize(process.argv[1])
const outPath = relatize(process.argv[2])

require('./webpacker')(inPath, outPath)
