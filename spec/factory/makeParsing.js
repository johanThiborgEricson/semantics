describe("The make parsing method transforms a regex so that it", function() {
  
  var f;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
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
  
  it("may ignore case", function() {
    expect(f.makeParsing(/a/i).exec("A")[0]).toBe("A");
  });
  
  it("may not be multiline, until someone prove me wrong", function() {
    expect(f.makeParsing(/a/m).exec("b\na")).toBe(null);
  });
  
  it("may not be global", function() {
    var parsingRegex = f.makeParsing(/./g);
    expect(parsingRegex.exec("ab")[0]).toBe("a");
    expect(parsingRegex.exec("ab")[0]).toBe("a");
  });
  
  it("might explicitly begin at beginning", function() {
    expect(f.makeParsing(/^a/).exec("a")[0]).toBe("a");
  });
  
  it("might contain inversed classes", function() {
    expect(f.makeParsing(/[^a]/).exec("b")[0]).toBe("b");
  });
  
  it("might match hats", function() {
    expect(f.makeParsing(/\^/).exec("^")[0]).toBe("^");
  });
  
  it("can match lines beginning with hats", function() {
    expect(f.makeParsing(/\n\^/).exec("\n^")[0]).toBe("\n^");
  });
  
});
