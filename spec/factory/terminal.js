/**
 * @name terminalUnitTests
 */
describe("A terminal", function() {
  
  var interpreter;
  var f;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
    };
  });
  
  it("can parse the empty string", function() {
    interpreter.e = f.terminal(/(:?)/);
    
    expect(interpreter.e("")).toBe("");
  });
  
  it("can parse a regExp", function() {
    interpreter.abc = f.terminal(/abc/);
    expect(interpreter.abc("abc")).toBe("abc");
  });
  
  it("can be parsed at any point", function() {
    interpreter.ab = f.group("a", "b");
    expect(interpreter.ab("ab")).toEqual({a: "a", b: "b"});
  });
  
  it("returns the match if no interpretation is supplied", function() {
    expect(interpreter.a("a")).toBe("a");
  });
  
  it("fails if the regular expression can't be matched", function() {
    interpreter.ab = f.or("a", "b");
    expect(interpreter.ab("b")).toBe("b");
  });
  
  it("calls its interpretation with the match", function() {
    var aSpy = jasmine.createSpy("aSpy");
    interpreter.a = f.terminal(/a/, aSpy);
    interpreter.a("a");
    expect(aSpy).toHaveBeenCalledWith("a");
  });
  
  it("calls its interpretation as a method of the interpreter", function() {
    interpreter.readChar = f.terminal(/./, function(aChar) {
      this.theChar = aChar;
    });
    
    interpreter.readChar("a");
    expect(interpreter.theChar).toBe("a");
  });
  
  it("returns the result of its interpretation", function() {
    interpreter.a = f.terminal(/a/, function() {
      return "result of interpretation";
    });
    
    expect(interpreter.a("a")).toBe("result of interpretation");
  });
  
  it("only accepts matches at the current position in the code", function() {
    interpreter.bb = f.group("b", "b");
    interpreter.ab = f.group("a", "b");
    interpreter.bbab = f.or("bb", "ab");
    expect(interpreter.bbab("ab")).toEqual({a: "a", b: "b"});
  });
  
});