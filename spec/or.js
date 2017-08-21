describe("An or", function() {
  var f = new InterpreterMethodFactory();
  var i;
  var id = function(x) {
    return x;
  };
  
  beforeEach(function() {
    i = {};
    i.a = f.atom(/a/);
    i.b = f.atom(/b/);
    i.c = f.atom(/c/);
  });
  
  it("returns the first successfully parsed alternative", function() {
    i.da = f.or("a");
    
    expect(i.da("a")).toBe("a");
  });
  
  it("expects at least one alternative", function() {
    var eString = "An or needs at least one alternative.";
    expect(function() {
      f.or();
    }).toThrowError(eString);
  });
  
  it("returns the second alternative if the first fails to parse", function() {
    i.dba = f.or("b", "a");
    expect(i.dba("a")).toBe("a");
  });
  
  it("returns the third alternative if the first two alternatives fails to " + 
  "parse", function() {
    i.dba = f.or("b", "b", "a");
    expect(i.dba("a")).toBe("a");
  });
  
  it("fails if all its alternatives fail", function() {
    
    i.outerOr = f.or("dab", "c");
    i.dab = f.or("a", "b");

    expect(i.outerOr("c")).toBe("c");
  });
  
});
