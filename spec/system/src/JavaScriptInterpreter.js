/**
 * Returns a newly constructed JavaScript interpreter. 
 * @class
 * @classdesc <p>
 * This class is a real world example of how an 
 * {@link InterpreterMethodFactory} can be used to make a fully functional 
 * interpreter. 
 * It is an interpreter for a subset of the JavaScript language, just large 
 * enough to interpret the source code of {@link InterpreterMethodFactory.js}. 
 * </p><p>
 * It is a fully functional interpreter. 
 * It is possible to run all unit tests of Semantics! on this interpretation, 
 * and all the tests for this {@link UsageExampleJavaScriptInterpreter} 
 * can be run on this class being constructed with that interpretation. 
 * </p>
 * @alias UsageExampleJavaScriptInterpreter
 */
function JavaScriptInterpreter() {
  
}

JavaScriptInterpreter.hack = function() {
  var interpreterMethodFactory = new InterpreterMethodFactory();
  var identifierName = /[a-zA-Z_\$][a-zA-Z0-9_\$]*/;
  
  // Lexical Grammar
  JavaScriptInterpreter.prototype.spaces = 
  interpreterMethodFactory.star("space", function(spaces) {
    return spaces.join("");
  });

  JavaScriptInterpreter.prototype.space = 
  interpreterMethodFactory.or("whiteSpace", "lineTerminator", 
  "singleLineComment", "multiLineComment");
  
  /**
   * atom(/\s/)
   */
  JavaScriptInterpreter.prototype.whiteSpace = 
  interpreterMethodFactory.atom(/\s/);
  
  /**
   * atom(/\n/)
   */
  JavaScriptInterpreter.prototype.lineTerminator = 
  interpreterMethodFactory.atom(/\n/);
  
  /**
   * 
   */
  JavaScriptInterpreter.prototype.singleLineComment = 
  interpreterMethodFactory.atom(/\/\/.*/);

  JavaScriptInterpreter.prototype.multiLineComment = 
  interpreterMethodFactory.atom(/\/\*\/*(\**[^\*\/]+\/*)*\*+\//);
  
  /**
   * atom(identifierName)
   */
  JavaScriptInterpreter.prototype.identifierName = 
  interpreterMethodFactory.atom(identifierName);
  
  /**
   * or("undefinedLiteral", "nullLiteral", "booleanLiteral", "numericLiteral", 
   * "stringLiteral", "regularExpressionLiteral")
   */
  JavaScriptInterpreter.prototype.literal = 
  interpreterMethodFactory.or("undefinedLiteral", "nullLiteral", 
  "booleanLiteral", "numericLiteral", "stringLiteral", 
  "regularExpressionLiteral");
  
  /**
   * atom(/undefined/)
   */
  JavaScriptInterpreter.prototype.undefinedLiteral = 
  interpreterMethodFactory.atom(/undefined/, function() {return undefined;});
  
  /**
   * atom(/null/)
   */
  JavaScriptInterpreter.prototype.nullLiteral = 
  interpreterMethodFactory.atom(/null/, function() {return null;});
  
  /**
   * or("trueLiteral", "falseLiteral")
   */
  JavaScriptInterpreter.prototype.booleanLiteral = 
  interpreterMethodFactory.or("trueLiteral", "falseLiteral");
  
  /**
   * atom(/true/)
   */
  JavaScriptInterpreter.prototype.trueLiteral = 
  interpreterMethodFactory.atom(/true/, function() {return true;});
  
  /**
   * atom(/false/)
   */
  JavaScriptInterpreter.prototype.falseLiteral = 
  interpreterMethodFactory.atom(/false/, function() {return false;});
  
  /**
   * atom(/\d+/)
   */
  JavaScriptInterpreter.prototype.numericLiteral = 
  interpreterMethodFactory.atom(/\d+/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  /**
   * insignificant(null, "stringLiteralSignificantSpaces")
   */
  JavaScriptInterpreter.prototype.stringLiteral = 
  interpreterMethodFactory.
  insignificant(null, "stringLiteralSignificantSpaces");
  
  /**
   * or("stringLiteralSignificantSpaces1", "stringLiteralSignificantSpaces2")
   */
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces = 
  interpreterMethodFactory.or("stringLiteralSignificantSpaces1", 
  "stringLiteralSignificantSpaces2");
  
  /**
   * wrap(/"/, "doubleStringCharacters", /"/)
   */
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces1 = 
  interpreterMethodFactory.wrap(/"/, "doubleStringCharacters", /"/);
  
  /**
   * wrap(/'/, "singleStringCharacters", /'/)
   */
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces2 = 
  interpreterMethodFactory.wrap(/'/, "singleStringCharacters", /'/);
  
  var unescape = function(s) {
    s = s.replace(/\\['"\\bfnrtv]/g, function(match) {
      return characterEscapeSequence[match];
    });
    
    return s;
  };
  
  /**
   * 
   */
  JavaScriptInterpreter.prototype.doubleStringCharacters = 
  interpreterMethodFactory.atom(/([^"\\]|(\\.))*/, unescape);
  
  /**
   * 
   */
  JavaScriptInterpreter.prototype.singleStringCharacters = 
  interpreterMethodFactory.atom(/([^'\\]|(\\.))*/, unescape);
  
  var characterEscapeSequence = {
    "\\\'": "\'",
    "\\\"": "\"",
    "\\\\": "\\",
    "\\b": "\b", 
    "\\f": "\f", 
    "\\n": "\n", 
    "\\r": "\r", 
    "\\t": "\t",
    "\\v": "\v",
  };
  
  /**
   * insignificant(null, "regularExpressionLiteralSignificantSpaces")
   */
  JavaScriptInterpreter.prototype.regularExpressionLiteral = 
  interpreterMethodFactory.
  insignificant(null, "regularExpressionLiteralSignificantSpaces");
  
  /**
   * wrap(/\//, "regularExpressionBody", /\//)
   */
  JavaScriptInterpreter.prototype.regularExpressionLiteralSignificantSpaces = 
  interpreterMethodFactory.wrap(/\//, "regularExpressionBody", /\//);
  
  /**
   * 
   */
  JavaScriptInterpreter.prototype.regularExpressionBody = 
  interpreterMethodFactory.atom(/([^/\\\[]|(\\.)|(\[([^\]\\]|(\\.))*\]))+/, 
  function(regularExpressionBody) {
    return new RegExp(regularExpressionBody);
  });
  
  // Expressions
  
  /**
   * wrap("bindingIdentifier")
   */
  JavaScriptInterpreter.prototype.identifierReference = 
  interpreterMethodFactory.wrap("bindingIdentifier", 
  function(bindingIdentifier) {
    var base = this.executionContext;
    while(!base.variables.hasOwnProperty(bindingIdentifier)) {
      base = base.outer;
      if(!base) {
        throw new ReferenceError(bindingIdentifier + " is not defined");
      }
    }
    
    return {
      base: base.variables,
      name: bindingIdentifier,
    };
    
  });
  
  /**
   * wrap("identifierReference")
   */
  JavaScriptInterpreter.prototype.identifierExpression = 
  interpreterMethodFactory.wrap("identifierReference", 
  function(identifierReference) {
    return identifierReference.base[identifierReference.name];
  });
  
  var reservedWord = ["break", "case", "catch", "class", "continue", 
  "debugger", "default", "delete", "do", "else", "enum", "export", "extends", 
  "false", "finally", "for", "function", "if", "implements", "import", "in", 
  "instanceof", "let", "new", "null", "package", "private", "protected", 
  "public", "return", "static", "super", "switch", "this", "throw", "true", 
  "try", "typeof", "undefined", "var", "void", "while", "with", "yield"];
  
  /**
   * atom(identifierName, reservedWord)
   */
  JavaScriptInterpreter.prototype.bindingIdentifier = 
  interpreterMethodFactory.atom(identifierName, reservedWord);
  
  /**
   * or("literal", "objectExpression")
   */
  JavaScriptInterpreter.prototype.primaryExpression = 
  interpreterMethodFactory.or("literal", "objectExpression");
  
  /**
   * or("identifierExpression", "arrayLiteral", "objectLiteral", 
   * "functionExpression", "objectExpression1", "thisExpression")
   */
  JavaScriptInterpreter.prototype.objectExpression = 
  interpreterMethodFactory.or("identifierExpression", "arrayLiteral", 
  "objectLiteral", "functionExpression", "objectExpression1", "thisExpression");
  
  /**
   * wrap(/\(/, "expression", /\)/)
   */
  JavaScriptInterpreter.prototype.objectExpression1 = 
  interpreterMethodFactory.wrap(/\(/, "expression", /\)/);
  
  /**
   * atom(/this/)
   */
  JavaScriptInterpreter.prototype.thisExpression = 
  interpreterMethodFactory.atom(/this/, function() {
    return this.executionContext.thisBinding;
  });
  
  /**
   * wrap(/\[/, "elementList", /\]/)
   */
  JavaScriptInterpreter.prototype.arrayLiteral = 
  interpreterMethodFactory.wrap(/\[/, "elementList", /\]/);
  
  /**
   * star("assignmentExpression", /,/)
   */
  JavaScriptInterpreter.prototype.elementList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
  /**
   * group(/\{/, "propertyNameAndValueList", /,?/, /\}/)
   */
  JavaScriptInterpreter.prototype.objectLiteral = 
  interpreterMethodFactory.group(/\{/, "propertyNameAndValueList", /,?/, /\}/, 
  function(propertyNameAndValueList) {
    var result = {};
    propertyNameAndValueList.map(function(propertyAssignment) {
      result[propertyAssignment.propertyName] = 
          propertyAssignment.assignmentExpression;
    });
    
    return result;
  });
  
  /**
   * star("propertyAssignment", /,/)
   */
  JavaScriptInterpreter.prototype.propertyNameAndValueList = 
  interpreterMethodFactory.star("propertyAssignment", /,/);
  
  /**
   * group("propertyName", /:/, "assignmentExpression")
   */
  JavaScriptInterpreter.prototype.propertyAssignment = 
  interpreterMethodFactory.group("propertyName", /:/, "assignmentExpression");
  
  /**
   * or("identifierName")
   */
  JavaScriptInterpreter.prototype.propertyName = 
  interpreterMethodFactory.or("identifierName");
  
  /**
   * or("newExpression1", "primaryExpression")
   */
  JavaScriptInterpreter.prototype.newExpression = 
  interpreterMethodFactory.or("newExpression1", "primaryExpression");
  
  /**
   * group(/new/, "newExpressionQualifier", "argumentsOpt")
   */
  JavaScriptInterpreter.prototype.newExpression1 = 
  interpreterMethodFactory.group(/new/, "newExpressionQualifier", 
  "argumentsOpt", function(newExpressionQualifier, argumentsOpt) {
    var object = Object.create(newExpressionQualifier.prototype);
    var result = newExpressionQualifier.apply(object, argumentsOpt);
    return result&&typeof result==="object"?result:object;
  });
  
  /**
   * longest("newExpression", "newExpressionQualifier1")
   */
  JavaScriptInterpreter.prototype.newExpressionQualifier = 
  interpreterMethodFactory.longest("newExpression", "newExpressionQualifier1");
  
  /**
   * group("newExpressionQualifier", "qualifier")
   */
  JavaScriptInterpreter.prototype.newExpressionQualifier1 = 
  interpreterMethodFactory.group("newExpressionQualifier", "qualifier",
  function(newExpressionQualifier, qualifier) {
    return newExpressionQualifier[qualifier];
  });
  
  /**
   * opt("args")
   */
  JavaScriptInterpreter.prototype.argumentsOpt = 
  interpreterMethodFactory.opt("args", function(){
    return [];
  });
  
  /**
   * or("callExpression1", "callExpression2", "newExpression")
   */
  JavaScriptInterpreter.prototype.callExpression = 
  interpreterMethodFactory.or("callExpression1", "callExpression2", 
  "newExpression");
  
  /**
   * group("callExpression", "args")
   */
  JavaScriptInterpreter.prototype.callExpression1 = 
  interpreterMethodFactory.group("callExpression", "args", 
  function(callExpression, args) {
    return callExpression.apply(undefined, args);
  });
  
  /**
   * group("callExpressionQualifier", "args")
   */
  JavaScriptInterpreter.prototype.callExpression2 = 
  interpreterMethodFactory.group("callExpressionQualifier", "args", 
  function(callExpressionQualifier, args) {
    return callExpressionQualifier.value.
    apply(callExpressionQualifier.base, args);
  });
  
  /**
   * longest("callExpressionQualifier1", "callExpressionQualifier2")
   */
  JavaScriptInterpreter.prototype.callExpressionQualifier = 
  interpreterMethodFactory.longest("callExpressionQualifier1", 
  "callExpressionQualifier2");
  
  /**
   * group("callExpression", "qualifier")
   */
  JavaScriptInterpreter.prototype.callExpressionQualifier1 = 
  interpreterMethodFactory.group("callExpression", "qualifier", 
  function(callExpression, qualifier) {
    return {
      base: callExpression,
      value: callExpression[qualifier],
    };
  });
  
  /**
   * group("callExpressionQualifier", "qualifier")
   */
  JavaScriptInterpreter.prototype.callExpressionQualifier2 = 
  interpreterMethodFactory.group("callExpressionQualifier", "qualifier", 
  function(callExpressionQualifier, qualifier) {
    return {
      base: callExpressionQualifier.value,
      value: callExpressionQualifier.value[qualifier],
    };
  });
  
  /**
   * or("qualifier1", "qualifier2")
   */
  JavaScriptInterpreter.prototype.qualifier = 
  interpreterMethodFactory.or("qualifier1", "qualifier2");
  
  /**
   * wrap(/\[/, "expression", /\]/)
   */
  JavaScriptInterpreter.prototype.qualifier1 = 
  interpreterMethodFactory.wrap(/\[/, "expression", /\]/);
  
  /**
   * wrap(/\./, "identifierName")
   */
  JavaScriptInterpreter.prototype.qualifier2 = 
  interpreterMethodFactory.wrap(/\./, "identifierName");
  
  /**
   * wrap(/\(/, "argumentList", /\)/)
   */
  JavaScriptInterpreter.prototype.args = 
  interpreterMethodFactory.wrap(/\(/, "argumentList", /\)/);
  
  /**
   * star("assignmentExpression", /,/)
   */
  JavaScriptInterpreter.prototype.argumentList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
  /**
   * or("leftHandSideExpression1", "leftHandSideExpression2", 
   * "identifierReference")
   */
  JavaScriptInterpreter.prototype.leftHandSideExpression = 
  interpreterMethodFactory.or("leftHandSideExpression1", 
  "leftHandSideExpression2", "identifierReference");
  
  /**
   * group("leftHandSideExpression", "qualifier")
   */
  JavaScriptInterpreter.prototype.leftHandSideExpression1 = 
  interpreterMethodFactory.group("leftHandSideExpression", "qualifier", 
  function(leftHandSideExpression, qualifier) {
    return {
      base: leftHandSideExpression.base[leftHandSideExpression.name],
      name: qualifier,
    };
  });
  
  /**
   * group("callExpression", "qualifier")
   */
  JavaScriptInterpreter.prototype.leftHandSideExpression2 = 
  interpreterMethodFactory.group("callExpression", "qualifier", 
  function(leftHandSideExpressionBase, qualifier) {
    return {
      base: leftHandSideExpressionBase,
      name: qualifier,
    };
  });
  
  /**
   * longest("updateExpression1", "updateExpression2", "updateExpression3", 
   * "callExpression", "rightHandSideExpression")
   */
  JavaScriptInterpreter.prototype.updateExpression = 
  interpreterMethodFactory.longest("updateExpression1", "updateExpression2", 
  "updateExpression3", "callExpression", "rightHandSideExpression");
  /**
   * wrap(/delete/, "leftHandSideExpression")
   */
  JavaScriptInterpreter.prototype.updateExpression1 = 
  interpreterMethodFactory.wrap(/delete/, "leftHandSideExpression",  
  function(lhse) {return delete lhse.base[lhse.name];});
  /**
   * wrap("leftHandSideExpression", /\+\+/)
   */
  JavaScriptInterpreter.prototype.updateExpression2 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /\+\+/, 
  function(lhse) {return lhse.base[lhse.name]++;});
  /**
   * wrap("leftHandSideExpression", /--/)
   */
  JavaScriptInterpreter.prototype.updateExpression3 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /--/, 
  function(lhse) {return lhse.base[lhse.name]--;});
  
  /**
   * wrap("leftHandSideExpression")
   */
  JavaScriptInterpreter.prototype.rightHandSideExpression = 
  interpreterMethodFactory.wrap("leftHandSideExpression", 
  function(leftHandSideExpression) {
    return leftHandSideExpression.base[leftHandSideExpression.name];
  });
  
  /**
   * or("updateExpression", "typeChangeExpression2", "typeChangeExpression4", 
   * "typeChangeExpression6")
   */
  JavaScriptInterpreter.prototype.typeChangeExpression = 
  interpreterMethodFactory.or("updateExpression", "typeChangeExpression2", 
  "typeChangeExpression4", "typeChangeExpression6");
  
  /**
   * group(/typeof/, "typeChangeExpression")
   */
  JavaScriptInterpreter.prototype.typeChangeExpression2 = 
  interpreterMethodFactory.group(/typeof/, "typeChangeExpression", 
  function(typeChangeExpression) {return typeof typeChangeExpression;});
  /**
   * group(/-/, "typeChangeExpression")
   */
  JavaScriptInterpreter.prototype.typeChangeExpression4 = 
  interpreterMethodFactory.group(/-/, "typeChangeExpression", 
  function(typeChangeExpression) {return -typeChangeExpression;});
  /**
   * group(/!/, "typeChangeExpression")
   */
  JavaScriptInterpreter.prototype.typeChangeExpression6 = 
  interpreterMethodFactory.group(/!/, "typeChangeExpression", 
  function(typeChangeExpression) {return !typeChangeExpression;});
  
  /**
   * or("multiplicativeExpression1", "typeChangeExpression")
   */
  JavaScriptInterpreter.prototype.multiplicativeExpression = 
  interpreterMethodFactory.or("multiplicativeExpression1", 
  "typeChangeExpression");
  /**
   * 
   */
  JavaScriptInterpreter.prototype.multiplicativeExpression1 = 
  interpreterMethodFactory.group("multiplicativeExpression", /\*/, 
  "typeChangeExpression", function(me, tce) {return me*tce;});
  
  /**
   * or("additiveExpression1", "additiveExpression2", 
   * "multiplicativeExpression")
   */
  JavaScriptInterpreter.prototype.additiveExpression = 
  interpreterMethodFactory.or("additiveExpression1", "additiveExpression2", 
  "multiplicativeExpression");
  /**
   * ("additiveExpression", /\+/, "multiplicativeExpression")
   */
  JavaScriptInterpreter.prototype.additiveExpression1 = 
  interpreterMethodFactory.group("additiveExpression", /\+/, 
  "multiplicativeExpression", function(ae, me) {return ae+me;});
  /**
   * group("additiveExpression", /-/, "multiplicativeExpression")
   */
  JavaScriptInterpreter.prototype.additiveExpression2 = 
  interpreterMethodFactory.group("additiveExpression", /-/, 
  "multiplicativeExpression", function(ae, me) {return ae-me;});
  
  /**
   * or("relationalExpression1", "relationalExpression2", 
   * "relationalExpression5", "additiveExpression")
   */
  JavaScriptInterpreter.prototype.relationalExpression = 
  interpreterMethodFactory.or("relationalExpression1", "relationalExpression2", 
  "relationalExpression5", "additiveExpression");
  /**
   * group("relationalExpression", /</, "additiveExpression")
   */
  JavaScriptInterpreter.prototype.relationalExpression1 = 
  interpreterMethodFactory.group("relationalExpression", /</, 
  "additiveExpression", function(re, ae) {return re<ae;});
  /**
   * group("relationalExpression", />/, "additiveExpression")
   */
  JavaScriptInterpreter.prototype.relationalExpression2 = 
  interpreterMethodFactory.group("relationalExpression", />/, 
  "additiveExpression", function(re, ae) {return re>ae;});
  /**
   * group("relationalExpression", /instanceof/, "additiveExpression")
   */
  JavaScriptInterpreter.prototype.relationalExpression5 = 
  interpreterMethodFactory.group("relationalExpression", /instanceof/, 
  "additiveExpression", function(re, ae) {return re instanceof ae;});
  
  /**
   * or("equalityExpression3", "equalityExpression4", "relationalExpression")
   */
  JavaScriptInterpreter.prototype.equalityExpression = 
  interpreterMethodFactory.or("equalityExpression3", "equalityExpression4", 
  "relationalExpression");
  /**
   * group("equalityExpression", /===/, "relationalExpression")
   */
  JavaScriptInterpreter.prototype.equalityExpression3 = 
  interpreterMethodFactory.group("equalityExpression", /===/, 
  "relationalExpression", function(ee, re) {return ee===re;});
  /**
   * group("equalityExpression", /!==/, "relationalExpression")
   */
  JavaScriptInterpreter.prototype.equalityExpression4 = 
  interpreterMethodFactory.group("equalityExpression", /!==/, 
  "relationalExpression", function(ee, re) {return ee!==re;});
  
  /**
   * or("logicalAndExpression1", "equalityExpression")
   */
  JavaScriptInterpreter.prototype.logicalAndExpression = 
  interpreterMethodFactory.or("logicalAndExpression1", "equalityExpression");
  /**
   * group("logicalAndExpression", /&&/, "deferredEqualityExpression")
   */
  JavaScriptInterpreter.prototype.logicalAndExpression1 = 
  interpreterMethodFactory.group("logicalAndExpression", /&&/, 
  "deferredEqualityExpression", 
  function(logicalAndExpression, deferredEqualityExpression) {
    return logicalAndExpression && deferredEqualityExpression.call(this);
  });
  
  /**
   * methodFactory("equalityExpression")
   */
  JavaScriptInterpreter.prototype.deferredEqualityExpression = 
  interpreterMethodFactory.methodFactory("equalityExpression");
  
  /**
   * or("logicalOrExpression1", "logicalAndExpression")
   */
  JavaScriptInterpreter.prototype.logicalOrExpression = 
  interpreterMethodFactory.or("logicalOrExpression1", "logicalAndExpression");
  /**
   * group("logicalOrExpression", /\|\|/, "deferredLogicalAndExpression")
   */
  JavaScriptInterpreter.prototype.logicalOrExpression1 = 
  interpreterMethodFactory.group("logicalOrExpression", /\|\|/, 
  "deferredLogicalAndExpression", function(logicalOrExpression, 
  deferredLogicalAndExpression) {
    return logicalOrExpression||deferredLogicalAndExpression.call(this);
  });
  
  /**
   * methodFactory("logicalAndExpression")
   */
  JavaScriptInterpreter.prototype.deferredLogicalAndExpression = 
  interpreterMethodFactory.methodFactory("logicalAndExpression");
  
  /**
   * or("conditionalExpression1", "logicalOrExpression")
   */
  JavaScriptInterpreter.prototype.conditionalExpression = 
  interpreterMethodFactory.or("conditionalExpression1", "logicalOrExpression");
  /**
   * group("logicalOrExpression", /\?/, "deferredAssignmentExpression", /:/, 
   * "deferredAssignmentExpression")
   */
  JavaScriptInterpreter.prototype.conditionalExpression1 = 
  interpreterMethodFactory.group("logicalOrExpression", /\?/, 
  "deferredAssignmentExpression", /:/, "deferredAssignmentExpression", 
  function(logicalOrExpression, deferredAssignmentExpression1, 
  deferredAssignmentExpression2) {
    return logicalOrExpression?
      deferredAssignmentExpression1.call(this):
      deferredAssignmentExpression2.call(this);
  });
  
  /**
   * methodFactory("assignmentExpression")
   */
  JavaScriptInterpreter.prototype.deferredAssignmentExpression = 
  interpreterMethodFactory.methodFactory("assignmentExpression");
  
  /**
   * or("assignmentExpression1", "assignmentExpression5", 
   * "conditionalExpression")
   */
  JavaScriptInterpreter.prototype.assignmentExpression = 
  interpreterMethodFactory.or("assignmentExpression1", "assignmentExpression5", 
  "conditionalExpression");
  
  /**
   * group("leftHandSideExpression", /=/, "assignmentExpression")
   */
  JavaScriptInterpreter.prototype.assignmentExpression1 = 
  interpreterMethodFactory.group("leftHandSideExpression", /=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] = assignmentExpression);});
  /**
   * group("leftHandSideExpression", /\+=/, "assignmentExpression")
   */
  JavaScriptInterpreter.prototype.assignmentExpression5 = 
  interpreterMethodFactory.group("leftHandSideExpression", /\+=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] += assignmentExpression);});
  
  /**
   * plus("assignmentExpression", /,/)
   */
  JavaScriptInterpreter.prototype.expression = 
  interpreterMethodFactory.plus("assignmentExpression", /,/, 
  function(assignmentsExpressions) {
    return assignmentsExpressions[assignmentsExpressions.length-1];
  });
  
  // Statements
  
  /**
   * or("statement", "block")
   */
  JavaScriptInterpreter.prototype.statementOrBlock = 
  interpreterMethodFactory.or("statement", "block");
  
  /**
   * methodFactory("statementOrBlock")
   */
  JavaScriptInterpreter.prototype.deferredStatementOrBlock = 
  interpreterMethodFactory.methodFactory("statementOrBlock");
  
  /**
   * wrap(/\{/, "statementList", /\}/)
   */
  JavaScriptInterpreter.prototype.block = 
  interpreterMethodFactory.wrap(/\{/, "statementList", /\}/);
  
  /**
   * star("deferredStatement")
   */
  JavaScriptInterpreter.prototype.statementList = 
  interpreterMethodFactory.star("deferredStatement", 
  function(deferredStatements) {
    for(var i = 0; i < deferredStatements.length; i++) {
      var returnValue = deferredStatements[i].call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * methodFactory("statementList")
   */
  JavaScriptInterpreter.prototype.deferredStatementList = 
  interpreterMethodFactory.methodFactory("statementList");

  /**
   * or("variableStatement", "ifStatement", "iterationStatement", 
   * "returnStatement", "throwStatement", "functionDeclaration", 
   * "expressionStatement")
   */
  JavaScriptInterpreter.prototype.statement = 
  interpreterMethodFactory.or("variableStatement", "ifStatement", 
  "iterationStatement", "returnStatement", "throwStatement", 
  "functionDeclaration", "expressionStatement");
  
  /**
   * methodFactory("statement")
   */
  JavaScriptInterpreter.prototype.deferredStatement = 
  interpreterMethodFactory.methodFactory("statement");
  
  /**
   * group(/var/, "variableDeclarationList", /;/)
   */
  JavaScriptInterpreter.prototype.variableStatement = 
  interpreterMethodFactory.group(/var/, "variableDeclarationList", /;/, 
  function() {
    return ["normal", undefined];
  });
  
  /**
   * plus("variableDeclaration", /,/)
   */
  JavaScriptInterpreter.prototype.variableDeclarationList = 
  interpreterMethodFactory.plus("variableDeclaration", /,/);
  
  /**
   * group("bindingIdentifier", "initialiserOpt")
   */
  JavaScriptInterpreter.prototype.variableDeclaration = 
  interpreterMethodFactory.group("bindingIdentifier", 
  "initialiserOpt", function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
    return bindingIdentifier;
  });
  
  /**
   * wrap(/=/, "assignmentExpression")
   */
  JavaScriptInterpreter.prototype.initialiser = 
  interpreterMethodFactory.wrap(/=/, "assignmentExpression");
  
  /**
   * opt("initialiser")
   */
  JavaScriptInterpreter.prototype.initialiserOpt = 
  interpreterMethodFactory.opt("initialiser", function() {
    return undefined;
  });
  
  /**
   * group("expression", /;/)
   */
  JavaScriptInterpreter.prototype.expressionStatement = 
  interpreterMethodFactory.group("expression", /;/, function() {
    return ["normal", undefined];
  });
  
  /**
   * group(/if/, /\(/, "expression", /\)/, "deferredStatementOrBlock", 
   * "deferredElseStatementOpt")
   */
  JavaScriptInterpreter.prototype.ifStatement = 
  interpreterMethodFactory.group(/if/, /\(/, "expression", /\)/, 
  "deferredStatementOrBlock", "deferredElseStatementOpt", 
  function(expression, deferredStatementOrBlock, deferredElseStatementOpt) {
    if(expression) {
      return deferredStatementOrBlock.call(this);
    } else {
      return deferredElseStatementOpt.call(this);
    }
  });
  
  /**
   * methodFactory("expression")
   */
  JavaScriptInterpreter.prototype.deferredExpression = 
  interpreterMethodFactory.methodFactory("expression");
  
  /**
   * or("iterationStatement2", "iterationStatement4", "iterationStatement6")
   */
  JavaScriptInterpreter.prototype.iterationStatement = 
  interpreterMethodFactory.or("iterationStatement2", "iterationStatement4", 
  "iterationStatement6");
  
  /**
   * group(/while/, /\(/, "deferredExpression", /\)/, 
   * "deferredStatementOrBlock")
   */
  JavaScriptInterpreter.prototype.iterationStatement2 = 
  interpreterMethodFactory.group(/while/, /\(/, "deferredExpression", /\)/, 
  "deferredStatementOrBlock", 
  function(deferredExpression, deferredStatementOrBlock) {
    while(deferredExpression.call(this)) {
      var returnValue = deferredStatementOrBlock.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * group(/for/, /\(/, /var/, "variableDeclarationList", /;/, 
   * "deferredExpression", /;/, "deferredExpression", /\)/, 
   * "deferredStatementOrBlock")
   */
  JavaScriptInterpreter.prototype.iterationStatement4 = 
  interpreterMethodFactory.group(/for/, /\(/, /var/, "variableDeclarationList", 
  /;/, "deferredExpression", /;/, "deferredExpression", /\)/, 
  "deferredStatementOrBlock", 
  function(variableDeclarationList, deferredExpression1, deferredExpression2, 
  deferredStatementOrBlock) {
    for( ; deferredExpression1.call(this); deferredExpression2.call(this)){
      var returnValue = deferredStatementOrBlock.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * group(/for/, /\(/, /var/, "variableDeclaration", /in/, "expression", /\)/, 
   * "deferredStatementOrBlock")
   */
  JavaScriptInterpreter.prototype.iterationStatement6 = 
  interpreterMethodFactory.group(/for/, /\(/, /var/, "variableDeclaration", 
  /in/, "expression", /\)/, "deferredStatementOrBlock", 
  function(variableDeclaration, expression, deferredStatementOrBlock) {
    for(var propertyName in expression) {
      this.executionContext.variables[variableDeclaration] = propertyName;
      var returnValue = deferredStatementOrBlock.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * methodFactory("elseStatementOpt")
   */
  JavaScriptInterpreter.prototype.deferredElseStatementOpt = 
  interpreterMethodFactory.methodFactory("elseStatementOpt");
  
  /**
   * opt("elseStatement")
   */
  JavaScriptInterpreter.prototype.elseStatementOpt = 
  interpreterMethodFactory.opt("elseStatement", 
  function() {
    return ["normal", undefined];
  });
  
  /**
   * wrap(/else/, "statementOrBlock")
   */
  JavaScriptInterpreter.prototype.elseStatement = 
  interpreterMethodFactory.wrap(/else/, "statementOrBlock");
  
  /**
   * group(/return/, "expression", /;/)
   */
  JavaScriptInterpreter.prototype.returnStatement = 
  interpreterMethodFactory.group(/return/, "expression", /;/, 
  function(expression) {
    return ["return", expression];
  });
  
  /**
   * group(/throw/, "expression", /;/)
   */
  JavaScriptInterpreter.prototype.throwStatement = 
  interpreterMethodFactory.group(/throw/, "expression", /;/, 
  function(expression) {
    throw expression;
  });
  
  // Functions and programs
  
  /**
   * wrap("namedFunctionExpression")
   */
  JavaScriptInterpreter.prototype.functionDeclaration = 
  interpreterMethodFactory.wrap("namedFunctionExpression", function() {
    return ["normal", undefined];
  });
  
  /**
   * or("anonymousFunctionExpression", "namedFunctionExpression")
   */
  JavaScriptInterpreter.prototype.functionExpression = 
  interpreterMethodFactory.or("anonymousFunctionExpression",
  "namedFunctionExpression");
  
  /**
   * group(/function/, "bindingIdentifier", "functionExpressionContent")
   */
  JavaScriptInterpreter.prototype.namedFunctionExpression = 
  interpreterMethodFactory.group(/function/, "bindingIdentifier", 
  "functionExpressionContent", 
  function(bindingIdentifier, functionExpressionContent) {
    this.executionContext.variables[bindingIdentifier] = 
        functionExpressionContent;
    return functionExpressionContent;
  });
  
  /**
   * wrap(/function/, "functionExpressionContent")
   */
  JavaScriptInterpreter.prototype.anonymousFunctionExpression = 
  interpreterMethodFactory.wrap(/function/, "functionExpressionContent");
  
  /**
   * group(/\(/, "formalParameterList", /\)/, /\{/, "functionBody", /\}/)
   */
  JavaScriptInterpreter.prototype.functionExpressionContent = 
  interpreterMethodFactory.group(/\(/, "formalParameterList", /\)/, 
  /\{/, "functionBody", /\}/, function(formalParameterList, functionBody) {
    var that = this;
    var outerExecutionContext = this.executionContext;
    return function() {
      var stack = that.executionContext;
      args = {};
      for(var i = 0; i < formalParameterList.length; i++) {
        args[formalParameterList[i]] = arguments[i];
      }
      args["arguments"] = arguments;
      that.executionContext = {
        outer: outerExecutionContext,
        variables: args,
        thisBinding: this,
      };
      
      var result = functionBody.call(that);
      that.executionContext = stack;
      return result[1];
    };
  });
  
  /**
   * star("bindingIdentifier", /,/)
   */
  JavaScriptInterpreter.prototype.formalParameterList = 
  interpreterMethodFactory.star("bindingIdentifier", /,/);
  
  /**
   * select(2, "useStrictDeclarationOpt", "deferredSourceElements")
   */
  JavaScriptInterpreter.prototype.functionBody = 
  interpreterMethodFactory.select(2, "useStrictDeclarationOpt", 
  "deferredSourceElements");
  
  /**
   * opt("useStrictDeclaration")
   */
  JavaScriptInterpreter.prototype.useStrictDeclarationOpt = 
  interpreterMethodFactory.opt("useStrictDeclaration");
  /**
   * group(/('use strict')|("use strict")/, /;/)
   */
  JavaScriptInterpreter.prototype.useStrictDeclaration = 
  interpreterMethodFactory.group(/('use strict')|("use strict")/, /;/);
  
  /**
   * Setting up and calling program1.
   */
  JavaScriptInterpreter.prototype.program = 
  function(code, globalOrDebugging, debugging) {
    var global;
    if(globalOrDebugging === true) {
      debugging = true;
      global = {};
    } else {
      global = globalOrDebugging || {};
    }
    
    this.executionContext = {
      outer: null,
      variables: global,
    };
    
    this.executionContext.thisBinding = this.executionContext.variables;
    
    return this.program1(code, debugging)[1];
  };
  
  /**
   * insignificant("spaces", "sourceElements")
   */
  JavaScriptInterpreter.prototype.program1 = 
  interpreterMethodFactory.insignificant("spaces", "sourceElements");
  
  /**
   * or("statementList")
   */
  JavaScriptInterpreter.prototype.sourceElements = 
  interpreterMethodFactory.or("statementList");
  
  /**
   * methodFactory("sourceElements")
   */
  JavaScriptInterpreter.prototype.deferredSourceElements = 
  interpreterMethodFactory.methodFactory("sourceElements");
  
};

JavaScriptInterpreter.hack();
