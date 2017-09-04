describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  
  f.dummy = function(instructionMaker) {
    return this.makeMethod(instructionMaker);
  };
  
  var interpreter;
  var instructionMaker;
  
  beforeEach(function() {
    interpreter = {};
    
    instructionMaker = jasmine.createSpy("instructionMaker")
    .and.returnValue(function(){});
    
    interpreter.dummy = f.dummy(instructionMaker);
  });
  
  it("parses each (non-)terminal twice", function() {
    interpreter.dummy("");
    
    expect(instructionMaker).toHaveBeenCalledTimes(2);
  });
  
});
