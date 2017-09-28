describe("A parse error description", function() {
  
  it("can report a parse error at the begining of the code", function() {
    var codePointer = new CodePointer("a");
    codePointer.parse(/b/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected\na\n^\nto match /b/");
  });
  
  it("might report two parse errors", function() {
    var codePointer = new CodePointer("a");
    codePointer.parse(/b/);
    codePointer.parse(/c/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected\na\n^\nto match /b/ or /c/");
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
