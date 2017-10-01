describe("An error", function() {
  
  var interpreter;
  var f;
  
  beforeEach(function() {
    f = new InterpreterMethodFactory();
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
