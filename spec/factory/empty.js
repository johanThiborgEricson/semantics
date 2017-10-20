/**
 * @name emptyUnitTests
 */
describe("The empty string terminal", function() {
  var interpreter;
  var f;
  var noop = function() {};
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {};
  });
  
  it("parses nothing successfully", function() {
    interpreter.e = f.empty(noop);
    
    expect(function() {
      interpreter.e("");
    }).not.toThrow();
  });
  
  it("expects to get an interpretation", function() {
    expect(function() {
      f.empty();
    }).toThrowError(
      "The empty string terminal should be called with a function");
  });
  
  it("calls its interpretation with zero arguments and returns the result", 
  function() {
    var emptySpy = jasmine.createSpy("emptySpy")
    .and.returnValue("interpretation result");
    interpreter.e = f.empty(emptySpy);
    
    expect(interpreter.e("")).toBe("interpretation result");
    expect(emptySpy).toHaveBeenCalledWith();
  });
  
  it("calls its interpretation as a method on the interpreter", function() {
    interpreter.initA = f.empty(function() {
      this.a = "a";
    });
    
    interpreter.initA("");
    
    expect(interpreter.a).toBe("a");
  });
  
});
