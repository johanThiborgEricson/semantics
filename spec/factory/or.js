/**
 * @name orUnitTests
 */
describe("An or", function() {
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
      c: f.terminal(/c/),
    };

  });
  
  it("returns the first successfully parsed alternative", function() {
    interpreter.da = f.or("a");
    
    expect(interpreter.da("a")).toBe("a");
  });
  
  it("always fails if it has zero alternatives", function() {
    interpreter.noChoice = f.or();
    interpreter.choice = f.or("noChoice", "a");
    expect(interpreter.choice("a")).toBe("a");
  });
  
  it("returns the second alternative if the first fails to parse", function() {
    interpreter.dba = f.or("b", "a");
    expect(interpreter.dba("a")).toBe("a");
  });
  
  it("returns the third alternative if the first two alternatives fails to " + 
  "parse", function() {
    interpreter.dba = f.or("b", "b", "a");
    expect(interpreter.dba("a")).toBe("a");
  });
  
  it("fails if all its alternatives fail", function() {
    interpreter.outerOr = f.or("dab", "c");
    interpreter.dab = f.or("a", "b");
    expect(interpreter.outerOr("c")).toBe("c");
  });
  
  it("may have a fallback interpretation", function() {
    var spy = jasmine.createSpy("empty");
    interpreter.empty = f.or(spy);
    interpreter.empty("");
    expect(spy).toHaveBeenCalled();
  });
  
  it("calls its fallback interpretation as a method of the interpreter", 
  function() {
    interpreter.setup = f.or(function() {
      this.side = "effect";
    });
    
    interpreter.setup("");
    expect(interpreter.side).toBe("effect");
  });
  
});
