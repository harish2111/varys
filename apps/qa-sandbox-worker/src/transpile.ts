import * as ts from 'typescript';

/**
 * Transpile a connector's TypeScript to runnable CommonJS for isolate execution. Type-only
 * imports (the DSL) are erased; runtime library access happens through the injected `context`,
 * so the connector module itself needs no real `require` (the isolate provides a stub).
 */
export function transpileConnector(source: string): string {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      removeComments: true,
    },
  }).outputText;
}
