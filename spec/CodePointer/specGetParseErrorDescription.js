describe("CodePointer.getParseErrorDescription()", function() {
  it("tells what it expected and what it saw", function() {
    var codePointer = CodePointer("ab");
    codePointer.parse(/a/);
    codePointer.parse(/c/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^c/ to match 'b'.");
  });
  
  it("ignores calls with longer actuall code", function(){
    var codePointer = CodePointer("abc");
    codePointer.parse(/a/);
    var backup = codePointer.backup();
    codePointer.parse(/b/);
    codePointer.parse(/d/);
    codePointer.restore(backup);
    codePointer.parse(/e/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^d/ to match 'c'.");
  });
  
  it("remembers calls with actuall code of equal length (for alternatives)", 
  function(){
    var codePointer = CodePointer("ab");
    codePointer.parse(/a/);
    codePointer.parse(/c/);
    codePointer.parse(/d/);
    expect(codePointer.getParseErrorDescription())
    .toEqual("Expected /^c|d/ to match 'b'.");
  });
  
  it("forgets remembered token if called with shorter actuall code", 
  function(){
    var codePointer = CodePointer("abc");
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
