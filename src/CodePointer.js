function CodePointer(code, debugging) {
  this._code = code;
  this._debugging = debugging;
  this._pointer = 0;
  this.heads = {};
  this.indentation = 0;
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

CodePointer.prototype.getHeads = function() {
  return (this.heads[this._pointer] = 
      this.heads[this._pointer] || Object.create(null));
};

CodePointer.prototype.getState = function() {
  var codePointer = this;
  var position = this.backup();
  return {
    heads: codePointer.getHeads(),
    backup: function()  {
      codePointer.heads[position] = Object.create(this.heads);
    },
    
    hasCachedResult: function(name) {
      return this.heads[name];
    },
    
    getCachedResult: function(name) {
      var head = this.heads[name];
      var maybeInstruction = head.cache;
      codePointer.restore(head.end);
      head.recursionDetected = true;
      return maybeInstruction;
    },
    
    register: function(name) {
      return (this.heads[name]=this.heads[name]||{});
    },
    
    restore: function() {
      codePointer.restore(position);
      codePointer.heads[position] = Object.create(this.heads);
    },
    
    recursionDetected: function(name) {
      return this.heads[name].recursionDetected;
    },
    
    cacheResult: function(name, maybeInstruction) {
      this.heads[name].cache = maybeInstruction;
      this.heads[name].end = codePointer.backup();
    },
    
    getCachedResult2: function(name) {
      codePointer.restore(this.heads[name].end);
      return this.heads[name].cache;
    },
    
    hasProgressed: function(name) {
      return codePointer.backup() > this.heads[name].end;
    },
    
  };
  
};
