describe("InterpreterMethodFactory().terminalSkip(lexeme)", function() {
  it("calls terminal", 
  function() {
    var methodFactory = InterpreterMethodFactory();
    spyOn(methodFactory, "terminal");
    
    methodFactory.terminalSkip("lexeme");
    
    expect(methodFactory.terminal).toHaveBeenCalled();
  });
  
  it("calls terminal with lexeme as the first argument and a function", 
  function() {
    var methodFactory = InterpreterMethodFactory();
    spyOn(methodFactory, "terminal");
    
    methodFactory.terminalSkip("lexeme");
    
    expect(methodFactory.terminal)
    .toHaveBeenCalledWith("lexeme", jasmine.any(Function));
  });

  it("returns the result of the call to terminal", function() {
    var methodFactory = InterpreterMethodFactory();
    spyOn(methodFactory, "terminal").and.returnValue("result");
    
    var result = methodFactory.terminalSkip();
    
    expect(result).toBe("result");
  });

});