describe("A wrapper", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
    };
    
  });
  
  it("calls its interpretation with the result of its part", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.wrap = f.wrap("a", interpretation);
    
    interpreter.wrap("a");
    
    expect(interpretation).toHaveBeenCalledWith("a");
  });
  
  it("calls its interpretation as a method", function() {
    interpreter.charEater = f.wrap("a", function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.charEater("a");
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("calls its part as a method", function() {
    interpreter = {
      wrapper: f.wrap("charEater", function() {}),
      charEater: f.atom(/./, function(theChar) {
        this.eatenChar = theChar;
      }),
      
    };
    
    interpreter.wrapper("a");
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
});
