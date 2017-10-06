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
 * @description The interpretation callback functions passed to the methods of 
 * an {@link InterpreterMethodFactory} when constructing 
 * {@link external:InterpreterObject#interpreterMethod}s for a user 
 * created {@link external:InterpreterObject} should be thought of as if they 
 * were methods of that interpreter object. 
 * In practice, that means that <tt>this</tt> will be bound to the interpreter 
 * object inside the body of those  interpretations. 
 * This class is not a real class whith real methods, but rather a place to 
 * collect the documentations of all callback functions that will run as 
 * methods of the interpreter object. 
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
 * used to set the <tt>this</tt> binding to another object, see also 
 * {@link external:ThisBinding}. 
 */
 
/**
 * @method external:InterpreterObject#interpreterMethod
 * @description This is a general description that applies to all interpreter 
 * methods. 
 * An interpreter method interprets text. 
 * When it is called from the outside code, it interprets the text of its first 
 * argument. 
 * When it is called as a {@link part} of another interpreter method, it parses 
 * as much of the text as it can, starting from the point in the text where the 
 * last interpreter method finished parsing. 
 * If it fails to parse, it will return the text pointer so that the next 
 * method will start parsing at the same position as the current one started 
 * before it failed. 
 * All interpreter methods are constructed never to be "half parsed"; if they 
 * fail, then the text pointer will be restored. 
 * An interpreter method, with no interpretation, will return a type dependent 
 * container with the result of its {@link part}s. 
 * If it has an interpretation, the result of the method will be the result of 
 * calling its interpretation with the result of its parts. 
 * @todo Describe parse errors. 
 * @abstract
 * @param {string} text - The text to be interpreted. 
 * @param {boolean} [printDebuggingMessages] - If this is true, debugging 
 * messages are printed to console.log. 
 * @returns {InterpreterMethodResult} A type dependent container with the 
 * result of the {@link part}s of the method or the result of its 
 * interpretation, if an interpretation has been supplied. 
 */

/**
 * The atom interpreter method factory takes a regular expression and makes an 
 * {@link external:InterpreterObject#atomTypeInterpreterMethod} meant to be a 
 * interpreter method of a user created {@link external:InterpreterObject}.
 * The returned method parses text with the supplied regular expression. 
 * Optionally, an {external:ThisBinding#atomInterpretation} callback function 
 * may be supplied to describe how the parsed text should be interpreted. 
 * The interpretation will be run as if it was a method of the interpreter 
 * object, i. e. <tt>this</tt> will be bound to the interpreter object inside 
 * the interpretation body.
 * @param {RegExp} regex - The regular expression that the interpreter method
 * should use to parse text. 
 * @param {string[]} [butNot] - A list of forbidden words. 
 * If the parsed string equals an element in this list, the parsing fails. 
 * @param {external:ThisBinding#atomInterpretation} [interpretation] - 
 * A callback function describing how the parsed string should be interpreted. 
 * If pressent, the result of this function will also be the result of the 
 * interpreter method. 
 * Otherwise the parsed string will be returned. 
 * @returns {external:InterpreterObject#atomTypeInterpreterMethod}
 * An interpreter method that parses a regular expression. 
 */
InterpreterMethodFactory.prototype
.atom = function(regex, interpretationOrButNot) {
  "use strict";
  var that = this;
  var parsingRegex = this.makeParsing(regex);
  
  /**
   * @method external:ThisBinding#atomInterpretation
   * @description An atom interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#atom}. 
   * Inside the callback, this will refere to the
   * {@link external:ThisBinding}. 
   * The interpretation is called with the string parsed by its 
   * {@link external:InterpreterObject#atomTypeInterpreterMethod}, 
   * which will also return the result of this interpretation. 
   * @param {string} parsedText - The text parsed by the interpreter method. 
   * @returns {*} User defined. 
   * The value returned by the interpretation will 
   * also be the return value of its interpreter method. 
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
   * @method external:InterpreterObject#atomTypeInterpreterMethod
   * @description An atom type interpreter method is a method of an 
   * {@link external:InterpreterObject} that has been made with
   * {@link InterpreterMehtodFactory#atom}.
   * It is a type of {@link external:InterpreterObject#interpreterMethod}
   * that parses and interprets its input text using a regular expression. 
   * Parsing is done by trying to match the regular expression starting at the 
   * current position in the text. 
   * Matches starting at other positions will not be concidered. 
   * The full match (corresponding to match[0]) will be parsed, so capturing 
   * groups will not have any effect. 
   * It returns the parsed text or, if it has a 
   * {@link external:ThisBinding#atomInterpretation}, the result of calling 
   * that interpretation with the parsed string. 
   * Inside the body of the interpretation, <tt>this</tt> will be bound the 
   * {@link external:InterpreterObject}, as if it was a method.
   * If the regular expression can't be matched at the current position in the 
   * text, the method fails to parse. 
   * @param {string} text - The text to be interpreted. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The parsed string or the result of 
   * calling the interpretation with the parsed string, if an interpretation is 
   * supplied. 
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
 */
InterpreterMethodFactory.prototype
.empty = function(interpretation) {
  "use strict";
  if(!interpretation) {
    throw new Error("The empty string atom should be called with a function");
  }
  
  /**
   * @method external:InterpreterObject#emptyTypeInterpreterMethod
   * @description An empty type interpreter method doesn't parse anything. 
   * It just runs the callback function interpretation passed to its factory 
   * function, {@link InterpreterMethodFactory#empty}, as a method of the 
   * {external InterpreterObject} and returns the result. 
   * @param {string} text - The text that won't be interpreted. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} The result of calling the 
   * interpretation callback function passed to 
   * {@link InterpreterMethodFactory#empty} when constructing this 
   * interpreter method. 
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

/**
 * The group interpreter method factory accepts any number of 
 * {@link interpreterMethodName}s and regular expressions in any order as 
 * arguments and creates a 
 * {@link external:InterpreterObject#groupTypeInterpreterMethod} meant to be a 
 * method of an {@link external:InterpreterObject}. 
 * The returned method parses the supplied regular expressions and the 
 * {@link external:InterpreterObject#interpreterMethod}s named by 
 * the interpreter method names, in the specified order. 
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
 */
InterpreterMethodFactory.prototype
.group = function() {
  "use strict";
  var factory = this;
  var parts = [];
  
  /**
   * @method external:ThisBinding#groupInterpretation
   * @description A group interpretation is a callback function passed to 
   * {@link InterpreterMethodFactory#group}. 
   * Inside the callback, this will refere to the
   * {@link external:ThisBinding}. 
   * The interpretation is called with the results of the {@link part}s of the 
   * interpreter method. 
   * @param {...InterpreterMethodResult} partResults - The results of the parts 
   * of the method. 
   * @returns {*} User defined. 
   * The value returned by the interpretation will 
   * also be the return value of its interpreter method. 
   */
  var interpretation;
  var p = {
    i: 0,
  };
  var argument;
  var leadingRegexes = this.readRegexesFromArguments(arguments, p);
  while(p.i < arguments.length) {
    argument = arguments[p.i++];
    if(typeof argument === "string") {
      parts.push({
        name: argument,
        trailingRegexes: this.readRegexesFromArguments(arguments, p),
      });
    } else {
      interpretation = argument;
    }
  }
  
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
   * If it was defined with an 
   * {@link external:ThisBinding#groupInterpretation} it will call that with 
   * the results of its {@link part}s as arguments, and return the result. 
   * Otherwise it will return an 
   * {@link InterpreterMethodFactory#MultiPropertyObject}-like object with 
   * properties named as the {@link interpreterMethodName}s containing 
   * the results of the {@link part}s of the method. 
   * @param {string} text - The text to be interpreted. 
   * @param {boolean} [printDebuggingMessages] - See 
   * {@link external:InterpreterObject#interpreterMethod}. 
   * @returns {InterpreterMethodResult} An 
   * {@link InterpreterMethodFactory#MultiPropertyObject}-like object 
   * or the result of calling the interpretation with the result of its
   * {@link part}s. 
   */
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    if(!factory.skipRegexes(codePointer, leadingRegexes, interpreter)){
      return null;
    }
    var partInstructions = [];
    for(var i = 0; i < parts.length; i++){
      var maybeInstruction = factory
            .callInterpreterMethod(interpreter, parts[i].name, codePointer);
      if(!maybeInstruction
        ||!factory.skipRegexes(codePointer, parts[i].trailingRegexes, 
        interpreter)) {
        return null;
      }
      maybeInstruction.partName = parts[i].name;
      
      partInstructions.push(maybeInstruction);
    }
    
    if(interpretation) {
      return function instruction() {
        return interpretation.apply(this, factory
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
   * @param {InterpreterMethodResult} partResult - The result of a {@link part} 
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

InterpreterMethodFactory.prototype.wrap = function() {
  "use strict";
  var factory = this;
  var p = {
    i: 0,
  };
  var leadingRegexes = this.readRegexesFromArguments(arguments, p);
  var partName = arguments[p.i++];
  var trailingRegexes = this.readRegexesFromArguments(arguments, p);
  var interpretation = arguments[p.i++];
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction;
    if(factory.skipRegexes(codePointer, leadingRegexes, interpreter) && 
    (maybeInstruction = factory
    .callInterpreterMethod(interpreter, partName, codePointer)) &&
    factory.skipRegexes(codePointer, trailingRegexes, interpreter)) {
      return !interpretation?maybeInstruction:function instruction() {
        return interpretation.call(this, maybeInstruction.call(this));
      };
      
    } else {
      return null;
    }
    
  });
  
};

InterpreterMethodFactory.prototype.functionReturning = function(value) {
  return function() {
    return value;
  };

};

InterpreterMethodFactory.prototype.or = function() {
  var factory = this;
  var alternativesNames = arguments;
  
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

InterpreterMethodFactory.prototype.longest = function() {
  "use strict";
  var factory = this;
  var alternativesNames = Array.prototype.slice.call(arguments);
  
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

InterpreterMethodFactory.prototype
.star = function(partName) {
  "use strict";
  var factory = this;
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

InterpreterMethodFactory.prototype
.plus = function(partName) {
  "use strict";
  var factory = this;
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

InterpreterMethodFactory.prototype
.opt = function(name, interpretation) {
  var factory = this;
  var defaultInterpretation = function() {
    return undefined;
  };
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction = factory
    .callInterpreterMethod(interpreter, name, codePointer);
    return maybeInstruction || interpretation || defaultInterpretation;
  });
};

/**
 * This method takes an {@link interpreterMethodName} and returns an 
 * {@link external:InterpreterObject#methodFactoryTypeInterpreterMethod}
 * meant to be a method of an {@link external:InterpreterObject}.
 * When called, a method factory type interpreter method returns a function 
 * that does exactely the same thing as the named {@link part} would have done, 
 * but with the possibility to run the descendant interpretations with another 
 * {@link external:ThisBinding}. 
 * This type of {@link external:InterpreterObject#interpreterMethod}s are 
 * useful for implementing e. g. functions or loops, for setting another object 
 * then the interpreter as the this binding and for running the parsed 
 * instruction many times without having to parse it each time. 
 * @param {interpreterMethodName} partName - The name of the {@link part} that 
 * the function returned by the interpreter method will run.
 * @returns {external:InterpreterObject#methodFactoryTypeInterpreterMethod} 
 * An interpreter method that returns a function that does the same thing as 
 * the named {@link part} would have done, but with the posibility to run its 
 * descendant interpretations with another <tt>this</tt> binding.
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
   * @returns {function} A method that does the same thing as the {@link part}, 
   * would have, but with the possibility to do it with another value of this. 
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

InterpreterMethodFactory.prototype
.insignificant = function(insignificant, partName) {
  "use strict";
  var that = this;

  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var instruction;
    if(that.parseInsignificant(codePointer, interpreter)) {
      instruction = that.shiftInsignificant(insignificant, partName, 
      codePointer, interpreter);
    }
    return instruction;
  });
};