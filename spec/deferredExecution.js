describe("A deferred execution", function() {
  var factory = new InterpreterMethodFactory();
  it("can be called later", function() {
    var interpreter = {};
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.instruction = factory.atom(/a/, interpretation);
    interpreter.deferrer = factory.deferredExecution("instruction");
    var callable = interpreter.deferrer("a");
    
    expect(interpretation).not.toHaveBeenCalled();
    callable();
    expect(interpretation).toHaveBeenCalled();
  });
  
  it("fails to parse if its part fails to parse", function() {
    var interpreter = {};
    interpreter.ab = factory.group("deferredA", "b");
    interpreter.b = factory.atom(/b/);
    interpreter.a = factory.atom(/a/);
    interpreter.deferredA = factory.deferredExecution("a");
    interpreter.program = factory.or("ab", "b");
    
    expect(interpreter.program("b")).toBe("b");
  });
  
});
