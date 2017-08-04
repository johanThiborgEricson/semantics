describe("Debugging messages", function() {
  it("can be turned on", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.m = factory.terminal(/text/, function() {});
    factory.debugging = true;
    interpreter.m("text");
    
    expect(console.log).toHaveBeenCalled();
  });
  
  it("is turned off by default", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.m = factory.terminal(/text/, function() {});
    interpreter.m("text");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
});
