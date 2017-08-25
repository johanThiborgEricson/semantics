describe("Head recursion", function() {
  
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
    interpreter.b = f.atom(/b/);
    interpreter.baaa = f.or("baaa1", "b");
    interpreter.baaa1 = f.group("baaa", "a", add);
    interpreter.emptyCounter = f.empty((function() {
      var i = 1;
      return function() {
        return "e" + i++;
      };
      
    })());
    
  });
  
  it("can find a base case after a recursive case", function() {
    expect(interpreter.baaa("b")).toBe("b");
  });
  
  it("can recurse once", function() {
    expect(interpreter.baaa("ba")).toBe("ba");
  });
  
  it("can recurse twice", function() {
    expect(interpreter.baaa("baa")).toBe("baa");
  });
  
  it("can have empty base cases", function() {
    interpreter.as = f.or("as0", "emptyCounter");
    interpreter.as0 = f.group("as", "a", add);

    expect(interpreter.as("")).toBe("e1");
  });
  
  it("doesn't recurse if the definition isn't recursive", function() {
    var calls = 0;
    interpreter.emptyCallCounter = f.empty(function() {
      calls++;
    });
    
    interpreter.or = f.or("emptyCallCounter");
    
    interpreter.or("");
    
    expect(calls).toBe(1);
  });
  
  it("creates new base cases for each consequtive head recursion", function() {
    interpreter.as = f.or("as0", "emptyCounter");
    interpreter.as0 = f.group("as", "a", add);
    interpreter.as3 = f.group("as", "as", "as", 
    function(as1, as2, as3) {
      return as1+as2+as3;
    });
    
    expect(interpreter.as3("")).toBe("e1e2e3");
  });
  
  it("can have many heads at the same position in the code", function() {
    interpreter.bsas = f.or("bsas0", "bs");
    interpreter.bsas0 = f.group("bsas", "a", add);
    interpreter.bs = f.or("bs0", "emptyCounter");
    interpreter.bs0 = f.group("bs", "b", add);
    
    expect(interpreter.bsas("a")).toBe("e1a");
  });
  
  it("can start at any point in the code", function() {
    interpreter.bas = f.group("b", "as", add);
    interpreter.as = f.or("as0", "emptyCounter");
    interpreter.as0 = f.group("as", "a", add);
    
    expect(interpreter.bas("ba")).toBe("be1a");
  });
  
  it("can't parse a base case several times", function() {
    interpreter.bas = f.or("bas0", "bBaseCase");
    interpreter.bas0 = f.group("bas", "a", add);
    interpreter.bBaseCase = f.atom(/b/, function() {
      return "base";
    });
    
    interpreter.program = f.group("bas", "b", add);
    
    expect(interpreter.program("bb")).toBe("baseb");
  });
  
  it("isn't attempted if no recursion is detected", function() {
    spyOn(console, "log");
    interpreter.ab = f.or("a", "b");
    
    interpreter.ab("b", true);
    
    expect(console.log).not.toHaveBeenCalledWith(
      "Reparsing with found %s", "ab");
  });
});
