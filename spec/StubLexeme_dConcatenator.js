function StubLexeme_dConcatenator() {
  var that = Object.create(StubLexeme_dConcatenator.prototype);
  
  var instructionMaker = function(codePointer) {
    // TODO: use array.slice and concatenate.apply(this, lexeme) to 
    // better illustrate how it is supposed to work.
    var match = /^lexeme \d/.exec(codePointer.backup());
    if(!match) {
      return null;
    }
    
    var lexeme = match[0];
    codePointer.restore(codePointer.backup().slice(lexeme.length));
    return function(interpreter) {
      interpreter.con = interpreter.con + lexeme;
      return interpreter.con;
    };
  };
  
  // TODO: replace with stub implementation
  return InterpreterMethodFactory().makeMethod(instructionMaker);

}
