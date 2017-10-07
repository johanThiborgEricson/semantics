/**
 * @name orUnitTests
 */
describe("An or", function() {
  var f;
  var i;
  var id = function(x) {
    return x;
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    i = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      c: f.atom(/c/),
    };

  });
  
  it("returns the first successfully parsed alternative", function() {
    i.da = f.or("a");
    
    expect(i.da("a")).toBe("a");
  });
  
  it("always fails if it has zero alternatives", function() {
    i.noChoice = f.or();
    i.choice = f.or("noChoice", "a");
    
    expect(i.choice("a")).toBe("a");
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
