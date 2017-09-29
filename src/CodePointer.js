function CodePointer(code, debugging) {
  this._code = code;
  this._debugging = debugging;
  this._pointer = 0;
  this.positions = new Array(code.length);
  this.indentation = 0;
  this.stack = [];
  this.recursivelyDefined = Object.create(null);
  this.attempts = {
    position: 0,
    regexes: [],
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
  if(this._debugging) {
    var remainingLine = /.*/.exec(unparsed)[0];
    console.log("%s\n%s", remainingLine, this.hatOff(regExp));
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
  var positions = codePointer.positions;
  positions[position] = positions[position] || {
    heads: Object.create(null),
    stack: [],
  };
  
  var heads = positions[position].heads;
  var stack = this.stack;
  var hasCachedResult = !!heads[name];
  var recursivelyDefined = this.recursivelyDefined[name] = 
      this.recursivelyDefined[name] || [];
  var head = heads[name] = heads[name] || {
    recursivelyDefined: [],
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
      stack.slice(lastEncounter+1, -1).map(function(rd) {
        if(recursivelyDefined.indexOf(rd) === -1){
          recursivelyDefined.push(rd);
        }
      });
      
    },
    

    forgetCachedHeadRecursiveResults: function() {
      codePointer.restore(position);
      recursivelyDefined.map(function(recursivelyDefined) {
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
