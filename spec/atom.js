describe("An atom", function() {
  
  var interpreter;
  var f = new InterpreterMethodFactory();
  var add = function(a, b) {
    return a+b;
  };
  
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
  
  it("returns the full match if there are no capturing groups", function() {
    interpreter.a = f.atom(/a/);
    
    expect(interpreter.a("a")).toBe("a");
  });
  
  it("returns the matching group, if there is only one", function() {
    interpreter.a = f.atom(/padding(a)padding/);
    
    expect(interpreter.a("paddingapadding")).toBe("a");
  });
  
  it("returns an array with all the matched groups, if there are many", 
  function() {
    interpreter.abc = f.atom(/pad(a)pad(b)pad(c)pad/);
    
    expect(interpreter.abc("padapadbpadcpad")).toEqual(["a", "b", "c"]);
  });
  
  it("fails if the regular expression can't be matched", function() {
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.ab = f.or("a", "b");
    expect(interpreter.ab("b")).toBe("b");
  });
  
  it("calls its interpretation with its matching groups and the full match", 
  function() {
    var abSpy = jasmine.createSpy("abSpy");
    interpreter.ab = f.atom(/pad(a)pad(b)pad/, abSpy);
    
    interpreter.ab("padapadbpad");
    
    expect(abSpy).toHaveBeenCalledWith("a", "b", "padapadbpad");
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