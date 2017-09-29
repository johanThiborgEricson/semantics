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
