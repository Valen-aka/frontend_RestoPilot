import ts from 'typescript';
export function routeGroups(source,file='routes.ts') {
 const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),groups=[];
 function visit(node){
  if(ts.isArrayLiteralExpression(node)){
   const routes=node.elements.filter(ts.isObjectLiteralExpression).flatMap(object=>{
    const property=name=>object.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(tree)===name);
    const path=property('path')?.initializer;if(!path||!ts.isStringLiteralLike(path))return [];
    const guards=name=>{const value=property(name)?.initializer;return value&&ts.isArrayLiteralExpression(value)?value.elements.map(g=>g.getText(tree)):[];};
    return [{path:path.text,line:tree.getLineAndCharacterOfPosition(object.getStart(tree)).line+1,canActivate:guards('canActivate'),canDeactivate:guards('canDeactivate')}];
   });if(routes.length)groups.push(routes);
  }ts.forEachChild(node,visit);
 }visit(tree);return groups;
}
export function duplicateRoutes(source,file='routes.ts') {
 const errors=[];for(const group of routeGroups(source,file)){const seen=new Map();for(const route of group){if(seen.has(route.path))errors.push(file+':'+route.line+' ruta duplicada "'+route.path+'"; primera definición en línea '+seen.get(route.path));else seen.set(route.path,route.line);}}return errors;
}
