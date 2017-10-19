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
  /**
   * <tt>{@link InterpreterMethodFactory#star|star} ("space")</tt>
   */
  JavaScriptInterpreter.prototype.spaces = 
  interpreterMethodFactory.star("space", function(spaces) {
    return spaces.join("");
  });

  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("whiteSpace", "lineTerminator", 
   * "singleLineComment", "multiLineComment")</tt>
   */
  JavaScriptInterpreter.prototype.space = 
  interpreterMethodFactory.or("whiteSpace", "lineTerminator", 
  "singleLineComment", "multiLineComment");
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/\s/)</tt>
   */
  JavaScriptInterpreter.prototype.whiteSpace = 
  interpreterMethodFactory.atom(/\s/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/\n/)</tt>
   */
  JavaScriptInterpreter.prototype.lineTerminator = 
  interpreterMethodFactory.atom(/\n/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/\/\/.*</tt><tt>/)</tt>
   */
  JavaScriptInterpreter.prototype.singleLineComment = 
  interpreterMethodFactory.atom(/\/\/.*/);

  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} 
   * (/\/\*\/*(\**[^\*\/]+\/*)*\*+\//)</tt>
   */
  JavaScriptInterpreter.prototype.multiLineComment = 
  interpreterMethodFactory.atom(/\/\*\/*(\**[^\*\/]+\/*)*\*+\//);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (identifierName)</tt>
   */
  JavaScriptInterpreter.prototype.identifierName = 
  interpreterMethodFactory.atom(identifierName);
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("undefinedLiteral", 
   * "nullLiteral", "booleanLiteral", "numericLiteral", "stringLiteral", 
   * "regularExpressionLiteral")</tt>
   */
  JavaScriptInterpreter.prototype.literal = 
  interpreterMethodFactory.or("undefinedLiteral", "nullLiteral", 
  "booleanLiteral", "numericLiteral", "stringLiteral", 
  "regularExpressionLiteral");
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/undefined/, function() 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.undefinedLiteral = 
  interpreterMethodFactory.atom(/undefined/, function() {return undefined;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/null/, function() 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.nullLiteral = 
  interpreterMethodFactory.atom(/null/, function() {return null;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("trueLiteral", 
   * "falseLiteral")</tt>
   */
  JavaScriptInterpreter.prototype.booleanLiteral = 
  interpreterMethodFactory.or("trueLiteral", "falseLiteral");
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/true/, function() 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.trueLiteral = 
  interpreterMethodFactory.atom(/true/, function() {return true;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/false/, function() 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.falseLiteral = 
  interpreterMethodFactory.atom(/false/, function() {return false;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/\d+/, 
   * function(numericLiteral) {...})</tt>
   */
  JavaScriptInterpreter.prototype.numericLiteral = 
  interpreterMethodFactory.atom(/\d+/, function(numericLiteral) {
    return Number(numericLiteral);
  });
  
  /**
   * <tt>insignificant(null, "stringLiteralSignificantSpaces")</tt>
   */
  JavaScriptInterpreter.prototype.stringLiteral = 
  interpreterMethodFactory.
  insignificant(null, "stringLiteralSignificantSpaces");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or}
   * ("stringLiteralSignificantSpaces1", 
   * "stringLiteralSignificantSpaces2")</tt>
   */
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces = 
  interpreterMethodFactory.or("stringLiteralSignificantSpaces1", 
  "stringLiteralSignificantSpaces2");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/"/, 
   * "doubleStringCharacters", /"/)</tt>
   */
  JavaScriptInterpreter.prototype.stringLiteralSignificantSpaces1 = 
  interpreterMethodFactory.wrap(/"/, "doubleStringCharacters", /"/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/'/, 
   * "singleStringCharacters", /'/)</tt>
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
   * <tt>{@link InterpreterMethodFactory#atom|atom}
   * (/([^"\\]|(\\.))*</tt><tt>/)</tt>
   */
  JavaScriptInterpreter.prototype.doubleStringCharacters = 
  interpreterMethodFactory.atom(/([^"\\]|(\\.))*/, unescape);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom}
   * (/([^'\\]|(\\.))*</tt><tt>/)</tt>
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
   * <tt>insignificant(null, "regularExpressionLiteralSignificantSpaces")</tt>
   */
  JavaScriptInterpreter.prototype.regularExpressionLiteral = 
  interpreterMethodFactory.
  insignificant(null, "regularExpressionLiteralSignificantSpaces");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\//, 
   * "regularExpressionBody", /\//)</tt>
   */
  JavaScriptInterpreter.prototype.regularExpressionLiteralSignificantSpaces = 
  interpreterMethodFactory.wrap(/\//, "regularExpressionBody", /\//);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom}
   * (/([^/\\\[]|(\\.)|(\[([^\]\\]|(\\.))*\]))+/, 
   * function(regularExpressionBody) {...})</tt>
   */
  JavaScriptInterpreter.prototype.regularExpressionBody = 
  interpreterMethodFactory.atom(/([^/\\\[]|(\\.)|(\[([^\]\\]|(\\.))*\]))+/, 
  function(regularExpressionBody) {
    return new RegExp(regularExpressionBody);
  });
  
  // Expressions
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} ("bindingIdentifier", 
   * function(bindingIdentifier) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} ("identifierReference", 
   * function(identifierReference) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#atom|atom} (identifierName, 
   * reservedWord)</tt>
   */
  JavaScriptInterpreter.prototype.bindingIdentifier = 
  interpreterMethodFactory.atom(identifierName, reservedWord);
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("literal", 
   * "objectExpression")</tt>
   */
  JavaScriptInterpreter.prototype.primaryExpression = 
  interpreterMethodFactory.or("literal", "objectExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("identifierExpression", 
   * "arrayLiteral", "objectLiteral", 
   * "functionExpression", "objectExpression1", "thisExpression")</tt>
   */
  JavaScriptInterpreter.prototype.objectExpression = 
  interpreterMethodFactory.or("identifierExpression", "arrayLiteral", 
  "objectLiteral", "functionExpression", "objectExpression1", "thisExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\(/, "expression", 
   * /\)/)</tt>
   */
  JavaScriptInterpreter.prototype.objectExpression1 = 
  interpreterMethodFactory.wrap(/\(/, "expression", /\)/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#atom|atom} (/this/, function() 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.thisExpression = 
  interpreterMethodFactory.atom(/this/, function() {
    return this.executionContext.thisBinding;
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\[/, "elementList", 
   * /\]/)</tt>
   */
  JavaScriptInterpreter.prototype.arrayLiteral = 
  interpreterMethodFactory.wrap(/\[/, "elementList", /\]/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#star|star} ("assignmentExpression", 
   * /,/)</tt>
   */
  JavaScriptInterpreter.prototype.elementList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/\{/, 
   * "propertyNameAndValueList", /,?/, /\}/, function(propertyNameAndValueList) 
   * {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#star|star} ("propertyAssignment", 
   * /,/)</tt>
   */
  JavaScriptInterpreter.prototype.propertyNameAndValueList = 
  interpreterMethodFactory.star("propertyAssignment", /,/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("propertyName", /:/, 
   * "assignmentExpression")</tt>
   */
  JavaScriptInterpreter.prototype.propertyAssignment = 
  interpreterMethodFactory.group("propertyName", /:/, "assignmentExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("identifierName")</tt>
   */
  JavaScriptInterpreter.prototype.propertyName = 
  interpreterMethodFactory.or("identifierName");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("newExpression1", 
   * "primaryExpression")</tt>
   */
  JavaScriptInterpreter.prototype.newExpression = 
  interpreterMethodFactory.or("newExpression1", "primaryExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/new/, 
   * "newExpressionQualifier", "argumentsOpt", function(newExpressionQualifier, 
   * argumentsOpt) {...})</tt>
   */
  JavaScriptInterpreter.prototype.newExpression1 = 
  interpreterMethodFactory.group(/new/, "newExpressionQualifier", 
  "argumentsOpt", function(newExpressionQualifier, argumentsOpt) {
    var object = Object.create(newExpressionQualifier.prototype);
    var result = newExpressionQualifier.apply(object, argumentsOpt);
    return result&&typeof result==="object"?result:object;
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#longest|longest} ("newExpression", 
   * "newExpressionQualifier1")</tt>
   */
  JavaScriptInterpreter.prototype.newExpressionQualifier = 
  interpreterMethodFactory.longest("newExpression", "newExpressionQualifier1");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("newExpressionQualifier", 
   * "qualifier", function(newExpressionQualifier, qualifier) {...})</tt>
   */
  JavaScriptInterpreter.prototype.newExpressionQualifier1 = 
  interpreterMethodFactory.group("newExpressionQualifier", "qualifier",
  function(newExpressionQualifier, qualifier) {
    return newExpressionQualifier[qualifier];
  });
  
  /**
   * <tt>opt("args", function(){...})</tt>
   */
  JavaScriptInterpreter.prototype.argumentsOpt = 
  interpreterMethodFactory.opt("args", function(){
    return [];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("callExpression1", 
   * "callExpression2", "newExpression")</tt>
   */
  JavaScriptInterpreter.prototype.callExpression = 
  interpreterMethodFactory.or("callExpression1", "callExpression2", 
  "newExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("callExpression", 
   * "args", function(callExpression, args) {...})</tt>
   */
  JavaScriptInterpreter.prototype.callExpression1 = 
  interpreterMethodFactory.group("callExpression", "args", 
  function(callExpression, args) {
    return callExpression.apply(undefined, args);
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} 
   * ("callExpressionQualifier", "args", function(callExpressionQualifier, 
   * args) {...})</tt>
   */
  JavaScriptInterpreter.prototype.callExpression2 = 
  interpreterMethodFactory.group("callExpressionQualifier", "args", 
  function(callExpressionQualifier, args) {
    return callExpressionQualifier.value.
    apply(callExpressionQualifier.base, args);
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#longest|longest}
   * ("callExpressionQualifier1", "callExpressionQualifier2")</tt>
   */
  JavaScriptInterpreter.prototype.callExpressionQualifier = 
  interpreterMethodFactory.longest("callExpressionQualifier1", 
  "callExpressionQualifier2");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("callExpression", 
   * "qualifier", function(callExpression, qualifier) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#group|group} 
   * ("callExpressionQualifier", "qualifier", function(callExpressionQualifier, 
   * qualifier) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#or|or} ("qualifier1", 
   * "qualifier2")</tt>
   */
  JavaScriptInterpreter.prototype.qualifier = 
  interpreterMethodFactory.or("qualifier1", "qualifier2");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\[/, "expression", 
   * /\]/)</tt>
   */
  JavaScriptInterpreter.prototype.qualifier1 = 
  interpreterMethodFactory.wrap(/\[/, "expression", /\]/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\./, 
   * "identifierName")</tt>
   */
  JavaScriptInterpreter.prototype.qualifier2 = 
  interpreterMethodFactory.wrap(/\./, "identifierName");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\(/, "argumentList", 
   * 
   * /\)/)</tt>
   */
  JavaScriptInterpreter.prototype.args = 
  interpreterMethodFactory.wrap(/\(/, "argumentList", /\)/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#star|star} ("assignmentExpression", 
   * /,/)</tt>
   */
  JavaScriptInterpreter.prototype.argumentList = 
  interpreterMethodFactory.star("assignmentExpression", /,/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("leftHandSideExpression1", 
   * "leftHandSideExpression2", 
   * "identifierReference")</tt>
   */
  JavaScriptInterpreter.prototype.leftHandSideExpression = 
  interpreterMethodFactory.or("leftHandSideExpression1", 
  "leftHandSideExpression2", "identifierReference");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("leftHandSideExpression", 
   * "qualifier", function(leftHandSideExpression, qualifier) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#group|group} ("callExpression", 
   * "qualifier", function(leftHandSideExpressionBase, qualifier) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#longest|longest} ("updateExpression1", 
   * "updateExpression2", "updateExpression3", "callExpression", 
   * "rightHandSideExpression")</tt>
   */
  JavaScriptInterpreter.prototype.updateExpression = 
  interpreterMethodFactory.longest("updateExpression1", "updateExpression2", 
  "updateExpression3", "callExpression", "rightHandSideExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/delete/, 
   * "leftHandSideExpression", function(lhse) {...})</tt>
   */
  JavaScriptInterpreter.prototype.updateExpression1 = 
  interpreterMethodFactory.wrap(/delete/, "leftHandSideExpression",  
  function(lhse) {return delete lhse.base[lhse.name];});
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} ("leftHandSideExpression", 
   * /\+\+/, function(lhse) {...})</tt>
   */
  JavaScriptInterpreter.prototype.updateExpression2 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /\+\+/, 
  function(lhse) {return lhse.base[lhse.name]++;});
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} ("leftHandSideExpression", 
   * /--/, function(lhse) {...})</tt>
   */
  JavaScriptInterpreter.prototype.updateExpression3 = 
  interpreterMethodFactory.wrap("leftHandSideExpression", /--/, 
  function(lhse) {return lhse.base[lhse.name]--;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap}
   * ("leftHandSideExpression", function(lhse) {...})</tt>
   */
  JavaScriptInterpreter.prototype.rightHandSideExpression = 
  interpreterMethodFactory.wrap("leftHandSideExpression", 
  function(leftHandSideExpression) {
    return leftHandSideExpression.base[leftHandSideExpression.name];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("updateExpression", 
   * "typeChangeExpression2", "typeChangeExpression4", 
   * "typeChangeExpression6")</tt>
   */
  JavaScriptInterpreter.prototype.typeChangeExpression = 
  interpreterMethodFactory.or("updateExpression", "typeChangeExpression2", 
  "typeChangeExpression4", "typeChangeExpression6");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/typeof/, 
   * "typeChangeExpression", function(typeChangeExpression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.typeChangeExpression2 = 
  interpreterMethodFactory.group(/typeof/, "typeChangeExpression", 
  function(typeChangeExpression) {return typeof typeChangeExpression;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/-/, 
   * "typeChangeExpression", function(typeChangeExpression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.typeChangeExpression4 = 
  interpreterMethodFactory.group(/-/, "typeChangeExpression", 
  function(typeChangeExpression) {return -typeChangeExpression;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/!/, 
   * "typeChangeExpression", function(typeChangeExpression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.typeChangeExpression6 = 
  interpreterMethodFactory.group(/!/, "typeChangeExpression", 
  function(typeChangeExpression) {return !typeChangeExpression;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("multiplicativeExpression1", 
   * "typeChangeExpression")</tt>
   */
  JavaScriptInterpreter.prototype.multiplicativeExpression = 
  interpreterMethodFactory.or("multiplicativeExpression1", 
  "typeChangeExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group}
   * ("multiplicativeExpression", /\*</tt><tt>/, "typeChangeExpression", 
   * function(me, tce) {...})</tt>
   */
  JavaScriptInterpreter.prototype.multiplicativeExpression1 = 
  interpreterMethodFactory.group("multiplicativeExpression", /\*/, 
  "typeChangeExpression", function(me, tce) {return me*tce;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("additiveExpression1", 
   * "additiveExpression2", "multiplicativeExpression")</tt>
   */
  JavaScriptInterpreter.prototype.additiveExpression = 
  interpreterMethodFactory.or("additiveExpression1", "additiveExpression2", 
  "multiplicativeExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("additiveExpression", 
   * /\+/, "multiplicativeExpression", function(ae, me) {...})</tt>
   */
  JavaScriptInterpreter.prototype.additiveExpression1 = 
  interpreterMethodFactory.group("additiveExpression", /\+/, 
  "multiplicativeExpression", function(ae, me) {return ae+me;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("additiveExpression", 
   * /-/, "multiplicativeExpression", function(ae, me) {...})</tt>
   */
  JavaScriptInterpreter.prototype.additiveExpression2 = 
  interpreterMethodFactory.group("additiveExpression", /-/, 
  "multiplicativeExpression", function(ae, me) {return ae-me;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("relationalExpression1", 
   * "relationalExpression2", "relationalExpression5", 
   * "additiveExpression")</tt>
   */
  JavaScriptInterpreter.prototype.relationalExpression = 
  interpreterMethodFactory.or("relationalExpression1", "relationalExpression2", 
  "relationalExpression5", "additiveExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("relationalExpression", 
   * /</, "additiveExpression", function(re, ae) {...})</tt>
   */
  JavaScriptInterpreter.prototype.relationalExpression1 = 
  interpreterMethodFactory.group("relationalExpression", /</, 
  "additiveExpression", function(re, ae) {return re<ae;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("relationalExpression", 
   * />/, "additiveExpression", function(re, ae) {...})</tt>
   */
  JavaScriptInterpreter.prototype.relationalExpression2 = 
  interpreterMethodFactory.group("relationalExpression", />/, 
  "additiveExpression", function(re, ae) {return re>ae;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("relationalExpression", 
   * /instanceof/, "additiveExpression", function(re, ae) {...})</tt>
   */
  JavaScriptInterpreter.prototype.relationalExpression5 = 
  interpreterMethodFactory.group("relationalExpression", /instanceof/, 
  "additiveExpression", function(re, ae) {return re instanceof ae;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("equalityExpression3", 
   * "equalityExpression4", "relationalExpression")</tt>
   */
  JavaScriptInterpreter.prototype.equalityExpression = 
  interpreterMethodFactory.or("equalityExpression3", "equalityExpression4", 
  "relationalExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("equalityExpression", 
   * /===/, "relationalExpression", function(ee, re) {...})</tt>
   */
  JavaScriptInterpreter.prototype.equalityExpression3 = 
  interpreterMethodFactory.group("equalityExpression", /===/, 
  "relationalExpression", function(ee, re) {return ee===re;});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("equalityExpression", 
   * /!==/, "relationalExpression", function(ee, re) {...})</tt>
   */
  JavaScriptInterpreter.prototype.equalityExpression4 = 
  interpreterMethodFactory.group("equalityExpression", /!==/, 
  "relationalExpression", function(ee, re) {return ee!==re;});
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("logicalAndExpression1", 
   * "equalityExpression")</tt>
   */
  JavaScriptInterpreter.prototype.logicalAndExpression = 
  interpreterMethodFactory.or("logicalAndExpression1", "equalityExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("logicalAndExpression", 
   * /&&/, "deferredEqualityExpression", function(logicalAndExpression, 
   * deferredEqualityExpression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.logicalAndExpression1 = 
  interpreterMethodFactory.group("logicalAndExpression", /&&/, 
  "deferredEqualityExpression", 
  function(logicalAndExpression, deferredEqualityExpression) {
    return logicalAndExpression && deferredEqualityExpression.call(this);
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("equalityExpression")</tt>
   */
  JavaScriptInterpreter.prototype.deferredEqualityExpression = 
  interpreterMethodFactory.methodFactory("equalityExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("logicalOrExpression1", 
   * "logicalAndExpression")</tt>
   */
  JavaScriptInterpreter.prototype.logicalOrExpression = 
  interpreterMethodFactory.or("logicalOrExpression1", "logicalAndExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("logicalOrExpression", 
   * /\|\|/, "deferredLogicalAndExpression", function(logicalOrExpression, 
   * deferredLogicalAndExpression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.logicalOrExpression1 = 
  interpreterMethodFactory.group("logicalOrExpression", /\|\|/, 
  "deferredLogicalAndExpression", function(logicalOrExpression, 
  deferredLogicalAndExpression) {
    return logicalOrExpression||deferredLogicalAndExpression.call(this);
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("logicalAndExpression")</tt>
   */
  JavaScriptInterpreter.prototype.deferredLogicalAndExpression = 
  interpreterMethodFactory.methodFactory("logicalAndExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("conditionalExpression1", 
   * "logicalOrExpression")</tt>
   */
  JavaScriptInterpreter.prototype.conditionalExpression = 
  interpreterMethodFactory.or("conditionalExpression1", "logicalOrExpression");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("logicalOrExpression", 
   * /\?/, "deferredAssignmentExpression", 
   * /:/, "deferredAssignmentExpression", function(logicalOrExpression, 
   * deferredAssignmentExpression1, deferredAssignmentExpression2) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("assignmentExpression")</tt>
   */
  JavaScriptInterpreter.prototype.deferredAssignmentExpression = 
  interpreterMethodFactory.methodFactory("assignmentExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("assignmentExpression1", 
   * "assignmentExpression5", "conditionalExpression")</tt>
   */
  JavaScriptInterpreter.prototype.assignmentExpression = 
  interpreterMethodFactory.or("assignmentExpression1", "assignmentExpression5", 
  "conditionalExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("leftHandSideExpression", 
   * /=/, "assignmentExpression", function(lhse, assignmentExpression) 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.assignmentExpression1 = 
  interpreterMethodFactory.group("leftHandSideExpression", /=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] = assignmentExpression);});
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("leftHandSideExpression", 
   * /\+=/, "assignmentExpression", function(lhse, assignmentExpression) 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.assignmentExpression5 = 
  interpreterMethodFactory.group("leftHandSideExpression", /\+=/, 
  "assignmentExpression", function(lhse, assignmentExpression) {
    return (lhse.base[lhse.name] += assignmentExpression);});
  
  /**
   * <tt>plus("assignmentExpression", /,/, function(assignmentsExpressions) 
   * {...})</tt>
   */
  JavaScriptInterpreter.prototype.expression = 
  interpreterMethodFactory.plus("assignmentExpression", /,/, 
  function(assignmentsExpressions) {
    return assignmentsExpressions[assignmentsExpressions.length-1];
  });
  
  // Statements
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("block", "variableStatement", 
   * "ifStatement", "iterationStatement", "returnStatement", "throwStatement", 
   * "functionDeclaration", "expressionStatement")</tt>
   */
  JavaScriptInterpreter.prototype.statement = 
  interpreterMethodFactory.or("block", "variableStatement", "ifStatement", 
  "iterationStatement", "returnStatement", "throwStatement", 
  "functionDeclaration", "expressionStatement");
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("statement")</tt>
   */
  JavaScriptInterpreter.prototype.deferredStatement = 
  interpreterMethodFactory.methodFactory("statement");
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/\{/, "statementList", 
   * /\}/)</tt>
   */
  JavaScriptInterpreter.prototype.block = 
  interpreterMethodFactory.wrap(/\{/, "statementList", /\}/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#star|star} ("deferredStatement", 
   * function(deferredStatements) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("statementList")</tt>
   */
  JavaScriptInterpreter.prototype.deferredStatementList = 
  interpreterMethodFactory.methodFactory("statementList");

  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/var/, 
   * "variableDeclarationList", /;/, function() {...})</tt>
   */
  JavaScriptInterpreter.prototype.variableStatement = 
  interpreterMethodFactory.group(/var/, "variableDeclarationList", /;/, 
  function() {
    return ["normal", undefined];
  });
  
  /**
   * <tt>plus("variableDeclaration", /,/)</tt>
   */
  JavaScriptInterpreter.prototype.variableDeclarationList = 
  interpreterMethodFactory.plus("variableDeclaration", /,/);
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("bindingIdentifier", 
   * "initialiserOpt", function(bindingIdentifier, initialiserOpt) {...})</tt>
   */
  JavaScriptInterpreter.prototype.variableDeclaration = 
  interpreterMethodFactory.group("bindingIdentifier", 
  "initialiserOpt", function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
    return bindingIdentifier;
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/=/, 
   * "assignmentExpression")</tt>
   */
  JavaScriptInterpreter.prototype.initialiser = 
  interpreterMethodFactory.wrap(/=/, "assignmentExpression");
  
  /**
   * <tt>opt("initialiser", function() {...})</tt>
   */
  JavaScriptInterpreter.prototype.initialiserOpt = 
  interpreterMethodFactory.opt("initialiser", function() {
    return undefined;
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} ("expression", /;/, 
   * function() {...})</tt>
   */
  JavaScriptInterpreter.prototype.expressionStatement = 
  interpreterMethodFactory.group("expression", /;/, function() {
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/if/, /\(/, "expression", 
   * /\)/, "deferredStatement", 
   * "deferredElseStatementOpt", function(expression, deferredStatement, 
   * deferredElseStatementOpt) {...})</tt>
   */
  JavaScriptInterpreter.prototype.ifStatement = 
  interpreterMethodFactory.group(/if/, /\(/, "expression", /\)/, 
  "deferredStatement", "deferredElseStatementOpt", 
  function(expression, deferredStatement, deferredElseStatementOpt) {
    if(expression) {
      return deferredStatement.call(this);
    } else {
      return deferredElseStatementOpt.call(this);
    }
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("expression")</tt>
   */
  JavaScriptInterpreter.prototype.deferredExpression = 
  interpreterMethodFactory.methodFactory("expression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("iterationStatement2", 
   * "iterationStatement4", "iterationStatement6")</tt>
   */
  JavaScriptInterpreter.prototype.iterationStatement = 
  interpreterMethodFactory.or("iterationStatement2", "iterationStatement4", 
  "iterationStatement6");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/while/, /\(/, 
   * "deferredExpression", /\)/, "deferredStatement", 
   * function(deferredExpression, deferredStatement) {...})</tt>
   */
  JavaScriptInterpreter.prototype.iterationStatement2 = 
  interpreterMethodFactory.group(/while/, /\(/, "deferredExpression", /\)/, 
  "deferredStatement", 
  function(deferredExpression, deferredStatement) {
    while(deferredExpression.call(this)) {
      var returnValue = deferredStatement.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/for/, /\(/, /var/, 
   * "variableDeclarationList", /;/, "deferredExpression", /;/, 
   * "deferredExpression", /\)/, "deferredStatement", 
   * function(variableDeclarationList, deferredExpression1, deferredExpression2, 
   * deferredStatement) {...})</tt>
   */
  JavaScriptInterpreter.prototype.iterationStatement4 = 
  interpreterMethodFactory.group(/for/, /\(/, /var/, "variableDeclarationList", 
  /;/, "deferredExpression", /;/, "deferredExpression", /\)/, 
  "deferredStatement", 
  function(variableDeclarationList, deferredExpression1, deferredExpression2, 
  deferredStatement) {
    for( ; deferredExpression1.call(this); deferredExpression2.call(this)){
      var returnValue = deferredStatement.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/for/, /\(/, /var/, 
   * "variableDeclaration", /in/, "expression", 
   * /\)/, "deferredStatement", function(variableDeclaration, 
   * expression, deferredStatement) {...})</tt>
   */
  JavaScriptInterpreter.prototype.iterationStatement6 = 
  interpreterMethodFactory.group(/for/, /\(/, /var/, "variableDeclaration", 
  /in/, "expression", /\)/, "deferredStatement", 
  function(variableDeclaration, expression, deferredStatement) {
    for(var propertyName in expression) {
      this.executionContext.variables[variableDeclaration] = propertyName;
      var returnValue = deferredStatement.call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("elseStatementOpt")</tt>
   */
  JavaScriptInterpreter.prototype.deferredElseStatementOpt = 
  interpreterMethodFactory.methodFactory("elseStatementOpt");
  
  /**
   * <tt>opt("elseStatement", function() {...})</tt>
   */
  JavaScriptInterpreter.prototype.elseStatementOpt = 
  interpreterMethodFactory.opt("elseStatement", 
  function() {
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/else/, 
   * "statement")</tt>
   */
  JavaScriptInterpreter.prototype.elseStatement = 
  interpreterMethodFactory.wrap(/else/, "statement");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/return/, 
   * "expression", /;/, function(expression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.returnStatement = 
  interpreterMethodFactory.group(/return/, "expression", /;/, 
  function(expression) {
    return ["return", expression];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/throw/, 
   * "expression", /;/, function(expression) {...})</tt>
   */
  JavaScriptInterpreter.prototype.throwStatement = 
  interpreterMethodFactory.group(/throw/, "expression", /;/, 
  function(expression) {
    throw expression;
  });
  
  // Functions and programs
  
  /**
   * <tt>{@link InterpreterMethodFactory#wrap|wrap}
   * ("namedFunctionExpression", function() {...})</tt>
   */
  JavaScriptInterpreter.prototype.functionDeclaration = 
  interpreterMethodFactory.wrap("namedFunctionExpression", function() {
    return ["normal", undefined];
  });
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("anonymousFunctionExpression", 
   * "namedFunctionExpression")</tt>
   */
  JavaScriptInterpreter.prototype.functionExpression = 
  interpreterMethodFactory.or("anonymousFunctionExpression",
  "namedFunctionExpression");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/function/, 
   * "bindingIdentifier", "functionExpressionContent", 
   * function(bindingIdentifier, functionExpressionContent) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#wrap|wrap} (/function/, 
   * "functionExpressionContent")</tt>
   */
  JavaScriptInterpreter.prototype.anonymousFunctionExpression = 
  interpreterMethodFactory.wrap(/function/, "functionExpressionContent");
  
  /**
   * <tt>{@link InterpreterMethodFactory#group|group} (/\(/, 
   * "formalParameterList", /\)/, /\{/, "functionBody", /\}/, 
   * function(formalParameterList, functionBody) {...})</tt>
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
   * <tt>{@link InterpreterMethodFactory#star|star} ("bindingIdentifier", 
   * /,/)</tt>
   */
  JavaScriptInterpreter.prototype.formalParameterList = 
  interpreterMethodFactory.star("bindingIdentifier", /,/);
  
  /**
   * <tt>select(2, "useStrictDeclarationOpt", "deferredSourceElements")</tt>
   */
  JavaScriptInterpreter.prototype.functionBody = 
  interpreterMethodFactory.select(2, "useStrictDeclarationOpt", 
  "deferredSourceElements");
  
  /**
   * <tt>opt("useStrictDeclaration")</tt>
   */
  JavaScriptInterpreter.prototype.useStrictDeclarationOpt = 
  interpreterMethodFactory.opt("useStrictDeclaration");
  /**
   * <tt>{@link InterpreterMethodFactory#group|group}
   * (/('use strict')|("use strict")/, /;/)</tt>
   */
  JavaScriptInterpreter.prototype.useStrictDeclaration = 
  interpreterMethodFactory.group(/('use strict')|("use strict")/, /;/);
  
  /**
   * Setting up the environment and calling program1.
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
   * <tt>insignificant("spaces", "sourceElements")</tt>
   */
  JavaScriptInterpreter.prototype.program1 = 
  interpreterMethodFactory.insignificant("spaces", "sourceElements");
  
  /**
   * <tt>{@link InterpreterMethodFactory#or|or} ("statementList")</tt>
   */
  JavaScriptInterpreter.prototype.sourceElements = 
  interpreterMethodFactory.or("statementList");
  
  /**
   * <tt>{@link InterpreterMethodFactory#methodFactory|methodFactory}
   * ("sourceElements")</tt>
   */
  JavaScriptInterpreter.prototype.deferredSourceElements = 
  interpreterMethodFactory.methodFactory("sourceElements");
  
};

JavaScriptInterpreter.hack();
