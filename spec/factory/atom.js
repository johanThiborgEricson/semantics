/**
 * @name atomUnitTests
 */
describe("An atom", function() {
  
  var interpreter;
  var f;
  var add = function(a, b) {
    return a+b;
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {};
  });
  
  it("can parse the empty string", function() {
    interpreter.e = f.atom(/(:?)/);
    
    expect(interpreter.e("")).toBe("");
  });
  
  it("can parse a regExp", function() {
    interpreter.abc = f.atom(/abc/);
    
    expect(interpreter.abc("abc")).toBe("abc");
  });
  
  it("can be parsed at any point", function() {
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.ab = f.group("a", "b", add);
    
    expect(interpreter.ab("ab")).toBe("ab");
  });
  
  it("returns the match if no interpretation is supplied", function() {
    interpreter.a = f.atom(/a/);
    
    expect(interpreter.a("a")).toBe("a");
  });
  
  it("fails if the regular expression can't be matched", function() {
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.ab = f.or("a", "b");
    expect(interpreter.ab("b")).toBe("b");
  });
  
  it("calls its interpretation with the match", function() {
    var aSpy = jasmine.createSpy("aSpy");
    interpreter.a = f.atom(/a/, aSpy);
    
    interpreter.a("a");
    
    expect(aSpy).toHaveBeenCalledWith("a");
  });
  
  it("calls its interpretation as a method of the interpreter", function() {
    interpreter.readChar = f.atom(/./, function(aChar) {
      this.theChar = aChar;
    });
    
    interpreter.readChar("a");
    
    expect(interpreter.theChar).toBe("a");
  });
  
  it("returns the result of its interpretation", function() {
    interpreter.a = f.atom(/a/, function() {
      return "result of interpretation";
    });
    
    expect(interpreter.a("a")).toBe("result of interpretation");
  });
  
  it("only accepts matches at the current position in the code", function() {
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.bb = f.group("b", "b", add);
    interpreter.ab = f.group("a", "b", add);
    interpreter.bbab = f.or("bb", "ab");
    
    expect(interpreter.bbab("ab")).toBe("ab");
  });
  
});