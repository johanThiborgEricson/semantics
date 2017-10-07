/**
 * @name methodFactoryUnitTests
 */
describe("A method factory", function() {
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      
    };
  });
  
  it("can be called", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.instruction = f.atom(/a/, interpretation);
    interpreter.deferrer = f.methodFactory("instruction");
    var callable = interpreter.deferrer("a");
    
    expect(interpretation).not.toHaveBeenCalled();
    callable();
    expect(interpretation).toHaveBeenCalled();
  });
  
  it("fails to parse if its part fails to parse", function() {
    interpreter.ab = f.group("deferredA", "b");
    interpreter.b = f.atom(/b/);
    interpreter.a = f.atom(/a/);
    interpreter.deferredA = f.methodFactory("a");
    interpreter.program = f.or("ab", "b");
    
    expect(interpreter.program("b")).toBe("b");
  });
  
  it("makes a method", function() {
    interpreter.charEater = f.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.methodFactory = f.methodFactory("charEater");
    interpreter.method = interpreter.methodFactory("a");
    interpreter.method();
    
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("makes a method that can be a property of any object", function() {
    interpreter.charEater = f.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.methodFactory = f.methodFactory("charEater");
    var o = {
      method: interpreter.methodFactory("a"),
    };
    
    o.method();
    
    expect(o.eatenChar).toBe("a");
  });
  
  it("returns the result of its part", function() {
    interpreter.a = f.atom(/a/);
    interpreter.methodFactory = f.methodFactory("a");
    interpreter.method = interpreter.methodFactory("a");
    
    expect(interpreter.method()).toBe("a");
  });
  
});
