import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pkgJson = path.join(__dirname, '../package.json')
const pkg = JSON.parse(await fs.readFile(pkgJson, 'utf8'))

const year = new Date().getFullYear()

function getBanner() {
  return `/*!
  * ${pkg.description} v${pkg.version} (${pkg.homepage})
  * Copyright 2024-${year} ${pkg.author}
  * Licensed under MIT (${pkg.homepage}/blob/master/LICENSE)
  * 
  */`
}

export default getBanner
