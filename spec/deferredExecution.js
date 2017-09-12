describe("A deferred execution", function() {
  var factory = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      
    };
  });
  
  it("can be called later", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.instruction = factory.atom(/a/, interpretation);
    interpreter.deferrer = factory.deferredExecution("instruction");
    var callable = interpreter.deferrer("a");
    
    expect(interpretation).not.toHaveBeenCalled();
    callable();
    expect(interpretation).toHaveBeenCalled();
  });
  
  it("fails to parse if its part fails to parse", function() {
    interpreter.ab = factory.group("deferredA", "b");
    interpreter.b = factory.atom(/b/);
    interpreter.a = factory.atom(/a/);
    interpreter.deferredA = factory.deferredExecution("a");
    interpreter.program = factory.or("ab", "b");
    
    expect(interpreter.program("b")).toBe("b");
  });
  
  it("makes a method", function() {
    interpreter.charEater = factory.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.methodFactory = factory.deferredExecution("charEater");
    interpreter.method = interpreter.methodFactory("a");
    interpreter.method();
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("makes a method that can be a property of any object", function() {
    interpreter.charEater = factory.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.methodFactory = factory.deferredExecution("charEater");
    var o = {
      method: interpreter.methodFactory("a"),
    };
    
    o.method();
    
    expect(o.eatenChar).toBe("a");
  });
  
  it("returns the result of its part", function() {
    interpreter.a = factory.atom(/a/);
    interpreter.methodFactory = factory.deferredExecution("a");
    interpreter.method = interpreter.methodFactory("a");
    
    expect(interpreter.method()).toBe("a");
  });
  
});
