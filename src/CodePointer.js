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

CodePointer.prototype.hasCachedResult = function(name) {
  return this.heads[this._pointer]&&this.heads[this._pointer][name];
};

CodePointer.prototype.getCachedResult = function(name) {
  var heads = this.heads[this._pointer];
  var maybeInstruction = heads[name].cache;
  this.restore(heads[name].end);
  heads[name].recursionDetected = true;
  return maybeInstruction;
};

CodePointer.prototype.getState = function() {
  var codePointer = this;
  var snapshot = this.heads[this._pointer] = 
          this.heads[this._pointer] || Object.create(null);
  var result = {
    backup: function()  {
      codePointer.heads[codePointer._pointer] = Object.create(snapshot);
    },
    
    position: this._pointer,
    hasCachedResult: function(name) {
      return this.head[name];
    },
    
    getCachedResult: function(name) {
      var head = this.head[name];
      var maybeInstruction = head.cache;
      codePointer.restore(head.end);
      head.recursionDetected = true;
      return maybeInstruction;
    },
    
    head: snapshot,
    getHead: function(name) {
      return (this.head[name]=this.head[name]||{});
    },
    
    restore: function() {
      codePointer._pointer = this.position;
      codePointer.heads[this.position] = Object.create(this.head);
    },
    
  };
  
  return result;
};
