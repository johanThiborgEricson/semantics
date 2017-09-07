InterpreterMethodFactory = function() {
  "use strict";
  var that = Object.create(InterpreterMethodFactory.prototype);
  
  that.CodePointer = CodePointer;
  
  return that;
};

InterpreterMethodFactory
.callInterpreterMethod = function(interpreter, methodName, codePointer) {
  return interpreter[methodName](codePointer, methodName);
};

InterpreterMethodFactory.preInstructionMaker = 
function(interpreter, methodFactory, method, code, debuggingOrMethodName) {
  var v = {};

  if(code instanceof CodePointer) {
    v.isInternalCall = true;
    v.codePointer = code;
    v.methodName = debuggingOrMethodName;
  } else {
    v.isInternalCall = false;
    v.codePointer = methodFactory.CodePointer(code, debuggingOrMethodName);
    v.methodName = methodFactory.nameOf(interpreter, method);
  }
  
  v.codePointer.logParseStart(v.methodName);
  v.backup = v.codePointer.backup();
  
  return v;
};

InterpreterMethodFactory.postInstructionMaker = 
function(v, interpreter, maybeInstruction) {
  if(!maybeInstruction){
    v.codePointer.restore(v.backup);
  }
  
  v.codePointer.logParseEnd(v.methodName, !!maybeInstruction);
  if(!v.isInternalCall) {
    if(!maybeInstruction) {
      throw new Error(v.codePointer.getParseErrorDescription());
    } else if(v.codePointer.getUnparsed() !== "") {
      throw new Error("Trailing code: '" + v.codePointer.getUnparsed() + "'.");
    }
    
  }
  
};

InterpreterMethodFactory.prototype
.makeMethod = function(instructionMaker) {
  "use strict";
  var methodFactory = this;
  var method = function(code, debuggingOrMethodName) {
    var v = InterpreterMethodFactory.preInstructionMaker(this, methodFactory, 
    method, code, debuggingOrMethodName);
    
    var maybeInstruction;
    var heads = v.codePointer.heads[v.backup] = 
        v.codePointer.heads[v.backup] || Object.create(null);
    if(heads[v.methodName]) {
      maybeInstruction = heads[v.methodName].cache;
      v.codePointer.restore(heads[v.methodName].end);
    } else {
      var head = heads[v.methodName] = {};
      
      maybeInstruction = instructionMaker(v.codePointer, this, v.methodName);
      
      head.cache = maybeInstruction;
      head.end = v.codePointer.backup();
    }
    
    InterpreterMethodFactory.
        postInstructionMaker(v, this, maybeInstruction);
    
    return v.isInternalCall?maybeInstruction:maybeInstruction(this);
  };
  
  return method;
};

InterpreterMethodFactory.prototype.hr = function() {
  if(arguments.length === 0) {
    throw new Error("An or needs at least one alternative.");
  }
  
  var alternativesNames = arguments;
  
  var instructionMaker = function(codePointer, interpreter, methodName) {
    var maybeInstruction;
    var v = {};
    v.codePointer = codePointer;
    v.methodName = methodName;
    var cp = v.codePointer;
    var p = cp._pointer;
    var heads = cp.heads[p] = cp.heads[p] || {};
    var cache = null;
    var head = {};
    if(heads[v.methodName]) {
      heads[v.methodName].headRecursionDetected = true;
      cp._pointer = heads[v.methodName].end;
      maybeInstruction = heads[v.methodName].cache;
    } else {
      heads[v.methodName] = head;
      maybeInstruction = null;
      var i;
      maybeInstruction = null;
      i = 0;
      while(!maybeInstruction && i < alternativesNames.length) {
        maybeInstruction = InterpreterMethodFactory
        .callInterpreterMethod(interpreter, alternativesNames[i++], codePointer);
      }
      
      if(head.headRecursionDetected) {
        var hasProgressed = true;
        
        while(hasProgressed) {
          if(v.codePointer._debugging) {
            console.log("Reparsing with found %s", methodName);
          }
          
          head.cache = maybeInstruction;
          head.end = cp._pointer;
          
          cp._pointer = p;
          maybeInstruction = null;
          i = 0;
          while(!maybeInstruction && i < alternativesNames.length) {
            maybeInstruction = InterpreterMethodFactory
            .callInterpreterMethod(interpreter, alternativesNames[i++], codePointer);
          }
          
          hasProgressed = cp._pointer > head.end;
          
          if(!maybeInstruction || !hasProgressed) {
            cp._pointer = head.end;
            maybeInstruction = head.cache;
          }
            
        }
      }
      
    }
    
    return maybeInstruction;
  };
  
  return this.makeMethod(instructionMaker);
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
.atom = function(regExp, interpretation) {
  "use strict";
  var instructionMaker = function(codePointer, interpreter) {
    var match = codePointer.matchAtPointer(regExp);
    if(match === null) {
      return null;
    }
    
    var result = match[0];
    var instruction = function(interpreter) {
      if(interpretation) {
        result = interpretation.call(interpreter, result);
      }
      
      return result;
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.prototype
.empty = function(interpretation) {
  "use strict";
  if(!interpretation) {
    throw new Error("The empty string atom should be called with a function");
  }
  
  var instructionMaker = function(codePointer, interpreter) {
    var instruction = function(interpreter) {
      return interpretation.call(interpreter);
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.prototype
.group = function() {
  "use strict";
  var partNames;
  var interpretation = arguments[arguments.length-1];
  if(interpretation instanceof Function) {
    partNames = Array.prototype.slice.call(arguments, 0, -1);
  } else {
    interpretation = null;
    partNames = Array.prototype.slice.call(arguments);
  }
  var instructionMaker = function(codePointer, interpreter) {
    var partInstructions = [];

    for(var i = 0; i < partNames.length; i++) {
      var partName = partNames[i];
      if(typeof partName === "string") {
        var maybeInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, partName, codePointer);
        if(!maybeInstruction){
          return null;
        }
        maybeInstruction.partName = partName;
        partInstructions.push(maybeInstruction);
      } else if(partName instanceof RegExp) {
        if(!codePointer.matchAtPointer(partName)) {
          return null;
        }
      }
      
    }
    
    var instruction = function(interpreter) {
      var mpo = new InterpreterMethodFactory.MultiPropertyObject();
      var result = {};
      var interpretationArguments = [];
      partInstructions.map(function(partInstruction) {
        var partResult = partInstruction(interpreter);
        interpretationArguments.push(partResult);
        mpo.appendProperty.call(result, partInstruction.partName, partResult);
      });
      
      if(interpretation) {
        result = interpretation.apply(interpreter, interpretationArguments);
      }
      
      return result;
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.MultiPropertyObject = function() {
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

InterpreterMethodFactory.prototype.or = function() {
  var alternativesNames = arguments;
  
  var instructionMaker = function(codePointer, interpreter, methodName) {
    var maybeInstruction = null;
    var i = 0;
    while(!maybeInstruction && i < alternativesNames.length) {
      maybeInstruction = InterpreterMethodFactory
      .callInterpreterMethod(interpreter, alternativesNames[i++], codePointer);
    }
    
    return maybeInstruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.prototype
.star = function(partName) {
  "use strict";
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
  
  var instructionMaker = function(codePointer, interpreter) {
    var partInstructions = [];
    var maybeInstruction = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, partName, codePointer);
    while(maybeInstruction) {
      partInstructions.push(maybeInstruction);
      if(delimiter) {
        maybeInstruction = 
        delimiterAndPart.call(interpreter, codePointer, 
          delimiter + " and " + partName);
      } else {
        maybeInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, partName, codePointer);
      }
    }
      
    var instruction = function(interpreter) {
      var results = partInstructions.map(function(partInstruction) {
        return partInstruction(interpreter);
      });
      
      if(interpretation) {
        results = interpretation.call(interpreter, results);
      }
      
      return results;
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.prototype
.opt = function(name, defaultReturnValue) {
  var instructionMaker = function(codePointer, interpreter) {
    var maybeInstruction = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, name, codePointer);
    var instruction = function(interpreter) {
      var result;
      if(maybeInstruction) {
        result = maybeInstruction(interpreter);
      } else {
        result = defaultReturnValue;
      }
      
      return result;
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};

InterpreterMethodFactory.prototype
.deferredExecution = function(name) {
  var instructionMaker = function(codePointer, interpreter) {
    var instructionToDeferre = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, name, codePointer);
    if(!instructionToDeferre) {
      return null;
    }
    
    var instruction = function(interpreter) {
      return instructionToDeferre;
    };
    
    return instruction;
  };
  
  return this.makeMethod(instructionMaker);
};
