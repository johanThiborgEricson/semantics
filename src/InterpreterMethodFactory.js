/**
 * @file
 * <p>
 * The {@link InterpreterMethodFactory} is the only public class of the 
 * Semantics! library. 
 * As the name suggests, it produces 
 * {@link external:InterpreterObject#interpreterMethod}s meant to be put on an 
 * object or class created by the user. 
 * That object is referenced in this documentation as an 
 * {@link external:InterpreterObject}. 
 * </p><p>
 * Interpreter methods of an interpreter object are built in terms of each 
 * other. 
 * This is accomplished by defining an interpreter method by giving the 
 * {@link interpreterMethodName}s of the other interpreter methods it should 
 * consist of, its {@part}s. 
 * It can be thought of as a tree where the root interpreter method is made out 
 * of child interpreter methods, which are in turn made out of other 
 * interpreter methods, and so on, all the way down to the leafs, 
 * which are interpreter methods that parses text using a regular expression, 
 * {@link external:InterpreterObject#atomTypeInterpreterMethod}s. 
 * This is true, except it isn't a tree, it is a graph, because it allows for 
 * circular dependencies. 
 * Together, the interpreter metods form a language, that can interpret texts 
 * on that language. 
 * Most interpreter methods have two variants. 
 * The first variant is the data structure variant. 
 * It returns the results of its children in an array, or as properties on an 
 * object. 
 * If all interpreter methods on the interpreter object are the data structure 
 * type, then the interpreter will return the parse tree as a data structure, 
 * with strings at its leafs. 
 * The second variant is the interpretation variant. 
 * An interpretation variant is constructed with a callback method, its 
 * interpretation, that will be called with the results of the methods 
 * children. 
 * An interpretation variant interpreter method returns the result of its 
 * interpretation. 
 * It is perfectly fine to use both variants of interpreter methods in the same 
 * interpreter, as convenient. 
 * See also {@link external:InterpreterObject#interpreterMethod}. 
 * </p><p>
 * Interpretations are meant to be thought of as a kind of methods of the 
 * interpreter object, but with added ability to parse text and be built in 
 * terms of each other. 
 * More specifically, they are run with <tt>this</tt> bound to the interpreter 
 * object. 
 * This means that inside the body of an interpretation callback function, 
 * <tt>this</tt> always referes to the object that the interpreter method is 
 * put on. 
 * There is one exception to this rule, see 
 * {@link InterpreterMethodFactory#methodFactory}. 
 * </p><p>
 * This documentation is divided into three sections, one for the factory, one 
 * for interpretations and one for the produced methods. 
 * {@link InterpreterMethodFactory} contains the factory that produces 
 * interpeter methods meant to be placed on an object created by the user. 
 * {@link external:ThisBinding} describes the optional callback functions that 
 * will act like an exotic kind of methods of the object of their interpreter 
 * method. 
 * {@link external:InterpreterObject} describes the different types of 
 * interpreter methods. 
 * Most of the information is redundant between the three sections, so it 
 * should suffice just to read in one place.
 * </p>
 */
function CodePointer(code, debugging) {
  this._code = code;
  this._debugging = debugging;
  this._pointer = 0;
  this.positions = [];
  for(var i = 0; i < code.length+1; i++) {
    this.positions.push({
      allHeads: Object.create(null),
      cachedHeads: Object.create(null),
      stack: [],
    });
    
  }
  this.indentation = 0;
  this.attempts = {
    position: 0,
    regexes: [],
  };
}

CodePointer.prototype.parse = function(regularExpression) {
  regularExpression.lastIndex = 0;
  var backup = this._pointer;
  var match = regularExpression.exec(this.getUnparsed());
  if(!match || match.index > 0) {
    match = null;
  } else {
    match.index = this._pointer;
    match.input = this._code;
    this._pointer += match[0].length;
  }
  
  this.reportMatch(regularExpression, backup, match);
  return match;
};

CodePointer.prototype
.reportMatch = function(regExp, backup, match) {
  if(this._debugging) {
    var hatPosString = this.hatPosString(backup);
    console.log("%s\n%s", hatPosString, this.hatOff(regExp));
  }
  if(!match) {
    this.reportParseError(regExp);
  }
};

CodePointer.prototype
.logParseStart = function(name) {
  if(this._debugging) {
    var indentation = "".padEnd(2*this.indentation);
    console.log("%s%s", indentation , name);
    this.indentation++;
  }
};

CodePointer.prototype
.logParseEnd = function(name, parseSuccess, backup) {
  if(this._debugging) {
    this.indentation--;
    var result = parseSuccess ? this.substring(backup, this._pointer): "failed";
    var indentation = "".padEnd(2*this.indentation);
    console.log("%s%s %s", indentation, name, result);
  }
  
};

CodePointer.prototype
.substring = function(start, end) {
  return '"' + this._code.slice(start, end) + '"';
};

CodePointer.prototype
.backup = function() {
  return this._pointer;
};

CodePointer.prototype
.restore = function(backup) {
  this._pointer = backup;
};

CodePointer.prototype
.getUnparsed = function() {
  return this._code.slice(this._pointer);
};

CodePointer.prototype
.reportParseError = function(regex) {
  if(this._pointer > this.attempts.position){
    this.attempts.position = this._pointer;
    this.attempts.regexes = [];
  }
  if(this._pointer === this.attempts.position){
    this.attempts.regexes.push(regex);
  }
};

CodePointer.prototype
.hatPosString = function(position) {
  var rowStart = this._code.lastIndexOf("\n", position)+1;
  var rowEnd = this._code.indexOf("\n", position);
  rowEnd = rowEnd === -1?this._code.length:rowEnd;
  var row = this._code.slice(rowStart, rowEnd);
  var hat = "^".padStart(position+1-rowStart);
  return row + "\n" + hat;
};

CodePointer.prototype
.hatOff = function(regex) {
  return regex.toString().replace(/^\/\^/, "/");
};

CodePointer.prototype
.getParseErrorDescription = function() {
  if(this._pointer > this.attempts.position){
    return "Trailing code: \"" + this.getUnparsed() + "\"";
  }
  if(this.attempts.regexes.length === 0){
    return "Parse error";
  }
  var rowHat = this.hatPosString(this.attempts.position);
  var regexesTail = this.attempts.regexes.map(this.hatOff);
  
  var regexesHead = regexesTail.pop();
  var disjunction;
  if(this.attempts.regexes.length === 1) {
    disjunction = regexesHead.toString();
  } else {
    disjunction = regexesTail.join(" ") + " or " + regexesHead.toString();
  }
  
  return "Expected\n" + 
          rowHat + "\n" +
          "to be parsed by " + disjunction;
};

CodePointer.prototype.getState = function(name) {
  var codePointer = this;
  var position = this.backup();
  var here = codePointer.positions[position];
  var hasCachedResult = !!here.cachedHeads[name];
  var head = here.allHeads[name] = here.cachedHeads[name] = 
  here.allHeads[name] || {
    recursivelyDefined: [],
    name: name,
    deleteSelf: function() {
      this.reportDeletion();
      delete here.cachedHeads[name];
    },
    
    reportDeletion: function() {
      if(codePointer._debugging) {
        
        var cachedString = this.cache?
        codePointer.substring(position, this.end): "failed";
        console.log("Forgetting %s=%s", name, cachedString);
      }
    },
    
  };
  
  return {

    hasCachedResult: function() {
      return hasCachedResult;
    },
    
    getCachedResult: function() {
      codePointer.restore(head.end);
      return head.cache;
    },
    
    pushOnStack: function() {
      here.stack.push(head);
    },
    
    popFromStack: function() {
      here.stack.pop();
    },
    
    setHeadRecursionDetected: function(isHeadRecursionDetected) {
      head.headRecursionDetected = isHeadRecursionDetected;
      var lastEncounter = here.stack.indexOf(head);
      here.stack.slice(lastEncounter+1, -1).map(function(rd) {
        if(head.recursivelyDefined.indexOf(rd) === -1){
          head.recursivelyDefined.push(rd);
        }
      });
      
    },
    

    forgetCachedHeadRecursiveResults: function() {
      codePointer.restore(position);
      head.recursivelyDefined.map(function(recursivelyDefined) {
        recursivelyDefined.deleteSelf();
      });
    },
    
    getHeadRecursionDetected: function() {
      return head.headRecursionDetected;
    },
    
    cacheResult: function(maybeInstruction) {
      head.cache = maybeInstruction;
      head.end = codePointer.backup();
    },
    
    hasProgressed: function() {
      return codePointer.backup() > head.end;
    },
    
  };
  
};

/**
 * Returns a newly constructed factory for creating interpreter methods. 
 * @class
 * @classdesc This class is used to create various types of  
 * {@link external:InterpreterObject#interpreterMethod}s
 * meant to be methods of an {@link external:InterpreterObject} or class 
 * created by the user. 
 */
function InterpreterMethodFactory() {}

InterpreterMethodFactory.prototype.makeParsing = function(regex) {
  var regexCode = regex.toString().slice(1).replace(/\/[a-z]*$/, "");
  var parsingRegexCode = regexCode.replace(/^\^?/, "^");
  var flags = regex.ignoreCase?"i":"";
  var parsingRegex = new RegExp(parsingRegexCode, flags);
  return parsingRegex;
};

InterpreterMethodFactory.prototype
.callInterpreterMethod = function(interpreter, methodName, codePointer) {
  if(typeof interpreter[methodName] !== "function") {
    throw new Error(methodName + " is not a method of the interpreter");
  }
  return interpreter[methodName](codePointer, methodName);
};

InterpreterMethodFactory.prototype.preInstructionMaker = 
function(interpreter, methodFactory, method, code, debuggingOrMethodName) {
  var v = {};

  if(code instanceof CodePointer) {
    v.isInternalCall = true;
    v.codePointer = code;
    v.methodName = debuggingOrMethodName;
  } else {
    v.isInternalCall = false;
    v.codePointer = new CodePointer(code, debuggingOrMethodName);
    v.methodName = methodFactory.nameOf(interpreter, method);
  }
  
  v.codePointer.logParseStart(v.methodName);
  v.backup = v.codePointer.backup();
  
  return v;
};

InterpreterMethodFactory.prototype.postInstructionMaker = 
function(v, interpreter, maybeInstruction) {
  
  if(!maybeInstruction){
    v.codePointer.restore(v.backup);
  }
  
  v.codePointer.logParseEnd(v.methodName, !!maybeInstruction, v.backup);
  if(!v.isInternalCall) {
    if(!maybeInstruction||v.codePointer.getUnparsed() !== "") {
      throw new Error(v.codePointer.getParseErrorDescription());
    }
    
  }
  
};

InterpreterMethodFactory.prototype.headRecurse = function(interpreter, state, 
maybeInstruction, instructionMaker, codePointer) {
  var progress = true;
  while(progress && maybeInstruction) {
    state.cacheResult(maybeInstruction);
    state.forgetCachedHeadRecursiveResults();
    maybeInstruction = instructionMaker(codePointer, interpreter);
    progress = state.hasProgressed();
  }
  return state.getCachedResult();
};

InterpreterMethodFactory.prototype
.makeMethod = function(instructionMaker) {
  "use strict";
  var methodFactory = this;
  
  /**
   * @method external:InterpreterObject#interpreterMethod
   * @description <p>
   * This is a general description that applies to all interpreter methods. 
   * An interpreter method interprets text. 
   * When it is called from the outside code, it interprets the text of its 
   * first argument. 
   * When it is called as a {@link part} of another interpreter method, it 
   * parses as much of the text as it can, starting from the point in the text 
   * where the last interpreter method finished parsing. 
   * </p><p>
   * If an interpreter method fails to parse, it will return the text pointer 
   * so that the next method will start parsing at the same position as the 
   * current one started before it failed. 
   * All interpreter methods are constructed never to be "half parsed"; if one 
   * of its parts fail, then the text pointer will be restored to where the 
   * interpreter method started parsing, even if some of the parts before the 
   * failing part were successfully parsed. 
   * Also, no interpretations of the descendants of an interpreter method will 
   * be run until all parts have been successfully parsed.
   * Acctually, parsing of all the interpreter methods and running the 
   * interpretations of the successfull parsings is done in two completely 
   * separate steps. 
   * That way it is ensured that nothing that shouldn't be run is run.
   * </p><p>
   * Most interpreter methods comes in two different types. 
   * The first type is constructed without supplying a description of how the 
   * interpreter method should interpret the result of its {@link part}s. 
   * Then the method will return the results of its parts in some kind of 
   * container, like an array (for quantifiers), an object with properties with 
   * the same names as the interpreter methods (for groups), a string (for 
   * atoms) or just the result of the part (for opt, wrap and select). 
   * Interpreter methods of this type will create a parse tree with arrays and 
   * objects and strings (from the atoms) as its leafs.
   * </p><p>
   * The other type of interpreter method is when it is constructed with an 
   * interpretation.
   * Then the interpreter method acts like a proxy for its interpretation. 
   * Instead of returning the results of its parts, the interpreter method will 
   * call its interpretation with those results, and then return the result of 
   * that call. 
   * An interpretation is meant to be thought of as a regular method of the 
   * same object as its interpreter method, but with enhanced abilities. 
   * Instead of just beeing called with arguments, they can create their own 
   * arguments by calling the methods named when they were constructed, or, 
   * in the case of atoms, getting their arguments by parsing text with an 
   * associated regular expression. 
   * Most importantly, interpretations will be run with <tt>this</tt> bound to 
   * the same object as their interpreter method. 
   * This way, interpretations function exactly like normal methods, but with 
   * the extra ability to, before they are called, compute their own arguments 
   * that they should be called with, by calling their parts.
   * </p> 
   * @todo Describe parse errors. 
   * @abstract
   * @param {string} text - The text to be interpreted. 
   * @param {boolean} [printDebuggingMessages] - If this is true, debugging 
   * messages are printed to console.log. 
   * @returns {InterpreterMethodResult} A type dependant container with the 
   * result of the {@link part}s of the method or the result of its 
   * interpretation, if an interpretation has been supplied. 
   */
  return function method(code, debuggingOrMethodName) {
    var v = methodFactory.preInstructionMaker(this, methodFactory, 
    method, code, debuggingOrMethodName);
    
    var maybeInstruction;
    var state = v.codePointer.getState(v.methodName);
    state.pushOnStack();
    if(state.hasCachedResult()) {
      maybeInstruction = state.getCachedResult();
      state.setHeadRecursionDetected(true);
    } else {
      state.forgetCachedHeadRecursiveResults();
      maybeInstruction = instructionMaker(v.codePointer, this);
      if(maybeInstruction && state.getHeadRecursionDetected()) {
        maybeInstruction = methodFactory.headRecurse(this, state, 
        maybeInstruction, instructionMaker, v.codePointer);
      }
      state.cacheResult(maybeInstruction);
    }
    state.popFromStack();

    methodFactory.postInstructionMaker(v, this, maybeInstruction);
    
    return v.isInternalCall?maybeInstruction:maybeInstruction.call(this);
  };
  
};

InterpreterMethodFactory.prototype
.nameOf = function(o, propertyValue) {
  for(var propertyName in o) {
    if(o[propertyName] === propertyValue) {
      return propertyName;
    }
  }
};

/**
 * @external ThisBinding
 * @description <p>
 * The interpretation callback functions passed to the methods of an 
 * {@link InterpreterMethodFactory} when constructing 
 * {@link external:InterpreterObject#interpreterMethod}s for a user 
 * created {@link external:InterpreterObject} should be thought of as if they 
 * were methods of that interpreter object. 
 * In practice, that means that <tt>this</tt> will be bound to the interpreter 
 * object inside the body of those  interpretations. 
 * This class is not a real class whith real methods, but rather a place to 
 * collect the documentations of all callback functions that will run as 
 * methods of the interpreter object. 
 * </p><p>
 * "So, if they will be run as methods of the 
 * {@link external:InterpreterObject}, why aren't they documented as methods of 
 * that object?" you might ask. 
 * This is because an 
 * {@link external:InterpreterObject#methodFactoryTypeInterpreterMethod} 
 * may be used to set the <tt>this</tt> binding to another object. 
 * Therefore, although the callback functions described here will 
 * normaly be run as methods of the interpreter object, they are described as 
 * if they would be run as methods of some other object refered to as 
 * <tt>this</tt> binding. 
 * </p>
 */

/**
 * @external InterpreterObject
 * @description An interpreter object is a user created object that has one or 
 * more {@link external:InterpreterObject#interpreterMethod}s created using an 
 * {@link InterpreterMethodFactory}. 
 * This is not a description of a real class, neither is it an interface that 
 * can be implemented. 
 * Rather, the methods of this class are descriptions of the type of 
 * interpreter methods that an interpreter method factory can create for an 
 * interpreter object. 
 * Normaly, all interpretation callback functions supplied when creating 
 * interpreter methods will run as methods of their interpreter object, i. e. 
 * <tt>this</tt> will be bound to the interpreter object inside the 
 * interpretation body.
 * However, 
 * {@link external:InterpreterObject#methodFactoryTypeInterpreterMethod} may be 
 * used to set the <tt>this</tt> binding to another object. See also 
 * {@link external:ThisBinding}. 
 */
 
/**
 * The terminal interpreter method factory takes a regular expression and makes 
 * a {@link external:InterpreterObject#terminalTypeInterpreterMethod} meant to 
 * be an interpreter method of a user created 
 * {@link external:InterpreterObject}.
 * The returned method parses text with the supplied regular expression. 
 * Optionally, a {@link external:ThisBinding#terminalInterpretation} callback 
 * function may be supplied to describe how the parsed text should be 
 * interpreted. 
 * The interpretation will be run as if it was a method of the interpreter 
 * object, i. e. <tt>this</tt> will be bound to the interpreter object inside 
 * the interpretation body.
 * @param {RegExp} regex - The regular expression that the interpreter method
 * should use to parse text. 
 * @param {string[]} [butNot] - A list of forbidden words. 
 * If the parsed string equals an element in this list, the parsing fails. 
 * @param {external:ThisBinding#terminalInterpretation} [interpretation] - 
 * A callback function describing how the parsed string should be interpreted. 
 * If pressent, the result of this function will also be the result of the 
 * interpreter method. 
 * Otherwise the parsed string will be returned. 
 * @returns {external:InterpreterObject#terminalTypeInterpreterMethod}
 * An interpreter method that uses a regular expression to parse text. 
 * @see {@link terminalUnitTests}
 * @see {@link butNotUnitTests}
 */
InterpreterMethodFactory.prototype
.terminal = function(regex, interpretationOrButNot) {
  "use strict";
  var that = this;
  var parsingRegex = this.makeParsing(regex);
  
  /**
   * @method external:ThisBinding#terminalInterpretation
   * @description <p>
   * A terminal interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#terminal} along with a regular expression 
   * to make a 
   * {@link external:InterpreterObject#terminalTypeInterpreterMethod} of an 
   * {@link external:InterpreterObject} made by the user.
   * It should be thought of as a method of the interpreter object which has 
   * been given the ability to parse text, using the regular expression of its 
   * interpreter method.
   * </p><p>
   * When its interpreter method is called, it will parse a string from the 
   * input text and call the interpretation with that text. 
   * Then the method will return the result of the interpretation. 
   * Most importantly, the method will run the interpretation as if it was a 
   * method of the same object as the interpreter method. 
   * This means that inside the body of the interpretation, <tt>this</tt> will 
   * be bound to the interpreter object.
   * In all, the only difference between the call to the interpreter method and 
   * the call to its interpretation is that the interpreter method is called 
   * with the full input text, while the interpretation is only called with 
   * the part of the text that has been parsed by the regular expression.
   * Another difference between interpreter methods and ordinary methods is 
   * that interpreter methods can be chained, so that the second interpeter 
   * method starts parsing where the first interpreter method finished parsing. 
   * </p>
   * @param {string} parsedText - The text parsed by the regular expression. 
   * @returns {*} User defined. 
   * The value returned by the interpretation will also be the return value of 
   * its interpreter method. 
   * @see {@link terminalUnitTests}
   * @see {@link butNotUnitTests}
   */
  var interpretation;
  var butNot;
  if(typeof interpretationOrButNot === "function") {
    interpretation = interpretationOrButNot;
  } else {
    butNot = interpretationOrButNot;
    interpretation = arguments[2];
  }
  
  /**
   * @method external:InterpreterObject#terminalTypeInterpreterMethod
   * @description A terminal type interpreter method is a method of an 
   * {@link external:InterpreterObject} that has been made by passing a regular 
   * expression and possibly a 
   * {@link external:ThisBinding#terminalInterpretation} 
   * to {@link InterpreterMethodFactory#terminal}.
   * It is a type of {@link external:InterpreterObject#interpreterMethod}
   * that parses and interprets its input text with its regular expression and 
   * its interpretation. 
   * Parsing is done by trying to match the regular expression at the position 
   * in the text where the last interpreter method finished to parse.
   * Matches starting at other positions will not be concidered. 
   * The full match (corresponding to match[0]) will be parsed, so capturing 
   * groups will not have any effect. 
   * It returns the parsed text or, if it has an interpretation, the result of 
   * calling that interpretation as a method of the interpreter object with the 
   * parsed string. 
   * Inside the body of the interpretation, <tt>this</tt> will be bound the 
   * the object of its interpreter method, as if it was called as a method of 
   * the same object.
   * If the regular expression can't be matched at the current position in the 
   * text, the method fails to parse and the interpretation isn't run.
   * @param {string} text - The text to be interpreted. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The parsed string or, if it is defined 
   * with an interpretation, the result of calling the interpretation as if it 
   * was a method of the same object with the parsed string. 
   * @see {@link terminalUnitTests}
   * @see {@link butNotUnitTests}
   */
  return this.makeMethod(function(codePointer, interpreter) {
    var match = that
    .parseInsignificantAndToken(codePointer, parsingRegex, interpreter);
    if(match === null) {
      return null;
    }
    
    var result = match[0];
    if(butNot && butNot.indexOf(result) > -1) {
      return null;
    }
    
    return function instruction() {
      return interpretation?interpretation.call(this, result):result;
    };
    
  });
  
};

/**
 * The empty method factory takes an interpretation callback function and 
 * returns an {@link external:InterpreterObject#emptyTypeInterpreterMethod} 
 * meant to be a method of a user created {@link external:InterpreterObject}. 
 * The returned method is a type of 
 * {@link external:InterpreterObject#interpreterMethod} that doesn't parse 
 * anything but just runs the interpretation as i it was a method of the 
 * interpreter object, i. e. with <tt>this</tt> bound to the interpreter 
 * object inside the body of the interpretation.
 * The result of the interpretation function will also be the result of the 
 * interpreter method. 
 * Empty type interpreter methods are mainly useful as a setup function when 
 * placed as the first {@link part} of an 
 * {@link InterpreterMethodFactory#group}. 
 * @param {function} interpretation - A callback function that will be run as 
 * a method of the interpreter object. 
 * The result of this method will also be the result of the returned 
 * interpreter method.
 * @returns {external:InterpreterObject#emptyTypeInterpreterMethod} A 
 * nonparsing interpreter method. 
 * @see {@link emptyUnitTests}
 */
InterpreterMethodFactory.prototype
.empty = function(interpretation) {
  "use strict";
  if(!interpretation) {
    throw new Error(
      "The empty string terminal should be called with a function");
  }
  
  /**
   * @method external:InterpreterObject#emptyTypeInterpreterMethod
   * @description An empty type interpreter method doesn't parse anything. 
   * It just runs the callback function interpretation passed to its factory 
   * function, {@link InterpreterMethodFactory#empty}, as if it was a method of 
   * the same object, and returns the result. 
   * In general, <tt>interpreterObject.emptyTypeInterpreterMethod("")</tt> 
   * should be equivalent to <tt>interpretation.call(interpreterObject)</tt>. 
   * @param {string} text - The text that won't be interpreted. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The result of calling the 
   * interpretation callback function passed to 
   * {@link InterpreterMethodFactory#empty} when constructing this 
   * interpreter method as if it was a method of the same object.
   * @see {@link emptyUnitTests} 
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    return interpretation;
  });
  
};

/**
 * @typedef {string} interpreterMethodName
 * @description A string that is the name of an 
 * {@link external:InterpreterObject#interpreterMethod}
 * on an {@link external:InterpreterObject}. 
 */

/**
 * @typedef {*} InterpreterMethodResult
 * @description The result of an 
 * {@link external:InterpreterObject#interpreterMethod}. 
 * This will either be some kind of container for the results of the 
 * {@link part}s of the interpreter method, or a user defined result of an 
 * interpretation, which may have any type. 
 * The purpose of this type definition is to explain the values that are 
 * returned by interpreter methods in type dependent containers, if they have 
 * no interpretation, or passed as arguments to their interpretation, if they 
 * have one.
 */

/**
 * @typedef {external:InterpreterObject#interpreterMethod} part
 * @description Many {@link external:InterpreterObject#interpreterMethod}s are 
 * defined in terms of other interpreter methods by constructing them with the 
 * {@link interpreterMethodName}s of those methods. 
 * Then the inner methods will be referred to as parts of the outer method. 
 * Any regular expressions in the definition of an interpreter method are not 
 * counted among its parts. 
 */

InterpreterMethodFactory.prototype
.getChildren = function(args) {
  var parts = [];

  var interpretation;
  var p = {
    i: 0,
  };
  var argument;
  var leadingRegexes = this.readRegexesFromArguments(args, p);
  while(p.i < args.length) {
    argument = args[p.i++];
    if(typeof argument === "string") {
      parts.push({
        name: argument,
        trailingRegexes: this.readRegexesFromArguments(args, p),
      });
    } else {
      interpretation = argument;
    }
  }
  
  return {
    leadingRegexes: leadingRegexes,
    parts: parts,
    interpretation: interpretation,
  };
};

InterpreterMethodFactory.prototype
.parseChildren = function(codePointer, interpreter, args) {
  var partInstructions = [];
  if(!this.skipRegexes(codePointer, args.leadingRegexes, interpreter)){
    return null;
  }
  for(var i = 0; i < args.parts.length; i++){
    var maybeInstruction = this
          .callInterpreterMethod(interpreter, args.parts[i].name, codePointer);
    if(!maybeInstruction
      ||!this.skipRegexes(codePointer, args.parts[i].trailingRegexes, 
      interpreter)) {
      return null;
    }
    maybeInstruction.partName = args.parts[i].name;
    
    partInstructions.push(maybeInstruction);
  }
  return partInstructions;
};

/**
 * <p>
 * The group interpreter method factory accepts any number of 
 * {@link interpreterMethodName}s and regular expressions in any order as 
 * arguments and creates a 
 * {@link external:InterpreterObject#groupTypeInterpreterMethod} meant to be a 
 * method of an {@link external:InterpreterObject}. 
 * The returned method parses the supplied regular expressions and the 
 * {@link external:InterpreterObject#interpreterMethod}s named by 
 * the interpreter method names, in the specified order. 
 * </p><p>
 * It is possible to describe how the returned method should interpret the 
 * results of its {@link part}s by supplying an 
 * {@link external:ThisBinding#groupInterpretation} callback function.
 * The interpretation will be run as a method of the interpreter object, i. e. 
 * <tt>this</tt> will be bound to the interpreter object in the body of the 
 * interpretation.
 * If an interpretation is supplied, the result of the interpretation will also 
 * be the result of the metod. Otherwise the method will return an object 
 * with properties with the same name as the names of the {@link part}s that 
 * holds the results of the respective {@link part}s.
 * </p>
 * @param {...(interpreterMethodName|RegExp)} parsable - A name of an 
 * interpreter metod on the same object or a regular expression that should be 
 * parsed. 
 * @param {external:ThisBinding#groupInterpretation} [interpretation] 
 * A callback function that will be called with the results of the 
 * {@link part}s of the method. 
 * If pressent, the result of the interpretation will also be the result of the 
 * interpreter method. 
 * Otherwise it will return an object with the result of its {@link part}s. 
 * @returns {external:InterpreterObject#groupTypeInterpreterMethod} 
 * An interpreter method that parses and interprets a group consisting of 
 * regular expressions and other interpreter methods. 
 * @see {@link groupUnitTests}
 */
InterpreterMethodFactory.prototype
.group = function() {
  "use strict";
  var factory = this;
  
  /**
   * @method external:ThisBinding#groupInterpretation
   * @description A group interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#group}. 
   * Inside the callback, this will refere to the
   * {@link external:ThisBinding}. 
   * The interpretation is called with the results of the {@link part}s of the 
   * interpreter method. 
   * @param {...InterpreterMethodResult} partResults - The results of the 
   * {@link part}s of the method. 
   * @returns {*} User defined. 
   * The value returned by the interpretation will also be the return value of 
   * its interpreter method. 
   * @see {@link groupUnitTests}
   */
  var args = this.getChildren(arguments);

  /**
   * @method external:InterpreterObject#groupTypeInterpreterMethod
   * @description A group type interpreter method is an 
   * {@link external:InterpreterObject#interpreterMethod} 
   * that parses a group of other interpreter methods and regular expressions 
   * defined in its factory, {@link InterpreterMethodFactory#group}, one at the 
   * time. 
   * If one of the regular expressions or interpreter methods fails to parse, 
   * then the whole method fails to parse and the text pointer is restored, see 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * It is also important to note that none of the interpretations of the 
   * {@link part}s is run before all parts has been successfully parsed, so it 
   * is never necessary to "clean up" after a half parsed group.
   * If the group was defined with an 
   * {@link external:ThisBinding#groupInterpretation} it will call that with 
   * the results of its {@link part}s as arguments, and return the result. 
   * Otherwise it will return an 
   * {@link InterpreterMethodFactory#MultiPropertyObject}-like object with 
   * properties named as the {@link interpreterMethodName}s containing 
   * the results of the {@link part}s of the method. 
   * @param {string} text - The text to be parsed by the {@link part}s and 
   * the regular expressions.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} An 
   * {@link InterpreterMethodFactory#MultiPropertyObject}-like object 
   * or the result of calling the interpretation with the result of its
   * {@link part}s. 
   * @see {@link groupUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = factory.parseChildren(codePointer, interpreter, args);
    
    if(partInstructions === null) {
      return null;
    }
    
    if(args.interpretation) {
      return function instruction() {
        return args.interpretation.apply(this, factory
            .mapRunAsMethod(this, partInstructions));
      };
    } else {
      return function instruction() {
        var that = this;
        var mpo = new factory.MultiPropertyObject();
        var result = {};
        partInstructions.map(function(pi) {
          mpo.appendProperty.call(result, pi.partName, pi.call(that));
        });
        
        return result;
      };
    }
  });
  
};

InterpreterMethodFactory.prototype
.skipRegexes = function(codePointer, regexes, interpreter) {
  for(var i = 0; i < regexes.length; i++) {
    if(!this.parseInsignificantAndToken(codePointer, regexes[i], interpreter)){
      return null;
    }
  }
  return true;
};

InterpreterMethodFactory.prototype. 
mapRunAsMethod = function(that, partInstructions) {
  return partInstructions.map(function(partInstruction) {
    return partInstruction.call(that);
  });
  
};

InterpreterMethodFactory.prototype
.readRegexesFromArguments = function(args, p) {
  var regexes = [];
  var regex;
  while((regex = args[p.i++]) instanceof RegExp) {
    regexes.push(this.makeParsing(regex));
  }
  p.i--;
  return regexes;
};

/**
 * Returns a newly constructed MultiPropertyObject. 
 * @class
 * @classdesc A MultiPropertyObject is an object that can have more than one 
 * property with the same name. 
 * This is achieved by replacing multiple properties with the same name with an 
 * array containing those properties. 
 */
InterpreterMethodFactory.prototype.MultiPropertyObject = function() {
  var nameCount = Object.create(null);
  
  /**
   * If the object has no property with this name, add the value to the object. 
   * If the object has one property with this name, replace the property with 
   * an array with the old property and the new value. 
   * If the object has more than one property with this name, push the value 
   * to the array. 
   * @param {interpreterMethodName} name - The name of the property to be 
   * appended. 
   * @param {InterpreterMethodResult} value - The result of a {@link part} 
   * of the interpreter method. 
   */
  this.appendProperty = function(name, partResult) {
    var result = this;
    if(nameCount[name] === undefined) {
      nameCount[name] = 0;
    }
    
    if(nameCount[name] === 0) {
      this[name] = partResult;
    } else if(nameCount[name] === 1) {
      this[name] = [this[name], partResult];
    } else {
      this[name].push(partResult);
    }
    
    nameCount[name]++;
  };
  
};

InterpreterMethodFactory.prototype.select = function(index) {
  var factory = this;
  var partNames = Array.prototype.slice.call(arguments, 1);
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    for(var i = 0; i < partNames.length; i++) {
      var partName = partNames[i];
      var maybeInstruction;
      if(typeof partName === "string") {
        maybeInstruction = factory
          .callInterpreterMethod(interpreter, partName, codePointer);
      } else if(partName instanceof RegExp) {
        var regex = factory.parseInsignificantAndToken(
          codePointer, partName, interpreter);
        maybeInstruction = regex?factory.functionReturning(regex):null;
      }
      if(!maybeInstruction){
        return null;
      }
      partInstructions.push(maybeInstruction);
    }
    
    return index>0? partInstructions[index-1]:function instruction() {
        var that = this;
        var partResults = partInstructions.map(function(partInstruction) {
          return partInstruction.call(that);
        });
        
        return partResults;
      };
    
  });
  
};

/**
 * <p>
 * The wrap interpreter method factory accepts any number of leading regular 
 * expressions, followed by an {@link interpreterMethodName}, followed by any 
 * number of trailing regular expressions and optionally a 
 * {@link external:ThisBinding#wrapInterpretation} callback function.
 * The returned {@link external:InterpreterObject#wrapTypeInterpreterMethod} 
 * parses the leading regular expression from the text, parses its part and 
 * parses the trailing regular expressions. 
 * If something fails to parse, the whole method fails to parse, and the 
 * pointer is restored to the point in the text where it started.
 * If everything succeeds to parse it runs its part and remembers the result. 
 * If it was made without an interpretation, it returns the result of its part. 
 * Otherwise it calls its interpretation with the result as if it was a method 
 * of the same object, i. e. with <tt>this</tt> bound to its object inside the 
 * body of the interpretation.
 * <p></p>
 * Wrap type interpreter methods without interpretations are useful for 
 * language constructs that always contains only one part, followed and/or 
 * trailed by exact strings, like a punctators or reserved words. 
 * Such exact strings only serves as indicators of what their {@link part} is; 
 * which one of the interpreter methods should be used to interpret it, but 
 * they don't carry any meaning in themselves, so the result of the part can 
 * be returned without further interpretation.
 * <p></p>
 * Wrap type interpreter methods with interpretations but no regular 
 * expressions are useful for language custructs that has the same syntax, but 
 * should be interpreted in different ways. 
 * Then, often, it is possible for one of the interpreter methods to reuse the 
 * interpretation of the other interpreter. 
 * In such case, the first interpreter method should be a wrap of the second 
 * one, with an interpretation describing how it should further refine the 
 * result of the first one.
 * <p></p>
 * Wrap type interpreter methods defined with both regular expression(s) and an 
 * interpretation are fine, but avoid such methods both without regular 
 * expressions and interpretation.
 * The prefered way to achieve that functionality is using 
 * {@link InterpreterMethodFactory#or} with only one {@link part}
 * </p>
 * @param {...RegExp} [leadingRegexes] - These regular expressions will be 
 * skiped over by the returned interpreter method, before its part have parsed. 
 * @param {interpreterMethodName} partName - The only {@link part} of the 
 * returned interpreter method.
 * @param {...RegExp} [trailingRegexes] - Regular expressions to be skiped over 
 * by the returned interpreter method, after its part have been parsed.
 * @param {external:ThisBinding#wrapInterpretation} [interpretation] -
 * An optional callback function describing how the result of the part should 
 * be interpreted. 
 * If pressent, the result of this function will also be the result of the 
 * interpreter method. 
 * Otherwise the result of the part will be returned, untouched. 
 * @returns {external:InterpreterObject#wrapTypeInterpreterMethod}
 * An interpreter method that can wrap its {@link part} in regular expressions 
 * and/or interpret the result of its part further. 
 * @see {@link wrapUnitTests}
 */
InterpreterMethodFactory.prototype.wrap = function() {
  "use strict";
  var factory = this;
  var args = this.getChildren(arguments);

  /**
   * @method external:ThisBinding#wrapInterpretation
   * @description A wrap interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#wrap} along with optional leading regular 
   * expressions, a mandatory {@link interpreterMethodName} of its only 
   * {@link part} and optional trailing regular expressions. 
   * It describes how the resulting  
   * {@link external:InterpreterObject#wrapTypeInterpreterMethod} should 
   * interpret the result of its part. 
   * It is meant to be thought of as a special kind of method of the same 
   * object as its interpreter method, with the added ability to, before it is 
   * called, compute the argument it should be called with. 
   * It computes its argument by skiping over any text parsed by the leading 
   * regular expressions, then computing the argument as the result of letting 
   * its part parse from there, and finally skipping over the text parsed by 
   * the trailing regular expressions. 
   * @param {InterpreterMethodResult} partResult - The result of the only  
   * {@link part} of the interpretations interpreter method.
   * @returns {*} User defined. 
   * The value returned by the interpretation will also be the return value of 
   * its interpreter method. 
   * @see {@link wrapUnitTests}
   */

  /**
   * @method external:InterpreterObject#wrapTypeInterpreterMethod
   * @description <p>
   * A wrap type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} 
   * that parses another interpreter function, possibly surrounded by padding 
   * text that can be parsed by optional leading and trailing regular 
   * expressions defined in its factory {@link InterpreterMethodFactory#wrap}. 
   * If any of these fails to parse, then the whole interpreter method fails to 
   * parse and the text pointer is restored to where it was when the method 
   * started to parse. 
   * Also, no interpretations of its descendant {@link part}s are run until 
   * the the whole interpreter method is successfully parsed.
   * </p><p> 
   * If the interpreter method was made with an 
   * {@link external:ThisBinding#wrapInterpretation}, it will call that with 
   * the result of its {@link part}, and return the result. The interpretation 
   * will be called with <tt>this</tt> bound to the object of the interpreter 
   * method. 
   * Otherwise it will return the result of its part, untouched.
   * </p>
   * @param {string} text - The text to be parsed by the {@link part}, possibly 
   * surrounded by text that is to be parsed by the optional leading and 
   * trailing regular expressions.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} An 
   * {@link InterpreterMethodFactory#MultiPropertyObject}-like object 
   * or the result of calling the interpretation with the result of its
   * {@link part}s. 
   * @see {@link wrapUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = 
    factory.parseChildren(codePointer, interpreter, args);
    if(partInstructions === null) {
      return null;
    }
    var maybeInstruction = partInstructions[0];
    return !args.interpretation?maybeInstruction:function instruction() {
      return args.interpretation.call(this, maybeInstruction.call(this));
    };
    
  });
  
};

InterpreterMethodFactory.prototype.functionReturning = function(value) {
  return function() {
    return value;
  };

};

/**
 * <p>
 * The or interpreter method factory takes any number of 
 * {@link interpreterMethodName}s and creates an 
 * {@link external:InterpreterObject#orTypeInterpreterMethod} meant to be put 
 * on a user created {@link external:InterpreterObject}. 
 * In the returned interpreter method, each interpreter method name corresponds 
 * to an alternative {@link part} of that method.
 * An or interpreter method is meant to resemble the || operator.
 * </p><p>
 * When the returned method is run, it will try to parse its parts from the 
 * current position in the text.
 * If a part is successfully parsed, it is run and its result is returned.
 * Unlike {@link external:InterpreterObject#longestTypeInterpreterMethod}s, it 
 * will not try to parse any subsequent parts, once it finds a succeeding part, 
 * and no interpretations of any other part will be run.
 * If none of the parts succeeds to parse, the interpreter method fails to 
 * parse and no interpretations are run. 
 * </p>
 * @param {...InterpreterMehtodName} alternatives - The names of the alternatives 
 * {@link part}s of the returned interpreter method.
 * @returns {external:InterpreterObject#orTypeInterpreterMethod} An interpreter 
 * method that can choose between alternaitves. 
 * @see {@link orUnitTests}
 */
InterpreterMethodFactory.prototype.or = function() {
  var factory = this;
  var alternativesNames = arguments;
  
  /**
   * @method external:InterpreterObject#orTypeInterpreterMethod
   * @description An or type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} on a user created 
   * {@link external:InterpreterObject} constructed by providing the 
   * {@link interpreterMethodName}s of its {@link part}s to 
   * {@link InterpreterMethodFactory#or}. 
   * The behaviour of an or type interpreter method resembles the || operator. 
   * It tries to parse its parts, one at a time, until one of them parses 
   * successfully, and returns the result of that part.
   * Just like || it doesn't try to parse any more parts if one has succeeded, 
   * and only the interpretations of the succeeding part will be run. 
   * If all of its parts fails to parse, then the whole interpreter method 
   * fails to parse. 
   * @param {string} text - The text that the {@link part}s should try to 
   * parse.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The result of the {@link part} that 
   * parsed successfully.
   * @see {@link orUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction = null;
    var i = 0;
    while(!maybeInstruction && i < alternativesNames.length) {
      maybeInstruction = factory
      .callInterpreterMethod(interpreter, alternativesNames[i++], codePointer);
    }
    
    return maybeInstruction;
  });
};

/**
 * <p>
 * The longest interpreter method factory takes any number of 
 * {@link interpreterMethodName}s and creates a 
 * {@link external:InterpreterObject#longestTypeInterpreterMethod} meant to be 
 * put on a user created {@link external:InterpreterObject}. 
 * In the returned interpreter method, each interpreter method name corresponds 
 * to an alternative {@link part} of that method.
 * </p><p>
 * A longest type interpreter method is similar to an 
 * {@link external:InterpreterObject#orTypeInterpreterMethod} with the 
 * difference that it tries to parse <i>all</i> of its parts from the current 
 * position in the text, unlike or type interpreter methods that doesn't try to 
 * parse any more alternatives once it has found one that succeeds.
 * The interpreter method only runs the one of its {@link part}s that has 
 * succeeding parsing the most text so none of the other parts descendant 
 * interpretations will be run, even if they have parsed successfully.
 * If two or more parts parses the same amount of text, then the first of them 
 * will be shoosen, to mimic the behaviour of or.
 * The result of that {@link part} will also be the result of the whole 
 * interpreter method.
 * </p>
 *
 * @param {...InterpreterMehtodName} alternatives - The names of the 
 * alternatives {@link part}s of the returned interpreter method.
 * @returns {external:InterpreterObject#longestTypeInterpreterMethod} An 
 * interpreter method that chooses the one of its parts that parses the most 
 * text. 
 * @see {@link longestUnitTests}
 */
InterpreterMethodFactory.prototype.longest = function() {
  "use strict";
  var factory = this;
  var alternativesNames = Array.prototype.slice.call(arguments);
  
  /**
   * @method external:InterpreterObject#longestTypeInterpreterMethod
   * @description <p>
   * A longest type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} on a user created 
   * {@link external:InterpreterObject} constructed by providing the 
   * {@link interpreterMethodName}s of its {@link part}s to 
   * {@link InterpreterMethodFactory#longest}. 
   * </p><p>
   * It is similar to an 
   * {@link external:InterpreterObject#orTypeInterpreterMethod} with the 
   * difference that it tries to parse <i>all</i> of its parts from the current 
   * position in the text, unlike or type interpreter methods that doesn't try 
   * to parse any more alternatives once it has found one that succeeds.
   * It only runs the one of its {@link part}s that has succeeding parsing the 
   * most text so none of the other parts descendant interpretations will be 
   * run, even if they have parsed successfully.
   * If two or more parts parses the same amount of text, then the first of 
   * them will be shoosen, to mimic the behaviour of or.
   * The result of that {@link part} will also be the result of the whole 
   * interpreter method.
   * </p>
   *
   * @param {string} text - The text that all the {@link part}s should try to 
   * parse.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The result of the {@link part} that 
   * successfully parsed the most text, or the first one if it is a tie.
   * @see {@link longestUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var backup = codePointer.backup();
    var nullObject = {end:backup};
    var maybeInstruction = nullObject;
    alternativesNames.map(function(name) {
      codePointer.restore(backup);
      var partInstruction = factory
          .callInterpreterMethod(interpreter, name, codePointer);
      if(codePointer.backup() > maybeInstruction.end) {
        maybeInstruction = partInstruction;
        maybeInstruction.end = codePointer.backup();
      }
    });
    
    codePointer.restore(maybeInstruction.end);
    
    return maybeInstruction===nullObject?null:maybeInstruction;
  });
};

/**
 * <p>
 * The star interpreter method takes a {@link interpreterMethodName}, an 
 * optional delimiter regular expression, and an optional 
 * {@link external:ThisBinding#starInterpretation} and produces a
 * {@link external:InterpreterObject#starTypeInterpreterMethod} meant to be 
 * put on a user created {@link external:InterpreterObject}. This is a 
 * quantifier type interpretation method that parses zero or more of the 
 * {@link part} indicated by the {@link interpreterMethodName}, with the 
 * option to parse delimiting regular expressions between them. 
 * The results are put in an array that either is returned or supplied to the 
 * interpretation, if there is one.
 * </p><p>
 * If a interpretation is supplied, that interpretation is meant to be thougt of 
 * as a method with the special abillity to compute the argument it is called 
 * with by letting its part repeatedly parse the texts, as many times as it 
 * can, and then letting an array of the result of the parsings be its 
 * argument. 
 * More specifically, this means that <tt>this</tt> will be bound to the object 
 * of its interpreter method inside its body, and also that its result will 
 * also be the result of its interpreter method.
 * </p><p>
 * Note that this interpreter method cannot fail to parse. If it can't parse 
 * its part at all, it successfully returns (or calls its interpretation with) 
 * an empty array.
 * </p>
 * 
 * @param {interpreterMethodName} partName - Indicates the {@link part} that 
 * should be quantified.
 * @param {RegExp} [delimiter] - A regular expression that should be parsed 
 * between the parsings of its part. Think 
 * <tt>String.prototype.split</tt>, but with a regex.
 * @param {external:ThisBinding#starInterpretation} [interpretation] - A 
 * callback function describing how the results of repeatedly parsing its part 
 * should be interpreted. 
 * Inside its body, <tt>this</tt> will be bound to the object of its 
 * interpreter method.
 * @returns {external:InterpreterObject#starTypeInterpreterMethod} An 
 * interpreter method parsing its part as many times as it can, possibly 
 * parsing delimiters in between, and possibly interpreting their results.
 * 
 * @example 
 * var f = new InterpreterMethodFactory();
 * // interpreter.aStar is the Semantics! equivalent of /(a*)/
 * // (Ignore the parentheses, its just not posible to document a regex ending
 * // with an asterisk in a JavaScript multiline comment.)
 * var interpreter = {a: f.atom(/a/), aStar: f.star("a")};
 * var doubleAs = interpreter.aStar("aa"); // doubleAs == ["a", "a"]
 * var emptyAs = interpreter.aStar(""); // emptyAs == []
 * @see {@link starUnitTests}
 */
InterpreterMethodFactory.prototype
.star = function(partName) {
  "use strict";
  var factory = this;
  
  /**
   * @method external:ThisBinding#starInterpretation
   * @description A star interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#star} to define how the resulting 
   * {@link external:InterpreterObject#starTypeInterpreterMethod} should 
   * interpret the result of parsing its {@link part} as many times as 
   * possible.
   * It should be thought of as a regular method of the same object as its 
   * interpreter method, but with added ability to, before it is run, compute 
   * the argument that is will be called with.
   * Before it runs, it let its {@link part} parse the text repeatedly as many 
   * times as it can, and then gets the array of the results as its only 
   * argument.
   * Also, just like a regular method, it will have <tt>this</tt> bound to the 
   * object of its interpreter method when it is run, and its result will also 
   * be the result of its method.
   * 
   * @param {InterpreterMethodResult[]} partResults - The results of parsing 
   * its {@link part} as many times as it can, or zero if it can't, in an 
   * array. 
   * @returns {InterpreterMethodResult} User defined. 
   * The value returned by the interpretation will also be the returned value 
   * of its interpreter method.
   * @see {@link starUnitTests}
   */
  var interpretation;
  var delimiter;
  var delimiterAndPart;
  if(arguments[1] instanceof Function) {
    interpretation = arguments[1];
  } else {
    delimiter = arguments[1];
    delimiterAndPart = this.group(delimiter, partName, function(partName) {
      return partName;
    });
    
    interpretation = arguments[2];
  }
  
  /**
   * @method external:InterpreterObject#starTypeInterpreterMethod
   * @description <p>
   * A star type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} meant to be put on a 
   * {@link external:InterpreterObject} created by the user. 
   * It is the result of calling {@link InterpreterMethodFactory#star} with 
   * the {@link interpreterMethodName} of its only {@link part} and optionally 
   * a regular expression that will act as a delimiter.
   * </p><p>
   * Among the different types of interpreter methods, this is the equivalent 
   * of the * quantifier in regular expressions. 
   * It lets its {@link part} parse the text over and over until it can't parse 
   * anymore, optionally skipping over a delimiter regular expression in 
   * between the parsings. 
   * Just like the regex *, it may successfully parse nothing.
   * </p><p>
   * The result of an interpreter method of this type is an, possibly zero 
   * length, array with the results of the repeated parsings of its 
   * {@link part}, if it wasn't defined with a 
   * {@link external:ThisBinding#starInterpretation}.
   * If it was, the result will be the result of calling its interpretation 
   * as if it was a method of the same object with the abovementioned array as 
   * the only argument. 
   * Inside the body of the interpretation, <tt>this</tt> will be bound to the 
   * object of the interpreter method.
   * </p>
   * @param {string} text - The text that the {@link part} should parse, as 
   * many times as it can, or zero times if it can't.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}.
   * @returns {InterpretationMethodResult} The result of its interpretation, 
   * if it has one, otherwise an (possibly zero length) array with the results 
   * of repeatedly letting its {@link part} parse the text.
   * @see {@link starUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    var maybeInstruction = factory
    .callInterpreterMethod(interpreter, partName, codePointer);
    if(delimiter){
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = delimiterAndPart.call(interpreter, codePointer, 
          delimiter + " and " + partName);
      }
    } else {
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = factory
          .callInterpreterMethod(interpreter, partName, codePointer);
      }
    }
      
    return function instruction() {
      var results = factory.mapRunAsMethod(this, partInstructions);
      return interpretation?interpretation.call(this, results):results;
    };
    
  });
  
};

/**
 * <p>
 * This method takes an {@link interpreterMethodName}, an 
 * optional delimiter regular expression, and an optional 
 * {@link external:ThisBinding#plusInterpretation} and produces a
 * {@link external:InterpreterObject#plusTypeInterpreterMethod} meant to be 
 * put on a user created {@link external:InterpreterObject}. This is a 
 * quantifier type interpretation method that parses one or more of the 
 * {@link part} indicated by the {@link interpreterMethodName}, with the 
 * option to parse delimiting regular expressions between them. 
 * The results are put in an array that either is returned or supplied to the 
 * interpretation, if there is one.
 * </p><p>
 * If a interpretation is supplied, that interpretation is meant to be thougt of 
 * as a method with the special abillity to compute the argument it is called 
 * with by letting its part repeatedly parse the texts, as many times as it 
 * can, and then letting an array of the result of the parsings be its 
 * argument. 
 * More specifically, this means that <tt>this</tt> will be bound to the object 
 * of its interpreter method inside its body, and also that its result will 
 * also be the result of its interpreter method.
 * </p><p>
 * If the {@link part} can't be parsed one time or more, the interpreter method 
 * fails to parse, and the text pointer is restored to where it was when the 
 * interpreter method started to parse.
 * Also, no interpretations will be called, not even parts of the part that was 
 * successfully parsed before the part as a whole failed to parse.
 * </p>
 * 
 * @param {interpreterMethodName} partName - Indicates the {@link part} that 
 * should be quantified.
 * @param {RegExp} [delimiter] - A regular expression that should be parsed 
 * between the parsings of its part. Think 
 * <tt>String.prototype.split</tt>, but with a regex.
 * @param {external:ThisBinding#plusInterpretation} [interpretation] - A 
 * callback function describing how the results of repeatedly parsing its part 
 * should be interpreted. 
 * Inside its body, <tt>this</tt> will be bound to the object of its 
 * interpreter method.
 * @returns {external:InterpreterObject#plusTypeInterpreterMethod} An 
 * interpreter method parsing its part as many times as it can, possibly 
 * parsing delimiters in between, and possibly interpreting their results.
 * 
 * @example 
 * var f = new InterpreterMethodFactory();
 * // interpreter.aPlus is the Semantics! equivalent of /a+/
 * var interpreter = {a: f.atom(/a/), aPlus: f.plus("a")};
 * var doubleAs = interpreter.aPlus("aa"); // doubleAs == ["a", "a"]
 * var emptyAs = interpreter.aPlus(""); // Error. Plus needs at least one "a". 
 * @see {@link plusUnitTests}
 */
InterpreterMethodFactory.prototype
.plus = function(partName) {
  "use strict";
  var factory = this;
  
  /**
   * @method external:ThisBinding#plusInterpretation
   * @description A plus interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#plus} to define how the resulting 
   * {@link external:InterpreterObject#plusTypeInterpreterMethod} should 
   * interpret the result of parsing its {@link part} as many times as 
   * possible, but at least one time.
   * It should be thought of as a regular method of the same object as its 
   * interpreter method, but with added ability to, before it is run, compute 
   * the argument that is will be called with.
   * Before it runs, it let its {@link part} parse the text repeatedly as many 
   * times as it can, and then gets the array of the results as its only 
   * argument.
   * Also, just like a regular method, it will have <tt>this</tt> bound to the 
   * object of its interpreter method when it is run, and its result will also 
   * be the result of its method.
   * 
   * @param {InterpreterMethodResult[]} partResults - The results of parsing 
   * its {@link part} as many times as it can, but at least one, in an array. 
   * @returns {InterpreterMethodResult} User defined. 
   * The value returned by the interpretation will also be the returned value 
   * of its interpreter method.
   * @see {@link plusUnitTests}
   */
  var interpretation;
  var delimiter;
  var delimiterAndPart;
  if(arguments[1] instanceof Function) {
    interpretation = arguments[1];
  } else {
    delimiter = arguments[1];
    delimiterAndPart = this.group(delimiter, partName, function(partName) {
      return partName;
    });
    
    interpretation = arguments[2];
  }
  
  /**
   * @method external:InterpreterObject#plusTypeInterpreterMethod
   * @description <p>
   * A plus type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} meant to be put on a 
   * {@link external:InterpreterObject} created by the user. 
   * It is the result of calling {@link InterpreterMethodFactory#plus} with 
   * the {@link interpreterMethodName} of its only {@link part} and optionally 
   * a regular expression that will act as a delimiter.
   * </p><p>
   * Among the different types of interpreter methods, this is the equivalent 
   * of the + quantifier in regular expressions. 
   * It lets its {@link part} parse the text over and over until it can't parse 
   * anymore, optionally skipping over a delimiter regular expression in 
   * between the parsings. 
   * Just like the regex +, it needs to parse its part at least once to 
   * be successfully parsed.
   * </p><p>
   * The result of an interpreter method of this type is an array with the 
   * results of the repeated parsings of its {@link part}, if it wasn't defined 
   * with a {@link external:ThisBinding#plusInterpretation}.
   * If it was, the result will be the result of calling its interpretation 
   * as if it was a method of the same object with the abovementioned array as 
   * the only argument. 
   * Inside the body of the interpretation, <tt>this</tt> will be bound to the 
   * object of the interpreter method.
   * </p>
   * @param {string} text - The text that the {@link part} should parse, as 
   * many times as it can, but at least one time.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}.
   * @returns {InterpretationMethodResult} The result of its interpretation, 
   * if it has one, otherwise an array with the results of repeatedly letting 
   * its {@link part} parse the text.
   * @see {@link plusUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    var maybeInstruction = factory
    .callInterpreterMethod(interpreter, partName, codePointer);
    if(!maybeInstruction){
      return null;
    }
    if(delimiter){
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = delimiterAndPart.call(interpreter, codePointer, 
          delimiter + " and " + partName);
      }
    } else {
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = factory
          .callInterpreterMethod(interpreter, partName, codePointer);
      }
    }
    
    return function instruction() {
      var results = factory.mapRunAsMethod(this, partInstructions);
      return interpretation?interpretation.call(this, results):results;
    };
    
  });
  
};

/**
 * The opt interpreter method factory method takes an 
 * {@link interpreterMethodName} and optionally an 
 * {@link external:ThisBinding#optFallbackReplacement} and produces a
 * {@link external:InterpreterObject#optTypeInterpreterMethod} meant to be 
 * put on a user created {@link external:InterpreterObject}. 
 * This is a quantifier type interpretation method that tries to parse the 
 * {@link part} indicated by the {@link interpreterMethodName} once. 
 * The result of the interpreter method is the result of its {@link part}, if 
 * the manages to parse.
 * Otherwise the it will behave as if it was the fallback method that was 
 * called. 
 * More precisely, the interpreter method will call the fallback method with 
 * <tt>this</tt> bound to its object and return the result.
 * 
 * @param {interpreterMethodName} partName - The name of the optional 
 * {@link part}.
 * @param {external:ThisBinding#optFallbackReplacement} 
 * [fallbackReplacement] - If the {@link part} couldn't be parsed, the 
 * interpreter method will behave as if it was the fallback replacement that 
 * was called. If there is no fallback, the interpreter method will return 
 * <tt>undefined</tt> in case its part fails to parse.
 * @returns {external:InterpreterObject#optTypeInterpreterMethod} An 
 * interpreter method that will succeed to parse, even of its part doesn't.
 * 
 * @example 
 * var f = new InterpreterMethodFactory();
 * // interpreter.aOpt is the Semantics! equivalent of /a?/
 * var interpreter = {
 *   a: f.atom(/a/), 
 *   aOpt: f.opt("a", function() {
 *     return "fallback result";
 *   },
 * };
 * var anA = interpreter.aOpt("a"); // anA == "a"
 * var noA = interpreter.aOpt(""); // noA == "fallback result" 
 * @see {@link optUnitTests}
 */
InterpreterMethodFactory.prototype
.opt = function(name, interpretation) {
  /**
   * @method external:ThisBinding#optFallbackReplacement
   * @description An opt fallback replacement is a callback function passed to 
   * {@link InterpreterMethodFactory#opt} when defining an
   * {@link external:InterpreterObject#optTypeInterpreterMethod} that 
   * acts like a replacement method for the interpreter method if that fails to 
   * parse its {@link part} from the text.
   * Then the interpreter method will behave exactly as if it was the fallback 
   * replacement that was called. 
   * This means that <tt>this</tt> will be bound to the object of the 
   * interpreter method inside the body of the fallback replacement, and that 
   * the method will return the result of the fallback replacement, if the 
   * {@link part} can't be parsed.
   * 
   * @returns {InterpreterMethodResult} User defined. If the {@link part} 
   * cannot be parsed, the interpreter method will return the result of calling 
   * this fallback replacement.
   * @see {@link optUnitTests}
   */
  var factory = this;
  var defaultInterpretation = function() {
    return undefined;
  };
  
  /**
   * @method external:InterpreterObject#optTypeInterpreterMethod
   * @description <p>
   * An opt type interpreter method is a type of 
   * {@link external:InterpreterObject#interpreterMethod} meant to be on an 
   * {@link external:InterpreterObject} created by the user. 
   * It is the result of calling {@link InterpreterMethodFactory#opt} with 
   * the {@link interpreterMethodName} of its only {@link part} and an 
   * {@link external:ThisBinding#optFallbackReplacement}.
   * </p><p>
   * Among the different types of interpreter methods, this is the equivalent 
   * of the <tt>?</tt> quantifier in regular expressions, with the addition of 
   * having a defined behaviour if there is no {@link part}.
   * The result of an interpreter method of this type is either the result of 
   * the part, if it could be parsed, or the result of its fallback 
   * replacement, if it couldn't be parsed, or <tt>undefined</tt>, if it 
   * couldn't be parsed and it has no fallback replacement. 
   * Inside the body of the interpretation, <tt>this</tt> will be bound to the 
   * object of the interpreter method.
   * </p>
   * @param {string} text - The text optionally parsed by the {@link part}.
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}.
   * @returns {InterpretationMethodResult} The result of its interpretation, 
   * if it has one, otherwise an array with the results of repeatedly letting 
   * its {@link part} parse the text.
   * @see {@link optUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction = factory
    .callInterpreterMethod(interpreter, name, codePointer);
    return maybeInstruction || interpretation || defaultInterpretation;
  });
};

/**
 * <p>
 * This method takes an {@link interpreterMethodName} and returns an 
 * {@link external:InterpreterObject#methodFactoryTypeInterpreterMethod}
 * meant to be a method of an {@link external:InterpreterObject}.
 * When called, a method factory type interpreter method returns a function 
 * that does exactely the same thing as the named {@link part} would have done, 
 * but with the possibility to run the descendant interpretations with another 
 * {@link external:ThisBinding}. 
 * </p><p>
 * This type of {@link external:InterpreterObject#interpreterMethod}s are 
 * useful for implementing e. g. functions or loops, for setting another object 
 * then the interpreter as the this binding and for running the parsed 
 * instruction many times without having to parse it each time. 
 * </p> 
 * @param {interpreterMethodName} partName - The name of the {@link part} that 
 * the function returned by the interpreter method will run.
 * @returns {external:InterpreterObject#methodFactoryTypeInterpreterMethod} 
 * An interpreter method that returns a function that does the same thing as 
 * the named {@link part} would have done, but with the posibility to run its 
 * descendant interpretations with another <tt>this</tt> binding. 
 * @see {@link methodFactoryUnitTests}
 */
InterpreterMethodFactory.prototype
.methodFactory = function(name) {
  var factory = this;
  
  /**
   * @method external:InterpreterObject#methodFactoryTypeInterpreterMethod
   * @description This {@link external:InterpreterObject#interpreterMethod} 
   * returns a function doing the same thing as the {@link part} named in its 
   * factory, {@link InterpreterMethodFactory#methodFactory}, would have done, 
   * but with the possibility to use another value for this in the 
   * interpretations of its descendant {@link part}s. 
   * The new value of this is supplied by running the instruction as a method 
   * of the {@link external:ThisBinding} object, by using call or apply, or by 
   * assigning it as a (temporary) property of the this binding before calling 
   * it. 
   * If the value of this should not be changed then the interpreter object has 
   * to be supplied in one of the beforementioned ways. 
   * If the returned function is called directly, interpretations of any 
   * descendant parts will get undefined (or worse, window) as the value for 
   * this. 
   * The returned function takes no arguments (at the moment, this might 
   * change). 
   * @param {string} text - The text to be interpreted by the {@link part}. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {function} A method that does the same thing as the {@link part} 
   * would have, but with the possibility to do it with another <tt>this</tt> 
   * binding. 
   * @see {@link methodFactoryUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var instructionToDeferre = factory
    .callInterpreterMethod(interpreter, name, codePointer);
    if(!instructionToDeferre) {
      return null;
    }
    
    return function instruction() {
      return instructionToDeferre;
    };
    
  });
  
};

InterpreterMethodFactory.prototype
.parseInsignificantAndToken = function(codePointer, token, interpreter) {
  if(!this.parseInsignificant(codePointer, interpreter)) {
    return null;
  }
  
  return codePointer.parse(token);
};

InterpreterMethodFactory.prototype
.parseInsignificant = function(codePointer, interpreter) {
  if(codePointer.insignificant instanceof RegExp) {
    return codePointer.parse(codePointer.insignificant);
  } else if(typeof codePointer.insignificant === "string"){
    var justInsignificantMethod = this.justInsignificant(undefined, 
    codePointer.insignificant);
    return justInsignificantMethod
    .call(interpreter, codePointer, "(insignificant) " +
    codePointer.insignificant);
  } else {
    return true;
  }
};

InterpreterMethodFactory.prototype
.shiftInsignificant = function(insignificant, partName, codePointer, 
interpreter) {
  var outerInsignificant = codePointer.insignificant;
  codePointer.insignificant = insignificant;
  var instruction = this
  .callInterpreterMethod(interpreter, partName, codePointer);
  if(instruction&&!this.parseInsignificant(codePointer, interpreter)){
    instruction = null;
  }
  
  codePointer.insignificant = outerInsignificant;
  return instruction;
};

InterpreterMethodFactory.prototype
.justInsignificant = function(insignificant, partName) {
  "use strict";
  var that = this;

  return this.makeMethod(function(codePointer, interpreter) {
    var instruction = that.shiftInsignificant(insignificant, partName, 
    codePointer, interpreter);
    return instruction;
  });
};

/**
 * This factory method takes one {@link interpreterMethodName} or regular 
 * expression describing how to match the insignificant text, and one 
 * {@link interpreterMethodName} naming its only {@link part} and produces 
 * an {@link external:InterpreterObject#insignificantTypeInterpreterMethod} 
 * meant to be put on an {@link external:InterpreterObject} created by the user. 
 * The returned interpreter method changes the parsing behaviour of its 
 * descendants. 
 * The descendants of an insignificant interpreter method will parse 
 * insignificant text between its symbols.
 * Note that a descendant part will fail to parse if it isn't padded with an 
 * insignificant.
 * Therefore, if insignificants are not meant to be mandatory, they should be 
 * defined as optional, either by putting them in a <tt>/()?/</tt> in case it 
 * is a regular expression, or inside an {@link InterpreterMethodFactory#opt} 
 * if it is an interpreter method.
 * 
 * @param {(RegExp|interpreterMethodName)} insignificant - A description of 
 * what should be parsed unnoticed between the significant parts.
 * @param {interpreterMethodName} partName - The top interpreter method where 
 * the parts should be parsed with insignificants in between.
 * @returns {external:InterpreterObject#insignificantTypeInterpreterMethod} 
 * An interpreter method where the parsing behaviour has been altered to skip 
 * insignificant symbols.
 * @see {@link insignificantUnitTests}
 * @example
 * var f = new InterpreterMethodFactory();
 * var interpreter = {
 *   a: f.atom(/a/), 
 *   b: f.atom(/b/),
 *   part: f.group("a", "b"),
 *   insign: f.atom(/i/),
 *   iPart: f.insignificant("insign", "part"),
 *   jiPart: f.insignificant(/j/, "iPart"),
 * };
 * var ab1 = interpreter.iPart("iaibi");       // ab1 == {a: "a", b: "b"}
 * var ab2 = interpreter.jiPart("jiaibij");    // ab2 == {a: "a", b: "b"}
 * var missingInsign = interpreter.iPart("ab") // parse fail
 */
InterpreterMethodFactory.prototype
.insignificant = function(insignificant, partName) {
  "use strict";
  var that = this;

  /**
   * @method external:InterpreterObject#insignificantTypeInterpreterMethod
   * @description This {@link external:InterpreterObject#interpreterMethod} 
   * makes its descendants parse insignificant delimiters between each parse.
   * 
   * @param {string} text - Text with insignificant delimiters to be 
   * interpreted by the {@link part}. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The result of its {@link part} 
   * @see {@link insignificantUnitTests}
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var instruction;
    if(that.parseInsignificant(codePointer, interpreter)) {
      instruction = that.shiftInsignificant(insignificant, partName, 
      codePointer, interpreter);
    }
    return instruction;
  });
};