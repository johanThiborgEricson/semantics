describe("A parse error description", function() {
  
  it("can report a parse error at the begining of the code", function() {
    var codePointer = new CodePointer("a");
    codePointer.parse(/b/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\na\n^\nto match /b/");
  });
  
  it("might report two parse errors", function() {
    var codePointer = new CodePointer("a");
    codePointer.parse(/b/);
    codePointer.parse(/c/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\na\n^\nto match /b/ or /c/");
  });
  
  it("might report many parse errors", function() {
    var codePointer = new CodePointer("a");
    codePointer.parse(/b/);
    codePointer.parse(/c/);
    codePointer.parse(/d/);
    codePointer.parse(/e/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\na\n^\nto match /b/, /c/, /d/ or /e/");
  });
  
  it("falls back to a generic message if nothing is parsed", function() {
    var codePointer = new CodePointer("");
    expect(codePointer.getParseErrorDescription())
    .toBe("Parse error");
  });
  
  it("can occure on the first line", function() {
    var codePointer = new CodePointer("ab");
    codePointer.parse(/a/);
    codePointer.parse(/c/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\nab\n ^\nto match /c/");
  });
  
  it("can occure at the last line", function() {
    var codePointer = new CodePointer("a\nbc");
    codePointer.parse(/a\n/);
    codePointer.parse(/b/);
    codePointer.parse(/d/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\nbc\n ^\nto match /d/");
  });
  
  it("can occure at an intermediate line", function() {
    var codePointer = new CodePointer("a\nb\nc");
    codePointer.parse(/a\n/);
    codePointer.parse(/c/);
    expect(codePointer.getParseErrorDescription())
    .toBe("Expected\nb\n^\nto match /c/");
  });
  
  xit("ignores calls with longer actuall code", function(){
    var codePointer = new CodePointer("abc");
    codePointer.parse(/a/);
    var backup = codePointer.backup();
    codePointer.parse(/b/);
    codePointer.parse(/d/);
    codePointer.restore(backup);
    codePointer.parse(/e/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^d/ to match 'c'.");
  });
  
  xit("remembers calls with actuall code of equal length (for alternatives)", 
  function(){
    var codePointer = new CodePointer("ab");
    codePointer.parse(/a/);
    codePointer.parse(/c/);
    codePointer.parse(/d/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^c|d/ to match 'b'.");
  });
  
  xit("forgets remembered token if called with shorter actuall code", 
  function(){
    var codePointer = new CodePointer("abc");
    codePointer.parse(/a/);
    var backup = codePointer.backup();
    codePointer.parse(/e/);
    codePointer.restore(backup);
    codePointer.parse(/b/);
    codePointer.parse(/d/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^d/ to match 'c'.");
  });
  
});
