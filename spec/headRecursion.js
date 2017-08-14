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
    interpreter.a = f.terminal(/(a)/, id);
    interpreter.b = f.terminal(/(b)/, id);
    interpreter.baaa = f.disjunction("baaa1", "b");
    interpreter.baaa1 = f.nonTerminalSequence("baaa", "a", add);
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
  
});
