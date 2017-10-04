function JavaScriptInterpreter() {
  
}

JavaScriptInterpreter.hack = function() {
  var interpreterMethodFactory = new InterpreterMethodFactory();
  var second = function(x, y) {
    return y;
  };
  
  var identifierName = /[a-zA-Z_\$][a-zA-Z0-9_\$]*/;
  
  // Lexical Grammar
  
  JavaScriptInterpreter.prototype.spaces = 
  interpreterMethodFactory.star("space", function(spaces) {
    return spaces.join("");
  });

  JavaScriptInterpreter.prototype.space = 
  interpreterMethodFactory.or("whiteSpace", "lineTerminator", 
  "singleLineComment", "multiLineComment");
  
  JavaScriptInterpreter.prototype.whiteSpace = 
  interpreterMethodFactory.atom(/\s/);
  
  JavaScriptInterpreter.prototype.lineTerminator = 
  interpreterMethodFactory.atom(/\n/);
  
  JavaScriptInterpreter.prototype.singleLineComment = 
  interpreterMethodFactory.atom(/\/\/.*/);

  JavaScriptInterpreter.prototype.multiLineComment = 
  interpreterMethodFactory.atom(/\/\*\/*(\**[^\*\/]+\/*)*\*+\//);
  
  JavaScriptInterpreter.prototype.identifierName = 
  interpreterMethodFactory.atom(identifierName);
  
  JavaScriptInterpreter.prototype.literal = 
  interpreterMethodFactory.or("undefinedLiteral", "nullLiteral", 
  "booleanLiteral", "numericLiteral", "stringLiteral", 
  "regularExpressionLiteral");
  
  JavaScriptInterpreter.prototype.undefinedLiteral = 
  interpreterMethodFactory.atom(/undefined/, function() {return undefined;});
  
  JavaScriptInterpreter.prototype.nullLiteral = 
  interpreterMethodFactory.atom(/null/, function() {return null;});
  
  JavaScriptInterpreter.prototype.booleanLiteral = 
  interpreterMethodFactory.or("trueLiteral", "falseLiteral");
  
  JavaScriptInterpreter.prototype.trueLiteral = 
  interpreterMethodFactory.atom(/true/, function() {return true;});
  
  JavaScriptInterpreter.prototype.falseLiteral = 
  interpreterMethodFactory.atom(/false/, function() {return false;});
  
  JavaScriptInterpreter.prototype.numericLiteral = 
  interpreterMethodFactory.atom(/\d+/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  JavaScriptInterpreter.prototype.stringLiteral = 
  interpreterMethodFactory.
  insignificant(null, "stringLiteralSignificantSpaces");
  
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces = 
  interpreterMethodFactory.or("stringLiteralSignificantSpaces1", 
  "stringLiteralSignificantSpaces2");
  
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces1 = 
  interpreterMethodFactory.wrap(/"/, "doubleStringCharacters", /"/);
  
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces2 = 
  interpreterMethodFactory.wrap(/'/, "singleStringCharacters", /'/);
  
  var unescape = function(s) {
    s = s.replace(/\\['"\\bfnrtv]/g, function(match) {
      return characterEscapeSequence[match];
    });
    
    return s;
  };
  
  JavaScriptInterpreter.prototype.doubleStringCharacters = 
  interpreterMethodFactory.atom(/([^"\\]|(\\.))*/, unescape);
  
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
  
  JavaScriptInterpreter.prototype.regularExpressionLiteral = 
  interpreterMethodFactory.
  insignificant(null, "regularExpressionLiteralSignificantSpaces");
  
  JavaScriptInterpreter.prototype.regularExpressionLiteralSignificantSpaces = 
  interpreterMethodFactory.wrap(/\//, "regularExpressionBody", /\//);
  
  JavaScriptInterpreter.prototype.regularExpressionBody = 
  interpreterMethodFactory.atom(/([^/\\\[]|(\\.)|(\[([^\]\\]|(\\.))*\]))+/, 
  function(regularExpressionBody) {
    return new RegExp(regularExpressionBody);
  });
  
  // Expressions
  
  JavaScriptInterpreter.prototype.identifierReference = 
  interpreterMethodFactory.wrap("bindingIdentifier", 
  function(bindingIdentifier) {
    var base = this.executionContext;
    while(!base.variables.hasOwnProperty(bindingIdentifier)) {
      base = base.outer;
    }
    
    return {
      base: base.variables,
      name: bindingIdentifier,
    };
    
  });
  
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
  
  JavaScriptInterpreter.prototype.bindingIdentifier = 
  interpreterMethodFactory.atom(identifierName, reservedWord);
  
  JavaScriptInterpreter.prototype.primaryExpression = 
  interpreterMethodFactory.or("literal", "objectExpression");
  
  JavaScriptInterpreter.prototype.objectExpression = 
  interpreterMethodFactory.or("identifierExpression", "arrayLiteral", 
  "objectLiteral", "functionExpression", "objectExpression1", "thisExpression");
  
  JavaScriptInterpreter.prototype.objectExpression1 = 
  interpreterMethodFactory.wrap(/\(/, "expression", /\)/);
  
  JavaScriptInterpreter.prototype.thisExpression = 
  interpreterMethodFactory.atom(/this/, function() {
    return this.executionContext.thisBinding;
  });
  
  JavaScriptInterpreter.prototype.arrayLiteral = 
  interpreterMethodFactory.wrap(/\[/, "elementList", /\]/);
  
  JavaScriptInterpreter.prototype.elementList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
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
  
  JavaScriptInterpreter.prototype.propertyNameAndValueList = 
  interpreterMethodFactory.star("propertyAssignment", /,/);
  
  JavaScriptInterpreter.prototype.propertyAssignment = 
  interpreterMethodFactory.group("propertyName", /:/, "assignmentExpression");
  
  JavaScriptInterpreter.prototype.propertyName = 
  interpreterMethodFactory.or("identifierName");
  
  JavaScriptInterpreter.prototype.newExpression = 
  interpreterMethodFactory.or("newExpression1", "primaryExpression");
  
  JavaScriptInterpreter.prototype.newExpression1 = 
  interpreterMethodFactory.group(/new/, "newExpressionQualifier", 
  "argumentsOpt", function(newExpressionQualifier, argumentsOpt) {
    var object = Object.create(newExpressionQualifier.prototype);
    var result = newExpressionQualifier.apply(object, argumentsOpt);
    return result&&typeof result==="object"?result:object;
  });
  
  JavaScriptInterpreter.prototype.newExpressionQualifier = 
  interpreterMethodFactory.longest("newExpression", "newExpressionQualifier1");
  
  JavaScriptInterpreter.prototype.newExpressionQualifier1 = 
  interpreterMethodFactory.group("newExpressionQualifier", "qualifier",
  function(newExpressionQualifier, qualifier) {
    return newExpressionQualifier[qualifier];
  });
  
  JavaScriptInterpreter.prototype.argumentsOpt = 
  interpreterMethodFactory.opt("args", function(){
    return [];
  });
  
  JavaScriptInterpreter.prototype.callExpression = 
  interpreterMethodFactory.or("callExpression1", "callExpression2", 
  "newExpression");
  
  JavaScriptInterpreter.prototype.callExpression1 = 
  interpreterMethodFactory.group("callExpression", "args", 
  function(callExpression, args) {
    return callExpression.apply(undefined, args);
  });
  
  JavaScriptInterpreter.prototype.callExpression2 = 
  interpreterMethodFactory.group("callExpressionQualifier", "args", 
  function(callExpressionQualifier, args) {
    return callExpressionQualifier.value.
    apply(callExpressionQualifier.base, args);
  });
  
  JavaScriptInterpreter.prototype.callExpressionQualifier = 
  interpreterMethodFactory.longest("callExpressionQualifier1", 
  "callExpressionQualifier2");
  
  JavaScriptInterpreter.prototype.callExpressionQualifier1 = 
  interpreterMethodFactory.group("callExpression", "qualifier", 
  function(callExpression, qualifier) {
    return {
      base: callExpression,
      value: callExpression[qualifier],
    };
  });
  
  JavaScriptInterpreter.prototype.callExpressionQualifier2 = 
  interpreterMethodFactory.group("callExpressionQualifier", "qualifier", 
  function(callExpressionQualifier, qualifier) {
    return {
      base: callExpressionQualifier.value,
      value: callExpressionQualifier.value[qualifier],
    };
  });
  
  JavaScriptInterpreter.prototype.qualifier = 
  interpreterMethodFactory.or("qualifier1", "qualifier2");
  
  JavaScriptInterpreter.prototype.qualifier1 = 
  interpreterMethodFactory.wrap(/\[/, "expression", /\]/);
  
  JavaScriptInterpreter.prototype.qualifier2 = 
  interpreterMethodFactory.wrap(/\./, "identifierName");
  
  JavaScriptInterpreter.prototype.args = 
  interpreterMethodFactory.wrap(/\(/, "argumentList", /\)/);
  
  JavaScriptInterpreter.prototype.argumentList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
  JavaScriptInterpreter.prototype.leftHandSideExpression = 
  interpreterMethodFactory.or("leftHandSideExpression1", 
  "leftHandSideExpression2", "identifierReference");
  
  JavaScriptInterpreter.prototype.leftHandSideExpression1 = 
  interpreterMethodFactory.group("leftHandSideExpression", "qualifier", 
  function(leftHandSideExpression, qualifier) {
    return {
      base: leftHandSideExpression.base[leftHandSideExpression.name],
      name: qualifier,
    };
  });
  
  JavaScriptInterpreter.prototype.leftHandSideExpression2 = 
  interpreterMethodFactory.group("callExpression", "qualifier", 
  function(leftHandSideExpressionBase, qualifier) {
    return {
      base: leftHandSideExpressionBase,
      name: qualifier,
    };
  });
  
  JavaScriptInterpreter.prototype.updateExpression = 
  interpreterMethodFactory.longest("updateExpression1", "updateExpression2", 
  "updateExpression3", "callExpression", "rightHandSideExpression");
  JavaScriptInterpreter.prototype.updateExpression1 = 
  interpreterMethodFactory.wrap(/delete/, "leftHandSideExpression",  
  function(lhse) {return delete lhse.base[lhse.name];});
  JavaScriptInterpreter.prototype.updateExpression2 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /\+\+/, 
  function(lhse) {return lhse.base[lhse.name]++;});
  JavaScriptInterpreter.prototype.updateExpression3 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /--/, 
  function(lhse) {return lhse.base[lhse.name]--;});
  
  JavaScriptInterpreter.prototype.rightHandSideExpression = 
  interpreterMethodFactory.wrap("leftHandSideExpression", 
  function(leftHandSideExpression) {
    return leftHandSideExpression.base[leftHandSideExpression.name];
  });
  
  JavaScriptInterpreter.prototype.typeChangeExpression = 
  interpreterMethodFactory.or("updateExpression", "typeChangeExpression2", 
  "typeChangeExpression4", "typeChangeExpression6");
  
  JavaScriptInterpreter.prototype.typeChangeExpression2 = 
  interpreterMethodFactory.group(/typeof/, "typeChangeExpression", 
  function(typeChangeExpression) {return typeof typeChangeExpression;});
  JavaScriptInterpreter.prototype.typeChangeExpression4 = 
  interpreterMethodFactory.group(/-/, "typeChangeExpression", 
  function(typeChangeExpression) {return -typeChangeExpression;});
  JavaScriptInterpreter.prototype.typeChangeExpression6 = 
  interpreterMethodFactory.group(/!/, "typeChangeExpression", 
  function(typeChangeExpression) {return !typeChangeExpression;});
  
  JavaScriptInterpreter.prototype.multiplicativeExpression = 
  interpreterMethodFactory.or("multiplicativeExpression1", 
  "typeChangeExpression");
  JavaScriptInterpreter.prototype.multiplicativeExpression1 = 
  interpreterMethodFactory.group("multiplicativeExpression", /\*/,
  "typeChangeExpression", function(me, tce) {return me*tce;});
  
  JavaScriptInterpreter.prototype.additiveExpression = 
  interpreterMethodFactory.or("additiveExpression1", "additiveExpression2", 
  "multiplicativeExpression");
  JavaScriptInterpreter.prototype.additiveExpression1 = 
  interpreterMethodFactory.group("additiveExpression", /\+/, 
  "multiplicativeExpression", function(ae, me) {return ae+me;});
  JavaScriptInterpreter.prototype.additiveExpression2 = 
  interpreterMethodFactory.group("additiveExpression", /-/, 
  "multiplicativeExpression", function(ae, me) {return ae-me;});
  
  JavaScriptInterpreter.prototype.relationalExpression = 
  interpreterMethodFactory.or("relationalExpression1", "relationalExpression2", 
  "relationalExpression5", "additiveExpression");
  JavaScriptInterpreter.prototype.relationalExpression1 = 
  interpreterMethodFactory.group("relationalExpression", /</, 
  "additiveExpression", function(re, ae) {return re<ae;});
  JavaScriptInterpreter.prototype.relationalExpression2 = 
  interpreterMethodFactory.group("relationalExpression", />/, 
  "additiveExpression", function(re, ae) {return re>ae;});
  JavaScriptInterpreter.prototype.relationalExpression5 = 
  interpreterMethodFactory.group("relationalExpression", /instanceof/, 
  "additiveExpression", function(re, ae) {return re instanceof ae;});
  
  JavaScriptInterpreter.prototype.equalityExpression = 
  interpreterMethodFactory.or("equalityExpression3", "equalityExpression4", 
  "relationalExpression");
  JavaScriptInterpreter.prototype.equalityExpression3 = 
  interpreterMethodFactory.group("equalityExpression", /===/, 
  "relationalExpression", function(ee, re) {return ee===re;});
  JavaScriptInterpreter.prototype.equalityExpression4 = 
  interpreterMethodFactory.group("equalityExpression", /!==/, 
  "relationalExpression", function(ee, re) {return ee!==re;});
  
  JavaScriptInterpreter.prototype.logicalAndExpression = 
  interpreterMethodFactory.or("logicalAndExpression1", "equalityExpression");
  JavaScriptInterpreter.prototype.logicalAndExpression1 = 
  interpreterMethodFactory.group("logicalAndExpression", /&&/, 
  "deferredEqualityExpression", 
  function(logicalAndExpression, deferredEqualityExpression) {
    return logicalAndExpression && deferredEqualityExpression.call(this);
  });
  
  JavaScriptInterpreter.prototype.deferredEqualityExpression = 
  interpreterMethodFactory.methodFactory("equalityExpression");
  
  JavaScriptInterpreter.prototype.logicalOrExpression = 
  interpreterMethodFactory.or("logicalOrExpression1", "logicalAndExpression");
  JavaScriptInterpreter.prototype.logicalOrExpression1 = 
  interpreterMethodFactory.group("logicalOrExpression", /\|\|/, 
  "deferredLogicalAndExpression", function(logicalOrExpression, 
  deferredLogicalAndExpression) {
    return logicalOrExpression||deferredLogicalAndExpression.call(this);
  });
  
  JavaScriptInterpreter.prototype.deferredLogicalAndExpression = 
  interpreterMethodFactory.methodFactory("logicalAndExpression");
  
  JavaScriptInterpreter.prototype.conditionalExpression = 
  interpreterMethodFactory.or("conditionalExpression1", "logicalOrExpression");
  JavaScriptInterpreter.prototype.conditionalExpression1 = 
  interpreterMethodFactory.group("logicalOrExpression", /\?/, 
  "deferredAssignmentExpression", /:/, "deferredAssignmentExpression", 
  function(logicalOrExpression, deferredAssignmentExpression1, 
  deferredAssignmentExpression2) {
    return logicalOrExpression?
      deferredAssignmentExpression1.call(this):
      deferredAssignmentExpression2.call(this);
  });
  
  JavaScriptInterpreter.prototype.deferredAssignmentExpression = 
  interpreterMethodFactory.methodFactory("assignmentExpression");
  
  JavaScriptInterpreter.prototype.assignmentExpression = 
  interpreterMethodFactory.or("assignmentExpression1", "assignmentExpression5", 
  "conditionalExpression");
  
  JavaScriptInterpreter.prototype.assignmentExpression1 = 
  interpreterMethodFactory.group("leftHandSideExpression", /=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] = assignmentExpression);});
  JavaScriptInterpreter.prototype.assignmentExpression5 = 
  interpreterMethodFactory.group("leftHandSideExpression", /\+=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] += assignmentExpression);});
  
  JavaScriptInterpreter.prototype.expression = 
  interpreterMethodFactory.plus("assignmentExpression", /,/, 
  function(assignmentsExpressions) {
    return assignmentsExpressions[assignmentsExpressions.length-1];
  });
  
  // Statements
  
  JavaScriptInterpreter.prototype.statementOrBlock = 
  interpreterMethodFactory.or("statement", "block");
  
  JavaScriptInterpreter.prototype.deferredStatementOrBlock = 
  interpreterMethodFactory.methodFactory("statementOrBlock");
  
  JavaScriptInterpreter.prototype.block = 
  interpreterMethodFactory.wrap(/\{/, "statementList", /\}/);
  
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
  
  JavaScriptInterpreter.prototype.deferredStatementList = 
  interpreterMethodFactory.methodFactory("statementList");

  JavaScriptInterpreter.prototype.statement = 
  interpreterMethodFactory.or("variableStatement", "ifStatement", 
  "iterationStatement", "returnStatement", "throwStatement", 
  "functionDeclaration", "expressionStatement");
  
  JavaScriptInterpreter.prototype.deferredStatement = 
  interpreterMethodFactory.methodFactory("statement");
  
  JavaScriptInterpreter.prototype.variableStatement = 
  interpreterMethodFactory.group(/var/, "variableDeclarationList", /;/, 
  function() {
    return ["normal", undefined];
  });
  
  JavaScriptInterpreter.prototype.variableDeclarationList = 
  interpreterMethodFactory.plus("variableDeclaration", /,/);
  
  JavaScriptInterpreter.prototype.variableDeclaration = 
  interpreterMethodFactory.group("bindingIdentifier", 
  "initialiserOpt", function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
    return bindingIdentifier;
  });
  
  JavaScriptInterpreter.prototype.initialiser = 
  interpreterMethodFactory.wrap(/=/, "assignmentExpression");
  
  JavaScriptInterpreter.prototype.initialiserOpt = 
  interpreterMethodFactory.opt("initialiser", function() {
    return undefined;
  });
  
  JavaScriptInterpreter.prototype.expressionStatement = 
  interpreterMethodFactory.group("expression", /;/, function() {
    return ["normal", undefined];
  });
  
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
  
  JavaScriptInterpreter.prototype.deferredExpression = 
  interpreterMethodFactory.methodFactory("expression");
  
  JavaScriptInterpreter.prototype.iterationStatement = 
  interpreterMethodFactory.or("iterationStatement2", "iterationStatement4", 
  "iterationStatement6");
  
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
  
  JavaScriptInterpreter.prototype.deferredElseStatementOpt = 
  interpreterMethodFactory.methodFactory("elseStatementOpt");
  
  JavaScriptInterpreter.prototype.elseStatementOpt = 
  interpreterMethodFactory.opt("elseStatement", 
  function() {
    return ["normal", undefined];
  });
  
  JavaScriptInterpreter.prototype.elseStatement = 
  interpreterMethodFactory.wrap(/else/, "statementOrBlock");
  
  JavaScriptInterpreter.prototype.returnStatement = 
  interpreterMethodFactory.group(/return/, "expression", /;/, 
  function(expression) {
    return ["return", expression];
  });
  
  JavaScriptInterpreter.prototype.throwStatement = 
  interpreterMethodFactory.group(/throw/, "expression", /;/, 
  function(expression) {
    throw expression;
  });
  
  // Functions and programs
  
  JavaScriptInterpreter.prototype.functionDeclaration = 
  interpreterMethodFactory.wrap("namedFunctionExpression", function() {
    return ["normal", undefined];
  });
  
  JavaScriptInterpreter.prototype.functionExpression = 
  interpreterMethodFactory.or("anonymousFunctionExpression",
  "namedFunctionExpression");
  
  JavaScriptInterpreter.prototype.namedFunctionExpression = 
  interpreterMethodFactory.group(/function/, "bindingIdentifier",
  "functionExpressionContent", 
  function(bindingIdentifier, functionExpressionContent) {
    this.executionContext.variables[bindingIdentifier] = 
        functionExpressionContent;
    return functionExpressionContent;
  });
  
  JavaScriptInterpreter.prototype.anonymousFunctionExpression = 
  interpreterMethodFactory.wrap(/function/, "functionExpressionContent");
  
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
  
  JavaScriptInterpreter.prototype.formalParameterList = 
  interpreterMethodFactory.star("bindingIdentifier", /,/);
  
  JavaScriptInterpreter.prototype.functionBody = 
  interpreterMethodFactory.select(2, "useStrictDeclarationOpt", 
  "deferredSourceElements");
  
  JavaScriptInterpreter.prototype.useStrictDeclarationOpt = 
  interpreterMethodFactory.opt("useStrictDeclaration");
  JavaScriptInterpreter.prototype.useStrictDeclaration = 
  interpreterMethodFactory.group(/('use strict')|("use strict")/, /;/);
  
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
  
  JavaScriptInterpreter.prototype.program1 = 
  interpreterMethodFactory.insignificant("spaces", "sourceElements");
  
  JavaScriptInterpreter.prototype.sourceElements = 
  interpreterMethodFactory.or("statementList");
  
  JavaScriptInterpreter.prototype.deferredSourceElements = 
  interpreterMethodFactory.methodFactory("sourceElements");
  
};

JavaScriptInterpreter.hack();
