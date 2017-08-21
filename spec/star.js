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
    
    expect(abSpy).toHaveBeenCalledWith(["a", "b"]);
  });
  
  it("the interpretation is called as a method of the interpreter", function() {
    interpreter.abs = f.star("ab", function(abs) {
      this.first = abs[0];
      this.second = abs[1];
    });
    
    interpreter.abs("ab");
    
    expect(interpreter.first).toBe("a");
    expect(interpreter.second).toBe("b");
  });
  
});
