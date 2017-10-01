describe("A star quantifier", function() {
  
  var f;
  var interpreter;
  var id = function(x) {
    return x;
  };
  
  var add = function(a, b) {
    return a+b;
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      as: f.star("a"),
      b: f.atom(/b/),
      ab: f.atom(/[ab]/),
      abs: f.star("ab"),
      abc: f.atom(/a|b|c/),
      list: f.star("abc", /,/),
    };
    
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
  
  it("doesn't leave a part half parsed", function() {
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
    
    expect(abSpy).toHaveBeenCalledWith("a", "b");
  });
  
  it("calls the interpretation as a method of the interpreter", function() {
    interpreter.abs = f.star("ab", function() {
      this.first = arguments[0];
      this.second = arguments[1];
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
