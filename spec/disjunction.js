describe("A disjunction", function() {
  var f = new InterpreterMethodFactory();
  var i;
  var id = function(x) {
    return x;
  };
  
  beforeEach(function() {
    i = {};
    i.a = f.terminal(/(a)/, id);
    i.b = f.terminal(/(b)/, id);
    i.c = f.terminal(/(c)/, id);
  });
  
  it("returns the first alternative if it was parsed successfully", function() {
    i.da = f.disjunction("a");
    
    expect(i.da("a")).toBe("a");
  });
  
  it("expects at least one alternative", function() {
    var eString = "A disjunction needs at least one alternative.";
    expect(function() {
      f.disjunction();
    }).toThrowError(eString);
  });
  
  it("returns the second alternative if the first fails to parse", function() {
    i.dba = f.disjunction("b", "a");
    expect(i.dba("a")).toBe("a");
  });
  
  it("returns the third alternative if the first two alternatives fails to " + 
  "parse", function() {
    i.dba = f.disjunction("b", "b", "a");
    expect(i.dba("a")).toBe("a");
  });
  
  it("fails if all its alternatives fail", function() {
    
    i.outerDisjunction = f.disjunction("dab", "c");
    i.dab = f.disjunction("a", "b");

    expect(i.outerDisjunction("c")).toBe("c");
  });
  
});
