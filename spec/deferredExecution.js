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
  
});
