describe("An error", function() {
  
  var interpreter;
  var f;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      
    };
    
  });
  
  it("is thrown if the interpreter doesn't have a method with the name", 
  function() {
    interpreter.program = f.group("nonexistent");
    
    expect(function() {
      interpreter.program("");
    }).toThrowError("nonexistent is not a method of the interpreter");
  });
  
});
