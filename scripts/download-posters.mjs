import { execFileSync } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(await readFile(path.join(root, 'src/data/anime.json'), 'utf8'))
const outputDir = path.join(root, 'public/posters')
await mkdir(outputDir, { recursive: true })

let completed = 0
for (const anime of catalog) {
  const output = path.join(outputDir, `${anime.bangumiSubjectId}.jpg`)
  const url = `https://api.bgm.tv/v0/subjects/${anime.bangumiSubjectId}/image?type=large`
  execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', [
    '--fail', '--location', '--silent', '--show-error', '--retry', '3',
    '--user-agent', 'AnimeTierList/1.0 (local personal project)',
    '--output', output, url,
  ])
  const signature = await readFile(output)
  if (signature[0] !== 0xff || signature[1] !== 0xd8) {
    throw new Error(`${anime.title}: downloaded file is not a JPEG`)
  }
  completed += 1
  console.log(`[${completed}/${catalog.length}] ${anime.title}`)
}

console.log(`Downloaded ${completed} posters to ${outputDir}`)
