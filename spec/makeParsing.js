describe("The make parsing method transforms a regex so that it", function() {
  
  var f = new InterpreterMethodFactory();
  
  it("matches the beginning of a string", function() {
    expect(f.makeParsing(/a/).exec("a")[0]).toBe("a");
  });
  
  it("doesn't match further down the line", function() {
    expect(f.makeParsing(/a/).exec("ba")).toBe(null);
  });
  
  it("accepts regexes with set flags", function() {
    expect(f.makeParsing(/a/gim).exec("a")[0]).toBe("a");
  });
  
  it("may contain flaglike classes", function() {
    expect(f.makeParsing(/[/g\n]/).exec("g")[0]).toBe("g");
  });
  
});
