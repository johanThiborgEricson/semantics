describe("An atom", function() {
  
  var interpreter;
  var f = new InterpreterMethodFactory();
  
  beforeEach(function() {
    interpreter = {};
  });
  
  it("can parse the empty string", function() {
    interpreter.e = f.atom(/(:?)/);
    
    expect(function() {
      interpreter.e("");
    }).not.toThrow();
  });
  
  it("can parse a regExp", function() {
    interpreter.abc = f.atom(/abc/);
    
    expect(function() {
      interpreter.abc("abc");
    }).not.toThrow();
    
  });
  
  it("can be parsed at any point", function() {
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.ab = f.group("a", "b");
    
    expect(function() {
      interpreter.ab("ab");
    }).not.toThrow();
    
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
    
    expect(function() {
      interpreter.a("b");
    }).toThrowError("Expected /^a/ to match 'b'.");
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
    interpreter.b = f.atom(/b/);
    interpreter.bb = f.group("b", "b");
    
    expect(function() {
      interpreter.bb("ab");
    }).toThrowError("Expected /^b/ to match 'ab'.");
  });
  
});