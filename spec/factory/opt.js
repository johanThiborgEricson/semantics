describe("The question mark quantifier", function() {
  
  var f = new InterpreterMethodFactory();
  var i;
  
  beforeEach(function() {
    i = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      ar: f.atom(/a/, function() {
        return "the result";
      }),
      
    };

  });
  
  it("matches its part once", function() {
    i.maybeA = f.opt("a");
    
    expect(function() {
      i.maybeA("a");
    }).not.toThrow();
    
  });
  
 it("matches the empty string", function() {
    i.maybeA = f.opt("a");
    i.ab = f.group("maybeA", "b", function() {});
    
    expect(function() {
      i.ab("b");
    }).not.toThrow();
    
  });
  
  it("returns the result of its part", function() {
    i.maybeA = f.opt("ar");
    
    expect(i.maybeA("a")).toBe("the result");
  });
  
  it("returns the result of its interpretation if it didn't match", function() {
    i.maybeA = f.opt("a", function() {
      return "the default value";
    });
    
    expect(i.maybeA("")).toBe("the default value");
  });
  
  it("returns undefined it didn't match and no interpretation is supplied", 
  function() {
    i.maybeA = f.opt("a");
    
    expect(i.maybeA("")).toBe(undefined);
  });
  
  it("calls its part as a method of the interpreter", function() {
    i.charEater = f.atom(/./, function(char) {
      this.theChar = char;
    });
    
    i.opt = f.opt("charEater");
    
    i.opt("a");
    
    expect(i.theChar).toBe("a");
  });
  
  it("calls its interpretation as a method of the interpreter", function() {
    i.opt = f.opt("a", function() {
      this.side = "effect";
    });
    
    i.opt("");
    
    expect(i.side).toBe("effect");
  });
  
});