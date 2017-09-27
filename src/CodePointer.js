function CodePointer(code, debugging) {
  this._code = code;
  this._debugging = debugging;
  this._pointer = 0;
  this.positions = new Array(code.length);
  this.indentation = 0;
  this.stack = [];
  this.recursivelyDefined = [];
  this.parseErrorDescription = {
    actuallCode: {
      length: Infinity,
    }
  };
  
}

CodePointer.prototype.parse = function(regularExpression) {
  regularExpression.lastIndex = 0;
  var unparsed = this.getUnparsed();
  var match = regularExpression.exec(this.getUnparsed());
  if(!match || match.index > 0) {
    match = null;
  } else {
    match.index = this._pointer;
    match.input = this._code;
    this._pointer += match[0].length;
  }
  
  this.reportMatch(regularExpression, unparsed, match);
  return match;
};

CodePointer.prototype
.reportMatch = function(regExp, unparsed, match) {
  var remainingLine = /.*/.exec(unparsed)[0];
  
  if(!match) {
    this.reportParseError(regExp);
    if(this._debugging) {
      console.log("%s.exec(\"%s\") // %s", regExp.toString(), remainingLine, 
      "null");
    }
  } else if(this._debugging) {
    console.log("%s.exec(\"%s\") // \"%s\"", regExp.toString(), remainingLine, 
    match[0]);
  }
};

CodePointer.prototype
.logParseStart = function(name) {
  if(this._debugging) {
    console.log("".padEnd(2*this.indentation)+"%s: parse start", name);
    this.indentation++;
  }
};

CodePointer.prototype
.logParseEnd = function(name, parseSuccess) {
  var message 
  = parseSuccess ? "%s: parse success" : "%s: parse fail";
  if(this._debugging) {
    this.indentation--;
    console.log("".padEnd(2*this.indentation)+message, name);
  }
  
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
.reportParseError = function(token) {
  var stripedToken = token.toString().slice(1, -1);
  var tokenAlternatives = stripedToken;
  var currentUnparsed = this.getUnparsed();
  var currentLength = currentUnparsed.length;
  var previousLength = this.parseErrorDescription.actuallCode.length;
  
  if(currentLength > previousLength) {
    return;
  }
  
  if(currentLength < previousLength) {
    this.parseErrorDescription.expectedAlternatives = undefined;
  }
  
  if(this.parseErrorDescription.expectedAlternatives) {
    tokenAlternatives = 
    this.parseErrorDescription.expectedAlternatives + "|" + stripedToken;
  }
  
  this.parseErrorDescription = {
    expectedAlternatives: tokenAlternatives,
    actuallCode: currentUnparsed,
  };

};

CodePointer.prototype
.getParseErrorDescription = function() {
  return "Expected /^" + this.parseErrorDescription.expectedAlternatives + 
  "/ to match '" + this.parseErrorDescription.actuallCode + "'.";
};

CodePointer.prototype.getState = function(name) {
  var codePointer = this;
  var position = this.backup();
  var positions = codePointer.positions;
  positions[position] = positions[position] || {
    heads: Object.create(null),
    stack: [],
  };
  
  var heads = positions[position].heads;
  var stack = this.stack;
  var hasCachedResult = !!heads[name];
  var head = heads[name] = heads[name] || {
    name: name,
    deleteSelf: function() {
      delete heads[name];
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
      stack.push(head);
    },
    
    popFromStack: function() {
      stack.pop();
    },
    
    setHeadRecursionDetected: function(isHeadRecursionDetected) {
      head.headRecursionDetected = isHeadRecursionDetected;
      var lastEncounter = stack.indexOf(head);
      codePointer.recursivelyDefined = stack.slice(lastEncounter+1, -1);
    },
    

    forgetCachedHeadRecursiveResults: function() {
      codePointer.restore(position);
      codePointer.recursivelyDefined.map(function(recursivelyDefined) {
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
