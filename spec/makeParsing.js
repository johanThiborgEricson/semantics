describe("The make parsing method transforms a regex so that it", function() {
  
  var f = new InterpreterMethodFactory();
  
  it("matches the beginning of a string", function() {
    expect(f.makeParsing(/a/).exec("a")[0]).toBe("a");
  });
  
});
