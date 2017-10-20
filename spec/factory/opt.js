/**
 * @name optUnitTests
 */
describe("The question mark quantifier", function() {
  
  var f;
  var i;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    i = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
      ar: f.terminal(/a/, function() {
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
  
  it("returns the result of its interpretation if it didn't match", 
  function() {
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
    i.charEater = f.terminal(/./, function(char) {
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
