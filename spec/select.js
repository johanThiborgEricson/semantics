describe("A selection", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
    };
    
  });
  
  describe("if zero is selected", function() {
    it("returns an array", function() {
      interpreter.noChoice = f.select(0);
      
      expect(interpreter.noChoice("")).toEqual([]);
    });
    
    it("returns the results of its parts", function() {
      interpreter.noChoice = f.select(0, "a", "b");
      
      expect(interpreter.noChoice("ab")).toEqual(["a", "b"]);
    });
    
  });
  
  it("calls its parts as methods of the interpreter", function() {
    interpreter.charEater = f.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.select = f.select(0, "charEater");
    interpreter.select("c");
    
    expect(interpreter.eatenChar).toBe("c");
  });
  
});
