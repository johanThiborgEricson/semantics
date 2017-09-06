describe("A star quantifier", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var id = function(x) {
    return x;
  };
  
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    interpreter = {};
    interpreter.a = f.atom(/a/);
    interpreter.as = f.star("a");
    interpreter.b = f.atom(/b/);
    interpreter.ab = f.atom(/[ab]/);
    interpreter.abs = f.star("ab");
    interpreter.abc = f.atom(/a|b|c/);
    interpreter.list = f.star("abc", /,/);
  });
  
  
  it("returns an empty array when called with an empty string", function() {
    expect(interpreter.as("")).toEqual([]);
  });
  
  it("returns an array with a single match if there is one", function() {
    expect(interpreter.as("a")).toEqual(["a"]);
  });
  
  it("returns an array of the results of its parts", function() {
    expect(interpreter.abs("ab")).toEqual(["a", "b"]);
  });
  
  xit("doesn't leave a part half parsed", function() {
    interpreter.ab = f.group("a", "b", add);
    interpreter.abs = f.star("ab");
    interpreter.absa = f.group("abs", "a");
    
    var expected = {
      abs:["ab", "ab"], 
      a:"a"};
    
    expect(interpreter.absa("ababa")).toEqual(expected);
  });
  
  it("can interpret the results of its parts", function() {
    var abSpy = jasmine.createSpy("abSpy");
    interpreter.abs = f.star("ab", abSpy);
    
    interpreter.abs("ab");
    
    expect(abSpy).toHaveBeenCalledWith(["a", "b"]);
  });
  
  it("calls the interpretation as a method of the interpreter", function() {
    interpreter.abs = f.star("ab", function(abs) {
      this.first = abs[0];
      this.second = abs[1];
    });
    
    interpreter.abs("ab");
    
    expect(interpreter.first).toBe("a");
    expect(interpreter.second).toBe("b");
  });
  
  it("skips delimiters", function() {
    expect(interpreter.list("a,b,c")).toEqual(["a", "b", "c"]);
  });
  
  it("doesn't skip a delimiter if there is only one element", function() {
    expect(interpreter.list("a")).toEqual(["a"]);
  });
  
  it("doesn't parse a trailing delimiter", function() {
    interpreter.program = f.group("list", /,/);
    
    expect(interpreter.program("a,")).toEqual({list: ["a"]});
  });
  
  it("always parse delimiters between parts", function() {
    interpreter.program = f.group("ablist", /b/);
    interpreter.ablist = f.star("ab", /,/);
    
    expect(interpreter.program("ab")).toEqual({ablist:["a"]});
  });
  
});
