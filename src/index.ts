import { visit, ASTNode } from 'graphql'

export function pickOrOmitNodesByPath(ast: ASTNode, fields: string[], isOmit: boolean) {
  if (fields.length === 0) {
    return ast
  }

  const matches = isOmit ? omitMatcher(fields) : pickMatcher(fields)
  const NO_ACTION = undefined
  const DELETE_NODE = null

  return visit(ast, {
    Field: {
      enter(...[, , , path]) {
        const currentPath = getPathExpression(ast, path)
        const matched = matches(currentPath)

        return isOmit ? (matched ? DELETE_NODE : NO_ACTION) : matched ? NO_ACTION : DELETE_NODE
      },
    },
  })
}

export function getPathExpression(ast: ASTNode, path: ReadonlyArray<string | number>): string {
  const pathExpression: string[] = []
  let currentAst: ASTNode | undefined

  for (const pathSegment of path) {
    if (currentAst === undefined) {
      currentAst = (ast as any)[pathSegment]
    } else {
      currentAst = (currentAst as any)[pathSegment]
    }

    if (currentAst?.kind === 'Field') {
      pathExpression.push(currentAst.name.value)
    }
  }

  return pathExpression.join('.')
}

export function pickNodesByPath(ast: ASTNode, fields: string[]) {
  return pickOrOmitNodesByPath(ast, fields, false)
}

export function omitNodesByPath(ast: ASTNode, fields: string[]) {
  return pickOrOmitNodesByPath(ast, fields, true)
}

function match(matchers: RegExp[], target: string): boolean {
  const found = matchers.find((matcher) => {
    return matcher.test(target)
  })

  return !!found
}

function pickMatcher(fields: string[]) {
  const pathSet = new Set(fields)

  // make sure `a.b.c` also includes `a` and `a.b`
  pathSet.forEach((path) => {
    const pathSegments = path.split('.').slice(0, -1)

    let pathDeps = ''
    for (const pathSegment of pathSegments) {
      pathDeps += `.${pathSegment}`
      pathSet.add(pathDeps.substr(1))
    }
  })

  // make sure `a.b.c` also includes descendant nodes like `a.b.c.**`
  const isDescendantMatchers = fields.map((field) => {
    return new RegExp(`^${field}\\.`)
  })

  return (path: string): boolean => pathSet.has(path) || match(isDescendantMatchers, path)
}

function omitMatcher(fields: string[]) {
  const matchers = fields.map((field) => {
    return new RegExp(`^${field}$|^${field}\\.`)
  })

  return (path: string): boolean => {
    return match(matchers, path)
  }
}
