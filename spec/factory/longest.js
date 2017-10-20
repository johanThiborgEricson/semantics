/**
 * @name longestUnitTests
 */
describe("The longest nonterminal", function() {
  
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
    };
    
  });
  
  it("always fails if it has no options", function() {
    interpreter.noOtherOptions = f.longest();
    interpreter.program = f.or("noOtherOptions", "a");
    
    expect(interpreter.program("a")).toBe("a");
  });
  
  it("returns its only alternative if it matches", function() {
    interpreter.longest = f.longest("a");
    
    expect(interpreter.longest("a")).toBe("a");
  });
  
  it("returns the second alternative if the first fails", function() {
    interpreter.longest = f.longest("a", "b");
    
    expect(interpreter.longest("b")).toBe("b");
  });
  
  it("returns the first alternative if the second one fails", function() {
    interpreter.longest = f.longest("a", "b");
    interpreter.program = f.group("longest", "b");
    
    expect(interpreter.program("ab")).toEqual({longest: "a", b: "b"});
  });
  
  it("continues matching from the end of the longest match, not the last " + 
  "match", function() {
    interpreter = {
      a: f.terminal(/a/),
      aa: f.terminal(/aa/),
      longest: f.longest("aa", "a"),
      program: f.group("longest", "a"),
    };
    
    expect(interpreter.program("aaa")).toEqual(
      {
        longest: "aa",
        a: "a",
      });
  });
  
  it("returns the longest match", function() {
    interpreter = {
      a: f.terminal(/a/),
      ab: f.terminal(/ab/),
      longest: f.longest("a", "ab"),
    };
    
    expect(interpreter.longest("ab")).toBe("ab");
  });
  
  it("returns the first match if there are two equaly long ones", function() {
    interpreter.first = f.terminal(/a|b/, function() {
      return "first";
    });
    
    interpreter.second = f.terminal(/b|c/, function() {
      return "second";
    });
    
    interpreter.longest = f.longest("first", "second");
    
    expect(interpreter.longest("b")).toBe("first");
  });
  
});
