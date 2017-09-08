describe("The longest nonterminal", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
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
    interpreter.program = f.group("longest", "b", add);
    
    expect(interpreter.program("ab")).toBe("ab");
  });
  
  it("returns the longest match", function() {
    interpreter = {
      a: f.atom(/a/),
      ab: f.atom(/ab/),
      abc: f.atom(/abc/),
      longest: f.longest("a", "abc", "ab"),
    };
    
    expect(interpreter.longest("abc")).toBe("abc");
  });
  
  it("returns the first match if there are two equaly long ones", function() {
    interpreter.first = f.atom(/a|b/, function() {
      return "first";
    });
    
    interpreter.second = f.atom(/b|c/, function() {
      return "second";
    });
    
    interpreter.longest = f.longest("first", "second");
    
    expect(interpreter.longest("b")).toBe("first");
  });
  
});
