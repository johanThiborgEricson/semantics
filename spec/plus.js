describe("A plus quantifier", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var id = function(x) {
    return x;
  };
  
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      ap: f.plus("a"),
      b: f.atom(/b/),
      ab: f.atom(/[ab]/),
      abp: f.plus("ab"),
      abc: f.atom(/a|b|c/),
      list: f.star("abc", /,/),
    };
    
  });
  
  
  it("fails if no part can be matched", function() {
    interpreter.apb = f.group("ap", "b");
    interpreter.program = f.or("apb", "b");
    expect(interpreter.program("b")).toBe("b");
  });
  
  it("returns an array with a single match if there is one", function() {
    expect(interpreter.ap("a")).toEqual(["a"]);
  });
  
  it("returns an array of the results of its parts", function() {
    expect(interpreter.abp("ab")).toEqual(["a", "b"]);
  });
  
  it("doesn't leave a part half parsed", function() {
    interpreter.ab = f.group("a", "b", add);
    interpreter.abp = f.plus("ab");
    interpreter.abpa = f.group("abp", "a");
    
    var expected = {
      abp:["ab", "ab"], 
      a:"a"};
    
    expect(interpreter.abpa("ababa")).toEqual(expected);
  });
  
  it("can interpret the results of its parts", function() {
    var abSpy = jasmine.createSpy("abSpy");
    interpreter.abp = f.plus("ab", abSpy);
    
    interpreter.abp("ab");
    
    expect(abSpy).toHaveBeenCalledWith(["a", "b"]);
  });
  
  it("calls the interpretation as a method of the interpreter", function() {
    interpreter.abp = f.plus("ab", function(abp) {
      this.first = abp[0];
      this.second = abp[1];
    });
    
    interpreter.abp("ab");
    
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
