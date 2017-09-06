describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  f.noRecursion = function(spy) {
    var instructionMaker = function() {
      spy();
      return function instruction() {};
    };
    
    return this.makeMethod(instructionMaker);
  };
  
  var instructionMaker;
  
  var interpreter;
  
  beforeEach(function() {
    
    instructionMaker = jasmine.createSpy("instructionMaker");
    
    interpreter = {
      noRecursion: f.noRecursion(instructionMaker), 
    };
    
  });
  
  it("doesn't look for recursive definitions if no head recursion is detected", 
  function() {
    interpreter.noRecursion("");
    
    expect(instructionMaker).toHaveBeenCalledTimes(1);
  });
  
});
