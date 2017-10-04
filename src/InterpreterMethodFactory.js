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

InterpreterMethodFactory.prototype
.atom = function(regex, interpretationOrButNot) {
  "use strict";
  var that = this;
  var parsingRegex = this.makeParsing(regex);
  var interpretation;
  var butNot;
  if(typeof interpretationOrButNot === "function") {
    interpretation = interpretationOrButNot;
  } else {
    butNot = interpretationOrButNot;
    interpretation = arguments[2];
  }
  
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

InterpreterMethodFactory.prototype
.empty = function(interpretation) {
  "use strict";
  if(!interpretation) {
    throw new Error("The empty string atom should be called with a function");
  }
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    return interpretation;
  });
  
};

InterpreterMethodFactory.prototype
.group = function() {
  "use strict";
  var factory = this;
  var parts = [];
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

InterpreterMethodFactory.prototype.MultiPropertyObject = function() {
  var nameCount = Object.create(null);
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

InterpreterMethodFactory.prototype
.methodFactory = function(name) {
  var factory = this;
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