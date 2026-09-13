import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url))
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..')
const DEFAULT_PROJECT_DATA_PATH = path.join(REPOSITORY_ROOT, 'src', 'projectData.ts')

/**
 * Loads the canonical project content directly from projectData.ts without
 * maintaining a second, SEO-only copy of the case-study tracks.
 */
export async function loadProjectData(sourcePath = DEFAULT_PROJECT_DATA_PATH) {
  const source = await fs.readFile(sourcePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    fileName: sourcePath,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
      sourceMap: false,
    },
  })

  const errors = (transpiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  )

  if (errors.length > 0) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => REPOSITORY_ROOT,
      getNewLine: () => '\n',
    })
    throw new Error(`No se pudo transpilar src/projectData.ts:\n${formatted}`)
  }

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`
  const module = await import(moduleUrl)

  if (!Array.isArray(module.projects)) {
    throw new Error('src/projectData.ts debe exportar un array llamado "projects".')
  }

  return module.projects
}

export const projectDataPath = DEFAULT_PROJECT_DATA_PATH
